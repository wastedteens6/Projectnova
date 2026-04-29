import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ─── Razorpay initialization ──────────────────────────────────────────────────
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized");
  } else {
    console.error("⚠️  Razorpay credentials missing in .env");
  }
} catch (err) {
  console.error("❌ Razorpay init error:", err.message);
}

// ─── POST /api/checkout/create-order ─────────────────────────────────────────
// Production flow:
//   1. Create Order in our DB with status='pending'
//   2. Create Razorpay order
//   3. Return Razorpay order_id to frontend
//   4. Frontend opens Razorpay UI
//   5. On success → /verify-payment (signature check + mark 'verified')
//   6. Webhook payment.captured → marks 'paid' (final truth)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create-order", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, projectIds, phone, tier, tierLevel } = req.body;
    const userId = req.userId;

    if (!amount || !projectIds || !phone) {
      return res.status(400).json({ error: "Missing required fields: amount, projectIds, phone" });
    }
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: "projectIds must be a non-empty array" });
    }

    if (!razorpay) {
      return res.status(503).json({
        error: "Payment unavailable",
        message: "Razorpay is not configured. Contact support.",
      });
    }

    // 1. Create Razorpay order first (so we have the razorpay_order_id for our DB record)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount), // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: String(userId), projectIds: JSON.stringify(projectIds), phone },
    });

    await client.query("BEGIN");

    // 2. Create a pending Order in our DB (one row per project in the cart)
    const insertedIds = [];
    for (const projectId of projectIds) {
      const result = await client.query(
        `INSERT INTO "Order" (
          user_id, project_id, type, status,
          amount_in_paise, razorpay_order_id, payment_info
        ) VALUES ($1, $2, $3, 'pending', $4, $5, $6)
        RETURNING id`,
        [
          userId,
          projectId,
          "purchase",
          Math.round(amount),
          rzpOrder.id,
          JSON.stringify({ tier: tier || null, tierLevel: tierLevel || null, phone, provider: "razorpay" }),
        ]
      );
      insertedIds.push(result.rows[0].id);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      orderId: rzpOrder.id,         // Razorpay order ID for the frontend
      internalOrderIds: insertedIds, // Our internal DB IDs
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ create-order failed:", err);
    res.status(500).json({ error: "Order creation failed", details: err.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/checkout/verify-payment ───────────────────────────────────────
// Called by frontend immediately after Razorpay success callback.
// Purpose: verify signature + mark order 'verified' (not yet 'paid').
// FINAL 'paid' status comes from the webhook (payment.captured).
// If webhook is not set up, we also mark 'paid' here as a fallback.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-payment", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      projectIds,
      tier,
      tierLevel,
      price,
    } = req.body;

    const userId = req.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    // 1. Verify Razorpay signature (CRITICAL — never skip)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      console.warn(`⚠️  Invalid payment signature for order ${razorpay_order_id}`);
      return res.status(400).json({ error: "Invalid payment signature — payment rejected" });
    }

    await client.query("BEGIN");

    // 2. Idempotency — if this order_id is already verified, return the existing record
    const existing = await client.query(
      `SELECT id FROM "Order" WHERE razorpay_order_id = $1 AND user_id = $2 AND status IN ('verified', 'paid') LIMIT 1`,
      [razorpay_order_id, userId]
    );
    if (existing.rows.length > 0) {
      await client.query("COMMIT");
      return res.json({
        success: true,
        message: "Payment already verified (idempotent)",
        id: existing.rows[0].id,
      });
    }

    // 3. Find the pending order(s) for this razorpay_order_id
    const pendingOrders = await client.query(
      `SELECT id FROM "Order" WHERE razorpay_order_id = $1 AND user_id = $2 AND status = 'pending'`,
      [razorpay_order_id, userId]
    );

    if (pendingOrders.rows.length === 0) {
      // Order may have been created but status is wrong — try to look it up broadly
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "No pending order found for this payment. It may have already been processed.",
      });
    }

    // 4. Resolve tier_id
    const targetLevel = parseInt(tierLevel, 10) || 1;
    const tierLookup = await client.query(
      `SELECT id FROM "Tier" WHERE level = $1 LIMIT 1`,
      [targetLevel]
    );
    const tierId = tierLookup.rows[0]?.id || null;

    // 5. Update all pending orders with signature and mark as 'verified'
    //    'paid' will be set by the webhook (payment.captured) — or here as fallback
    let lastId = null;
    for (const row of pendingOrders.rows) {
      await client.query(
        `UPDATE "Order"
         SET status = 'verified',
             razorpay_payment_id = $1,
             razorpay_signature = $2,
             tier_id = $3,
             payment_info = payment_info || $4,
             updated_at = NOW()
         WHERE id = $5`,
        [
          razorpay_payment_id,
          razorpay_signature,
          tierId,
          JSON.stringify({ tier: tier || null, tierLevel: targetLevel, verified_at: new Date().toISOString() }),
          row.id,
        ]
      );
      lastId = row.id;
    }

    // 6. Log to Payment table
    await client.query(
      `INSERT INTO "Payment" (order_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_event)
       VALUES ($1, $2, $3, $4, 'authorized', $5)
       ON CONFLICT (razorpay_payment_id) DO NOTHING`,
      [
        pendingOrders.rows[0].id,
        razorpay_order_id,
        razorpay_payment_id,
        Math.round((price || 0) * 100),
        JSON.stringify({ source: "verify-payment", verified_at: new Date().toISOString() }),
      ]
    );

    await client.query("COMMIT");

    console.log(`✅ Payment verified: razorpay_order=${razorpay_order_id}, payment=${razorpay_payment_id}`);

    // Note: If webhook is not configured, the order will stay 'verified' but not 'paid'.
    // The receipt/access logic should accept both 'verified' and 'paid' statuses.
    res.json({
      success: true,
      message: "Payment verified successfully",
      id: lastId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ verify-payment failed:", err);
    res.status(500).json({ error: "Payment verification failed" });
  } finally {
    client.release();
  }
});

export default router;

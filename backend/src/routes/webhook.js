import express from "express";
import crypto from "crypto";
import { pool } from "../config/database.js";

const router = express.Router();

// ─── POST /api/webhook/razorpay ───────────────────────────────────────────────
// FINAL TRUTH for all payments.
// Razorpay calls this server-to-server after every payment event.
// Configure in Razorpay Dashboard -> Webhooks:
//   URL: https://yourdomain.com/api/webhook/razorpay
//   Secret: RAZORPAY_WEBHOOK_SECRET env variable
//   Events: payment.captured, payment.failed, refund.processed
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }), // raw body required for HMAC verification
  async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // 1. Verify webhook signature
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Buffer

    try {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSig) {
        console.warn("⚠️  Invalid webhook signature — rejecting");
        return res.status(400).json({ error: "Invalid signature" });
      }
    } catch (err) {
      console.error("❌ Webhook signature verification error:", err);
      return res.status(400).json({ error: "Signature verification failed" });
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString());
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const razorpayOrderId  = event?.payload?.payment?.entity?.order_id;
    const razorpayPaymentId = event?.payload?.payment?.entity?.id;
    const eventType        = event?.event;

    console.log(`📡 Razorpay webhook: ${eventType}`, { razorpayOrderId });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ── payment.captured ────────────────────────────────────────────────────
      if (eventType === "payment.captured") {
        if (!razorpayOrderId) {
          await client.query("ROLLBACK");
          return res.status(200).json({ received: true });
        }

        // Idempotency check
        const existing = await client.query(
          `SELECT id, status FROM "Order" WHERE razorpay_order_id = $1 LIMIT 1`,
          [razorpayOrderId]
        );

        if (existing.rows.length === 0) {
          console.warn(`⚠️  Webhook: No order found for ${razorpayOrderId}`);
          await client.query("ROLLBACK");
          return res.status(200).json({ received: true, note: "Order not found" });
        }

        if (existing.rows[0].status === "paid") {
          await client.query("ROLLBACK");
          return res.status(200).json({ received: true, note: "Already processed" });
        }

        // Mark order PAID — this is the definitive truth
        await client.query(
          `UPDATE "Order" SET status = 'paid', razorpay_payment_id = $1, updated_at = NOW()
           WHERE razorpay_order_id = $2`,
          [razorpayPaymentId, razorpayOrderId]
        );

        // Log to Payment table
        await client.query(
          `INSERT INTO "Payment" (order_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_event)
           VALUES ($1, $2, $3, $4, 'captured', $5)
           ON CONFLICT (razorpay_payment_id) DO NOTHING`,
          [
            existing.rows[0].id,
            razorpayOrderId,
            razorpayPaymentId,
            event?.payload?.payment?.entity?.amount || 0,
            JSON.stringify(event),
          ]
        );

        await client.query("COMMIT");
        console.log(`✅ Webhook: Order ${existing.rows[0].id} → PAID`);
      }

      // ── payment.failed ───────────────────────────────────────────────────────
      else if (eventType === "payment.failed") {
        if (razorpayOrderId) {
          await client.query(
            `UPDATE "Order" SET status = 'failed', updated_at = NOW()
             WHERE razorpay_order_id = $1 AND status = 'pending'`,
            [razorpayOrderId]
          );

          await client.query(
            `INSERT INTO "Payment" (order_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_event)
             SELECT id, $1, $2, amount_in_paise, 'failed', $3
             FROM "Order" WHERE razorpay_order_id = $1
             ON CONFLICT (razorpay_payment_id) DO NOTHING`,
            [razorpayOrderId, razorpayPaymentId || `failed_${Date.now()}`, JSON.stringify(event)]
          );
        }
        await client.query("COMMIT");
        console.log(`❌ Webhook: Payment FAILED for order ${razorpayOrderId}`);
      }

      // ── refund.processed ────────────────────────────────────────────────────
      else if (eventType === "refund.processed") {
        const refundPaymentId = event?.payload?.refund?.entity?.payment_id;
        const refundAmount    = event?.payload?.refund?.entity?.amount || 0;

        if (refundPaymentId) {
          await client.query(
            `UPDATE "Order" SET status = 'refunded', updated_at = NOW()
             WHERE razorpay_payment_id = $1`,
            [refundPaymentId]
          );

          await client.query(
            `INSERT INTO "Payment" (order_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_event)
             SELECT id, razorpay_order_id, $1, $2, 'refunded', $3
             FROM "Order" WHERE razorpay_payment_id = $1
             ON CONFLICT (razorpay_payment_id) DO NOTHING`,
            [refundPaymentId, refundAmount, JSON.stringify(event)]
          );
        }
        await client.query("COMMIT");
        console.log(`💸 Webhook: Refund processed for payment ${refundPaymentId}`);
      }

      else {
        await client.query("ROLLBACK");
        console.log(`ℹ️  Webhook: Unhandled event: ${eventType}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Webhook processing error:", err);
      // Always return 200 so Razorpay doesn't retry indefinitely
      res.status(200).json({ received: true, error: "Internal error" });
    } finally {
      client.release();
    }
  }
);

export default router;

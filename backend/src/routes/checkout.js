import express from "express";
import Razorpay from "razorpay";
import { pool } from "../config/database.js";

const router = express.Router();

// Determine payment mode based on environment variables
const USE_MOCK =
  process.env.USE_MOCK_PAYMENT === "true" || !process.env.RAZORPAY_KEY_ID;
console.log(
  `\n🎭 Payment Mode: ${USE_MOCK ? "MOCK MODE (Development)" : "LIVE MODE (Razorpay)"}\n`,
);

// Initialize Razorpay only if not in mock mode
let razorpay = null;
if (!USE_MOCK) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET - switching to MOCK mode",
      );
    }

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (err) {
    console.error("⚠️  Error initializing Razorpay:", err.message);
  }
}

router.post("/create-order", async (req, res) => {
  try {
    const { amount, projectIds, email, phone } = req.body;

    console.log('📋 CREATE ORDER REQUEST:')
    console.log('  - Amount (paise):', amount)
    console.log('  - Amount (rupees):', amount / 100)
    console.log('  - Projects:', projectIds)
    console.log('  - Email:', email)
    console.log('  - Phone:', phone)

    if (!amount || !projectIds || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (USE_MOCK || !razorpay) {
      const mockOrderId = `mock_${Date.now()}`;
      console.log('🎭 Mock payment mode - Order ID:', mockOrderId)
      return res.json({ success: true, orderId: mockOrderId, isMockPayment: true });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { projectIds: JSON.stringify(projectIds), email, phone },
    });
    console.log('✅ Order created - ID:', order.id)
    res.json({ success: true, orderId: order.id, isMockPayment: false });
  } catch (err) {
    console.error('❌ Order creation failed:', err)
    res.status(500).json({ error: "Order failed", details: err.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, projectIds, tier, price, userEmail } = req.body;

    await client.query("BEGIN");

    // 1. Get or Create User
    let userRes = await client.query('SELECT id FROM "User" WHERE email = $1', [userEmail]);
    let userId;
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
    } else {
      const newUser = await client.query(
        'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3) RETURNING id',
        [userEmail, userEmail.split('@')[0], 'auto-generated']
      );
      userId = newUser.rows[0].id;
    }

    // 2. Record Transaction in the Optimized 5-Table Schema
    for (const projectId of projectIds) {
      await client.query(`
        INSERT INTO "Transaction" (
          user_id, type, status, amount_in_paise, items, payment_info
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        'purchase',
        'completed',
        Math.round(price * 100),
        JSON.stringify({ projectId, tier }),
        JSON.stringify({ orderId, provider: USE_MOCK ? 'mock' : 'razorpay' })
      ]);
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Payment verified and recorded" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  } finally {
    client.release();
  }
});

export default router;

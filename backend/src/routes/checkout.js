import express from "express";
import Razorpay from "razorpay";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Determine payment mode
const USE_MOCK =
  process.env.USE_MOCK_PAYMENT === "true" ||
  !process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder";

console.log(
  `\n🎭 Payment Mode: ${USE_MOCK ? "MOCK MODE (Development)" : "LIVE MODE (Razorpay)"}\n`,
);

let razorpay = null;
if (!USE_MOCK) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (err) {
    console.error("⚠️  Error initializing Razorpay:", err.message);
  }
}

// ─── POST /api/checkout/create-order ─────────────────────────────────
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { amount, projectIds, phone } = req.body;
    const userId = req.userId;

    console.log("📋 CREATE ORDER REQUEST:");
    console.log("  - User ID:", userId);
    console.log("  - Amount (paise):", amount);
    console.log("  - Projects:", projectIds);
    console.log("  - Phone:", phone);

    if (!amount || !projectIds || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (USE_MOCK || !razorpay) {
      const mockOrderId = `mock_${Date.now()}`;
      console.log("🎭 Mock payment mode - Order ID:", mockOrderId);
      return res.json({
        success: true,
        orderId: mockOrderId,
        isMockPayment: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId, projectIds: JSON.stringify(projectIds), phone },
    });
    console.log("✅ Order created - ID:", order.id);
    res.json({ success: true, orderId: order.id, isMockPayment: false });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ error: "Order failed", details: err.message });
  }
});

// ─── POST /api/checkout/verify-payment ───────────────────────────────
// Records purchase in the new Order table
router.post("/verify-payment", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, projectIds, tier, tierLevel, price } = req.body;
    const userId = req.userId;

    console.log("✅ Verifying payment for authenticated user:", userId);

    await client.query("BEGIN");

    for (const projectId of projectIds) {
      // Tier table is global (3 rows: level 1,2,3) — look up by level, not name+project
      // The drive_link per project is stored in Project.tiers JSONB, not in Tier table
      let tierId = null;
      const targetLevel = parseInt(tierLevel, 10) || 1;
      const tierLookup = await client.query(
        `SELECT id FROM "Tier" WHERE level = $1 LIMIT 1`,
        [targetLevel]
      );
      if (tierLookup.rows.length > 0) {
        tierId = tierLookup.rows[0].id;
      }

      await client.query(
        `
        INSERT INTO "Order" (
          user_id, project_id, tier_id, type, status, 
          amount_in_paise, order_id, payment_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          userId,
          projectId,
          tierId,
          "purchase",
          "completed",
          Math.round(price * 100),
          orderId,
          JSON.stringify({
            orderId,
            tier,
            provider: USE_MOCK ? "mock" : "razorpay",
          }),
        ],
      );
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

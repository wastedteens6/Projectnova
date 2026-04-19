import express from "express";
import { pool } from "../config/database.js";
import { verifyToken, verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// ─── Admin: Get all orders ───────────────────────────────────────────
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id as order_id,
        o.user_id,
        u.email,
        u.name,
        o.project_id,
        p.title as project_title,
        o.tier_id,
        t.name as tier_name,
        o.amount_in_paise,
        (o.amount_in_paise / 100.0) as amount,
        o.order_id as razorpay_order_id,
        o.status,
        o.type,
        o.created_at,
        o.updated_at
      FROM "Order" o
      LEFT JOIN "User" u ON o.user_id = u.id
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" t ON o.tier_id = t.id
      WHERE o.type = 'purchase'
      ORDER BY o.created_at DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ─── User: Get my orders ─────────────────────────────────────────────
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        o.id as order_id,
        o.project_id,
        p.title as project_title,
        p.slug,
        p.tiers,
        o.tier_id,
        tier.name as tier_name,
        tier.level as tier_level,
        o.amount_in_paise,
        (o.amount_in_paise / 100.0) as amount,
        o.order_id as razorpay_order_id,
        o.status,
        o.created_at
      FROM "Order" o
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.user_id = $1 AND o.type = 'purchase' AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `,
      [req.userId],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;

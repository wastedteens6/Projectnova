import express from "express";
import { pool } from "../config/database.js";
import { verifyToken, verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// Get all orders (Admin only)
// CRITICAL: Use centralized verifyAdminToken middleware
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    // Fetch all transactions (purchases) with user and project details
    const result = await pool.query(`
      SELECT 
        t.id as transaction_id,
        t.user_id,
        u.email,
        u.name,
        t.items->>'projectId' as project_id,
        pr.title as project_title,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as amount_in_paise,
        (t.amount_in_paise / 100.0) as amount,
        t.payment_info->>'orderId' as order_id,
        t.status,
        t.type,
        t.created_at,
        t.updated_at
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" pr ON (t.items->>'projectId')::uuid = pr.id
      WHERE t.type = 'purchase'
      ORDER BY t.created_at DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get user's orders
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        t.id as transaction_id,
        t.items->>'projectId' as project_id,
        pr.title as project_title,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as amount_in_paise,
        (t.amount_in_paise / 100.0) as amount,
        t.payment_info->>'orderId' as order_id,
        t.status,
        t.created_at
      FROM "Transaction" t
      LEFT JOIN "Project" pr ON (t.items->>'projectId')::uuid = pr.id
      WHERE t.user_id = $1 AND t.type = 'purchase'
      ORDER BY t.created_at DESC
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

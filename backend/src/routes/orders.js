import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = express.Router();

// Get all orders (Admin only)
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch all purchases with user, project, and tier details
    const result = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        u.email,
        u.name,
        p.project_id,
        pr.title as project_title,
        p.tier_id,
        t.name as tier_name,
        t.level as tier_level,
        p.amount_in_paise,
        (p.amount_in_paise / 100.0) as amount,
        p.payment_order_id,
        p.created_at,
        p.updated_at
      FROM "Purchase" p
      LEFT JOIN "User" u ON p.user_id = u.id
      LEFT JOIN "Project" pr ON p.project_id = pr.id
      LEFT JOIN "Tier" t ON p.tier_id = t.id
      ORDER BY p.created_at DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(401).json({ error: "Invalid token or failed to fetch orders" });
  }
});

// Get user's orders
router.get("/my-orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.project_id,
        pr.title as project_title,
        p.tier_id,
        t.name as tier_name,
        t.level as tier_level,
        p.amount_in_paise,
        (p.amount_in_paise / 100.0) as amount,
        p.payment_order_id,
        p.created_at
      FROM "Purchase" p
      LEFT JOIN "Project" pr ON p.project_id = pr.id
      LEFT JOIN "Tier" t ON p.tier_id = t.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `,
      [decoded.id],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(401).json({ error: "Invalid token or failed to fetch orders" });
  }
});

export default router;

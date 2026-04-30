import express from "express";
import { pool } from "../config/database.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/purchases", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id as transaction_id,
        o.user_id,
        o.project_id,
        tier.name as tier_name,
        tier.level as tier_level,
        o.amount_in_paise as price_in_paise,
        o.order_id,
        o.created_at,
        p.title as project_title,
        p.slug,
        u.email,
        u.name
      FROM "Order" o
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      LEFT JOIN "User" u ON o.user_id = u.id
      WHERE o.type = 'purchase' AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `);

    const data = result.rows.map((row) => ({
      transactionId: row.transaction_id,
      userId: row.user_id,
      userName: row.name || "Unknown",
      userEmail: row.email || "Unknown",
      projectId: row.project_id,
      projectTitle: row.project_title || "Deleted Project",
      slug: row.slug,
      tier: row.tier_name || `Tier ${row.tier_level}`,
      price: Number(row.price_in_paise || 0) / 100,
      orderId: row.order_id,
      purchaseDate: new Date(row.created_at).toLocaleDateString(),
      purchasedAt: row.created_at,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

export default router;

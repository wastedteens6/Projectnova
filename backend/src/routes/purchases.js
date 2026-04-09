import express from "express";
import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get user's purchases
router.get("/my-purchases", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id as transaction_id,
        t.items->>'projectId' as project_id,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as price_in_paise,
        t.payment_info->>'orderId' as order_id,
        t.created_at,
        p.title as project_title,
        p.slug,
        p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.type = 'purchase'
      ORDER BY t.created_at DESC
    `, [req.userId]);

    res.json({
      success: true,
      purchases: result.rows.map(row => {
          // Extract tier name from project's tiers array
          const tierLevel = parseInt(row.tier_level);
          const tierInfo = row.tiers?.find(t => t.level === tierLevel);
          return {
              ...row,
              tier_name: tierInfo?.name || `Tier ${tierLevel}`
          };
      }),
    });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// Record a new purchase (Usually called by verification logic, but keep as helper)
router.post("/record-purchase", async (req, res) => {
  try {
    const { projectId, tier, price, orderId, userEmail } = req.body;

    // Get User
    let userRes = await pool.query('SELECT id FROM "User" WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const userId = userRes.rows[0].id;

    const result = await pool.query(`
      INSERT INTO "Transaction" (
        user_id, type, status, amount_in_paise, items, payment_info
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId, 'purchase', 'completed', Math.round(price * 100),
      JSON.stringify({ projectId, tier }),
      JSON.stringify({ orderId })
    ]);

    res.status(201).json({ success: true, purchase: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to record" });
  }
});

// Check if user has purchased a project
router.get("/check-purchase/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) return res.json({ purchased: false });

    const result = await pool.query(`
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.items->>'projectId' = $2 AND t.type = 'purchase'
    `, [userId, projectId]);

    if (result.rows.length === 0) return res.json({ purchased: false });

    const trans = result.rows[0];
    const tierLevel = parseInt(trans.items?.tier);
    const tierInfo = trans.tiers?.find(t => t.level === tierLevel);

    res.json({
      purchased: true,
      tier: tierLevel,
      tierName: tierInfo?.name || `Tier ${tierLevel}`,
      price: trans.amount_in_paise,
      orderId: trans.payment_info?.orderId
    });
  } catch (err) {
    res.json({ purchased: false, error: err.message });
  }
});

export default router;

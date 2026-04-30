import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// ─── GET /api/cart — Fetch user's cart from DB ────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.project_id, c.tier, c.tier_level, c.price, c.is_upgrade, c.metadata,
              p.title AS name, p.slug,
              p.media->>'images' AS images_json
       FROM "Cart" c
       JOIN "Project" p ON p.id = c.project_id
       WHERE c.user_id = $1
       ORDER BY c.created_at ASC`,
      [req.userId]
    );

    const items = result.rows.map((row) => {
      let image = null;
      try {
        const imgs = JSON.parse(row.images_json || "[]");
        image = imgs[0] || null;
      } catch {}
      return {
        id: row.project_id,
        cartItemId: row.id,
        name: row.name,
        slug: row.slug,
        tier: row.tier,
        tierLevel: row.tier_level,
        price: row.price,
        isUpgrade: row.is_upgrade,
        image,
        ...row.metadata,
      };
    });

    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Cart GET error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ─── POST /api/cart — Add or update item in DB cart ──────────────────────────
router.post("/", async (req, res) => {
  try {
    const { projectId, tier, tierLevel, price, isUpgrade, metadata } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId required" });

    await pool.query(
      `INSERT INTO "Cart" (user_id, project_id, tier, tier_level, price, is_upgrade, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, project_id)
       DO UPDATE SET
         tier       = EXCLUDED.tier,
         tier_level = EXCLUDED.tier_level,
         price      = EXCLUDED.price,
         is_upgrade = EXCLUDED.is_upgrade,
         metadata   = EXCLUDED.metadata,
         updated_at = CURRENT_TIMESTAMP`,
      [
        req.userId,
        projectId,
        tier || null,
        tierLevel || 1,
        price || 0,
        isUpgrade || false,
        metadata || {},
      ]
    );

    res.json({ success: true, message: "Item added to cart" });
  } catch (err) {
    console.error("Cart POST error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// ─── DELETE /api/cart/:projectId — Remove item from DB cart ──────────────────
router.delete("/:projectId", async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM "Cart" WHERE user_id = $1 AND project_id = $2`,
      [req.userId, req.params.projectId]
    );
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    console.error("Cart DELETE error:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// ─── DELETE /api/cart — Clear entire cart ────────────────────────────────────
router.delete("/", async (req, res) => {
  try {
    await pool.query(`DELETE FROM "Cart" WHERE user_id = $1`, [req.userId]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Cart clear error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;

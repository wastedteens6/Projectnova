import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ─── GET /api/purchases/my-purchases ─────────────────────────────────
router.get("/my-purchases", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        o.id as transaction_id,
        o.project_id,
        tier.name as tier_level,
        tier.level as tier_numeric_level,
        o.amount_in_paise as price_in_paise,
        o.order_id,
        o.created_at,
        p.title as project_title,
        p.slug,
        p.tiers
      FROM "Order" o
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.user_id = $1 AND o.type = 'purchase' AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `,
      [req.userId],
    );

    res.json({
      success: true,
      purchases: result.rows.map((row) => ({
        ...row,
        tier_name: row.tier_level,
        tier_level: row.tier_numeric_level || 1,
      })),
    });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// ─── GET /api/purchases/check-purchase/:projectId ────────────────────
router.get("/check-purchase/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT o.*, tier.name as tier_name, tier.level as tier_level, p.tiers
      FROM "Order" o
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.user_id = $1 AND o.project_id = $2 AND o.type = 'purchase' AND o.status = 'completed'
      ORDER BY o.created_at DESC
      LIMIT 1
    `,
      [userId, projectId],
    );

    if (result.rows.length === 0) return res.json({ purchased: false });

    const order = result.rows[0];
    res.json({
      purchased: true,
      tier: order.tier_level || 1,
      tierName: order.tier_name || "Unknown",
      price: order.amount_in_paise,
      orderId: order.order_id,
    });
  } catch (err) {
    console.error("Check purchase error:", err);
    res.json({ purchased: false, error: err.message });
  }
});

// ─── GET /api/purchases/user ─────────────────────────────────────────
router.get("/user", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;
    let userId = req.userId;

    if (email) {
      // Verify email belongs to authenticated user (or admin)
      const userRes = await pool.query(
        'SELECT id, email, role FROM "User" WHERE email = $1',
        [email],
      );
      if (userRes.rows.length === 0) {
        return res.json({ success: true, data: [] });
      }
      const targetUser = userRes.rows[0];
      if (req.userId !== targetUser.id && req.user?.role !== "admin") {
        return res.status(403).json({
          error: "Forbidden - You can only view your own purchases",
          code: "USER_MISMATCH",
        });
      }
      userId = targetUser.id;
    }

    const result = await pool.query(
      `
      SELECT 
        o.id as transaction_id,
        o.project_id,
        tier.name as tier_level,
        tier.level as tier_numeric_level,
        o.amount_in_paise as price_in_paise,
        o.order_id,
        o.created_at,
        p.title as project_title,
        p.slug,
        p.tiers,
        p.images,
        p.id as project_uuid
      FROM "Order" o
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.user_id = $1 AND o.type = 'purchase' AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `,
      [userId],
    );

    const data = result.rows.map((row) => {
      // Extract drive_link from Project.tiers JSONB array for the purchased tier level
      let tiersArr = []
      if (Array.isArray(row.tiers)) {
        tiersArr = row.tiers
      } else if (typeof row.tiers === 'string') {
        try { tiersArr = JSON.parse(row.tiers) } catch (e) {}
      }

      const tierLevel = row.tier_numeric_level || 1
      const matchedTier = tiersArr.find(t => Number(t.level) === Number(tierLevel))
      const driveLink = matchedTier?.drive_link || null
      const firstImage = Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null

      return {
        id: row.transaction_id,
        name: row.project_title || "Project",
        title: row.project_title,
        slug: row.slug,
        images: row.images || [],
        image: firstImage,
        projectId: row.project_uuid,
        tier: row.tier_level,
        currentTierLevel: tierLevel,
        driveLink,
        tiers: row.tiers,
        price: row.price_in_paise,
        date: new Date(row.created_at).toLocaleDateString(),
        orderId: row.order_id,
      }
    })

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching user purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// ─── POST /api/purchases/upgrade-tier/preview ────────────────────────
router.post("/upgrade-tier/preview", verifyToken, async (req, res) => {
  try {
    const { project_id, target_tier_level } = req.body;
    const userId = req.userId;

    if (!project_id || target_tier_level === undefined) {
      return res
        .status(400)
        .json({ error: "Missing project_id or target_tier_level" });
    }

    // Get project tiers
    const projectResult = await pool.query(
      `SELECT id, tiers FROM "Project" WHERE id = $1`,
      [project_id],
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const { tiers } = projectResult.rows[0];
    
    let tiersArr = []
    if (Array.isArray(tiers)) {
      tiersArr = tiers
    } else if (typeof tiers === 'string') {
      try { tiersArr = JSON.parse(tiers) } catch (e) {}
    }

    const targetTier = tiersArr?.find(
      (t) => Number(t.level) === Number(target_tier_level),
    );
    if (!targetTier) {
      return res.status(400).json({
        error: "Target tier not found",
        target_tier_level,
        available_levels: tiersArr?.map((t) => t.level),
      });
    }

    // Get user's latest purchase for this project
    const purchaseResult = await pool.query(
      `SELECT o.id, o.amount_in_paise, tier.name as tier_name, tier.level as tier_level
       FROM "Order" o
       LEFT JOIN "Tier" tier ON o.tier_id = tier.id
       WHERE o.user_id = $1 AND o.project_id = $2 AND o.type = 'purchase' AND o.status = 'completed'
       ORDER BY o.created_at DESC LIMIT 1`,
      [userId, project_id],
    );

    if (purchaseResult.rows.length === 0) {
      return res.json({
        isFirstBuy: true,
        upgrade_price: targetTier.price,
        target_tier_level,
        target_tier_name: targetTier.name,
        amount_paid: 0,
      });
    }

    const purchase = purchaseResult.rows[0];
    const currentTierLevel = Number(purchase.tier_level) || 1;
    const amountPaidRupees = Number(purchase.amount_in_paise) / 100;

    if (Number(target_tier_level) <= currentTierLevel) {
      return res.status(400).json({
        error: "Invalid upgrade: target tier must be higher than current tier",
        current_tier_level: currentTierLevel,
        target_tier_level: Number(target_tier_level),
      });
    }

    const upgrade_price = Number(targetTier.price) - amountPaidRupees;
    if (upgrade_price <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid upgrade or already owned at this level" });
    }

    return res.json({
      isFirstBuy: false,
      upgrade_price,
      target_tier_level,
      target_tier_name: targetTier.name,
      current_tier_level: currentTierLevel,
      current_tier_name: purchase.tier_name,
      amount_paid: amountPaidRupees,
      full_price: targetTier.price,
      transaction_id: purchase.id,
    });
  } catch (err) {
    console.error("Error calculating upgrade price:", err);
    res.status(500).json({ error: "Failed to calculate upgrade price" });
  }
});

// ─── POST /api/purchases/upgrade-tier/confirm ────────────────────────
router.post("/upgrade-tier/confirm", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { project_id, target_tier_level, order_id } = req.body;
    const userId = req.userId;

    if (!project_id || target_tier_level === undefined || !order_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.query("BEGIN");

    // Idempotency — if this order_id already exists, return success
    const existingUpgrade = await client.query(
      `SELECT id FROM "Order" WHERE user_id = $1 AND order_id = $2 AND type = 'upgrade' LIMIT 1`,
      [userId, order_id],
    );
    if (existingUpgrade.rows.length > 0) {
      await client.query("COMMIT");
      return res.json({
        success: true,
        message: "Upgrade already recorded (idempotent)",
      });
    }

    // Get project tiers and target tier
    const projectResult = await client.query(
      `SELECT id, tiers FROM "Project" WHERE id = $1`,
      [project_id],
    );
    if (projectResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Project not found" });
    }
    const { tiers } = projectResult.rows[0];
    let tiersArr = []
    if (Array.isArray(tiers)) {
      tiersArr = tiers
    } else if (typeof tiers === 'string') {
      try { tiersArr = JSON.parse(tiers) } catch (e) {}
    }

    const targetTier = tiersArr?.find((t) => Number(t.level) === Number(target_tier_level));
    if (!targetTier) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Target tier not found" });
    }

    // Get latest purchase
    const purchaseResult = await client.query(
      `SELECT o.id, o.amount_in_paise, o.tier_id, tier.level as tier_level
       FROM "Order" o LEFT JOIN "Tier" tier ON o.tier_id = tier.id
       WHERE o.user_id = $1 AND o.project_id = $2 AND o.type = 'purchase' AND o.status = 'completed'
       ORDER BY o.created_at DESC LIMIT 1`,
      [userId, project_id],
    );

    let upgradePricePaise;
    let newTotalPaise;

    if (purchaseResult.rows.length === 0) {
      upgradePricePaise = Math.round(targetTier.price * 100);
      newTotalPaise = upgradePricePaise;
    } else {
      const purchase = purchaseResult.rows[0];
      const currentTierLevel = purchase.tier_level ?? 1;

      if (target_tier_level <= currentTierLevel) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Target tier must be higher than current tier" });
      }

      const amountPaidRupees = purchase.amount_in_paise / 100;
      const upgradePrice = targetTier.price - amountPaidRupees;

      if (upgradePrice <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid upgrade price" });
      }

      upgradePricePaise = Math.round(upgradePrice * 100);
      newTotalPaise = Math.round(targetTier.price * 100);

      // Update existing purchase to new tier
      const newTierLookup = await client.query(
        `SELECT id FROM "Tier" WHERE level = $1 LIMIT 1`,
        [Number(target_tier_level)],
      );
      const newTierId = newTierLookup.rows[0]?.id || purchase.tier_id;

      await client.query(
        `UPDATE "Order" SET tier_id = $1, amount_in_paise = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4`,
        [newTierId, newTotalPaise, purchase.id, userId],
      );
    }

    // Look up target tier_id
    const targetTierLookup = await client.query(
      `SELECT id FROM "Tier" WHERE level = $1 LIMIT 1`,
      [Number(target_tier_level)],
    );
    const targetTierId = targetTierLookup.rows[0]?.id || null;

    // Record upgrade order (audit trail)
    await client.query(
      `INSERT INTO "Order" (user_id, project_id, tier_id, type, status, amount_in_paise, order_id, payment_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        project_id,
        targetTierId,
        "upgrade",
        "completed",
        upgradePricePaise,
        order_id,
        JSON.stringify({ orderId: order_id, tier: targetTier.name }),
      ],
    );

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Upgrade recorded successfully",
      new_tier: targetTier.name,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error confirming upgrade:", err);
    res.status(500).json({ error: "Failed to confirm upgrade" });
  } finally {
    client.release();
  }
});

// ─── POST /api/purchases/record-purchase ─────────────────────────────
router.post("/record-purchase", async (req, res) => {
  try {
    const { projectId, tier, price, orderId, userEmail } = req.body;

    const userRes = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [userEmail],
    );
    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const userId = userRes.rows[0].id;

    const tierLookup = await pool.query(
      `SELECT id FROM "Tier" WHERE name = $1 LIMIT 1`,
      [tier],
    );
    const tierId = tierLookup.rows[0]?.id || null;

    const result = await pool.query(
      `INSERT INTO "Order" (user_id, project_id, tier_id, type, status, amount_in_paise, order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
        projectId,
        tierId,
        "purchase",
        "completed",
        Math.round(price * 100),
        orderId,
      ],
    );

    res.status(201).json({ success: true, purchase: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to record" });
  }
});

export default router;

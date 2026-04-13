import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get user's purchases
router.get("/my-purchases", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
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
    `,
      [req.userId],
    );

    res.json({
      success: true,
      purchases: result.rows.map((row) => {
        // tier_level contains the tier NAME (e.g., "Pro", "Starter")
        const tierName = row.tier_level;
        const tierInfo = row.tiers?.find((t) => t.name === tierName);

        return {
          ...row,
          tier_name: tierName,
          tier_level: tierInfo?.level || 1, // Add level for upgrade logic
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
    let userRes = await pool.query('SELECT id FROM "User" WHERE email = $1', [
      userEmail,
    ]);
    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const userId = userRes.rows[0].id;

    const result = await pool.query(
      `
      INSERT INTO "Transaction" (
        user_id, type, status, amount_in_paise, items, payment_info
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        userId,
        "purchase",
        "completed",
        Math.round(price * 100),
        JSON.stringify({ projectId, tier }),
        JSON.stringify({ orderId }),
      ],
    );

    res.status(201).json({ success: true, purchase: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to record" });
  }
});

// Check if user has purchased a project
// CRITICAL: ONLY check authenticated user's purchases
router.get("/check-purchase/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    // SECURITY: Use authenticated user ID from JWT, never trust query params
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.items->>'projectId' = $2 AND t.type = 'purchase'
    `,
      [userId, projectId],
    );

    if (result.rows.length === 0) return res.json({ purchased: false });

    const trans = result.rows[0];
    // trans.items.tier contains the tier NAME (e.g., "Pro", "Starter")
    const tierName = trans.items?.tier;
    const tierInfo = trans.tiers?.find((t) => t.name === tierName);
    const tierLevel = tierInfo?.level || 1;

    res.json({
      purchased: true,
      tier: tierLevel,
      tierName: tierName || "Unknown",
      price: trans.amount_in_paise,
      orderId: trans.payment_info?.orderId,
    });
  } catch (err) {
    console.error("Check purchase error:", err);
    res.json({ purchased: false, error: err.message });
  }
});

// Get user's purchases by email
// CRITICAL: Verify user can only fetch their own data
router.get("/user", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      // If no email provided, return authenticated user's purchases
      const userId = req.userId;

      const result = await pool.query(
        `
        SELECT 
          t.id as transaction_id,
          t.items->>'projectId' as project_id,
          t.items->>'tier' as tier_level,
          t.amount_in_paise as price_in_paise,
          t.payment_info->>'orderId' as order_id,
          t.created_at,
          p.title as project_title,
          p.slug,
          p.tiers,
          p.id
        FROM "Transaction" t
        LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
        WHERE t.user_id = $1 AND t.type = 'purchase'
        ORDER BY t.created_at DESC
      `,
        [userId],
      );

      const data = result.rows.map((row) => {
        const tierName = row.tier_level; // tier_level contains the tier NAME
        const tierInfo = row.tiers?.find((t) => t.name === tierName);
        return {
          id: row.id || row.transaction_id,
          name: row.project_title || "Project",
          title: row.project_title,
          slug: row.slug,
          projectId: row.id, // UUID of the project
          tier: tierName,
          currentTierLevel: tierInfo?.level || 1, // Numeric tier level
          tiers: row.tiers, // Full tiers array for upgrade options
          price: row.price_in_paise,
          date: new Date(row.created_at).toLocaleDateString(),
          orderId: row.order_id,
        };
      });

      return res.json({ success: true, data });
    }

    // CRITICAL: If email is provided, verify it matches authenticated user
    // Users CANNOT query other users' data
    const userRes = await pool.query(
      'SELECT id, email, role FROM "User" WHERE email = $1',
      [email],
    );

    if (userRes.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const targetUser = userRes.rows[0];

    // CRITICAL: Enforce user ownership - only admins can access other users' data
    if (req.userId !== targetUser.id && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden - You can only view your own purchases",
        code: "USER_MISMATCH",
      });
    }

    const userId = targetUser.id;

    const result = await pool.query(
      `
      SELECT 
        t.id as transaction_id,
        t.items->>'projectId' as project_id,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as price_in_paise,
        t.payment_info->>'orderId' as order_id,
        t.created_at,
        p.title as project_title,
        p.slug,
        p.tiers,
        p.id
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.type = 'purchase'
      ORDER BY t.created_at DESC
    `,
      [userId],
    );

    const data = result.rows.map((row) => {
      const tierName = row.tier_level; // tier_level contains the tier NAME
      const tierInfo = row.tiers?.find((t) => t.name === tierName);
      return {
        id: row.id || row.transaction_id,
        name: row.project_title || "Project",
        title: row.project_title,
        slug: row.slug,
        projectId: row.id, // UUID of the project
        tier: tierName,
        currentTierLevel: tierInfo?.level || 1, // Numeric tier level
        tiers: row.tiers, // Full tiers array for upgrade options
        price: row.price_in_paise,
        date: new Date(row.created_at).toLocaleDateString(),
        orderId: row.order_id,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching user purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/purchases/upgrade-tier
// Calculate upgrade price (Step 1 of 2 — preview only, no charge here)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upgrade-tier/preview", verifyToken, async (req, res) => {
  try {
    const { project_id, target_tier_level } = req.body;
    const userId = req.userId; // SECURITY: Always from JWT, never from body

    if (!project_id || target_tier_level === undefined) {
      return res.status(400).json({ error: "Missing project_id or target_tier_level" });
    }

    // STEP 1 — Fetch user's latest purchase for this project
    const purchaseResult = await pool.query(
      `SELECT t.id, t.items, t.amount_in_paise, p.tiers
       FROM "Transaction" t
       LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
       WHERE t.user_id = $1
         AND (t.items->>'projectId') = $2
         AND t.type = 'purchase'
       ORDER BY t.created_at DESC
       LIMIT 1`,
      [userId, project_id]
    );

    // STEP 2 — Get project tiers to look up prices
    const projectResult = await pool.query(
      `SELECT id, tiers FROM "Project" WHERE id = $1`,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { tiers } = projectResult.rows[0];
    // Use Number() to prevent string/int comparison failures
    const targetTier = tiers?.find((t) => Number(t.level) === Number(target_tier_level));

    if (!targetTier) {
      return res.status(400).json({ 
        error: "Target tier not found",
        target_tier_level,
        available_levels: tiers?.map(t => t.level)
      });
    }

    // If no existing purchase → charge full price (first-time buy)
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
    const currentTierName = purchase.items?.tier;
    const currentTier = tiers?.find((t) => t.name === currentTierName);
    // Be robust with finding current level
    const currentTierLevel = currentTier ? Number(currentTier.level) : 1;
    const amountPaidRupees = Number(purchase.amount_in_paise) / 100;

    // STEP 3 — Prevent downgrade or same-tier
    if (Number(target_tier_level) <= currentTierLevel) {
      return res.status(400).json({
        error: "Invalid upgrade: target tier must be higher than current tier",
        current_tier_level: currentTierLevel,
        target_tier_level: Number(target_tier_level),
      });
    }

    // STEP 4 — Calculate upgrade price = target price − amount already paid
    const upgrade_price = Number(targetTier.price) - amountPaidRupees;

    if (upgrade_price <= 0) {
      return res.status(400).json({ error: "Invalid upgrade or already owned at this level" });
    }

    return res.json({
      isFirstBuy: false,
      upgrade_price,
      target_tier_level,
      target_tier_name: targetTier.name,
      current_tier_level: currentTierLevel,
      current_tier_name: currentTierName,
      amount_paid: amountPaidRupees,
      full_price: targetTier.price,
      transaction_id: purchase.id,
    });
  } catch (err) {
    console.error("Error calculating upgrade price:", err);
    res.status(500).json({ error: "Failed to calculate upgrade price" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/purchases/upgrade-tier/confirm
// Called by verify-payment for upgrades — updates existing Transaction record
// SECURITY: user_id always from JWT; idempotent via transaction_id check
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upgrade-tier/confirm", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { project_id, target_tier_level, order_id } = req.body;
    const userId = req.userId; // SECURITY: from JWT only

    if (!project_id || target_tier_level === undefined || !order_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.query("BEGIN");

    // Idempotency — if this order_id is already recorded, return success
    const existingUpgrade = await client.query(
      `SELECT id FROM "Transaction"
       WHERE user_id = $1
         AND payment_info->>'orderId' = $2
         AND type = 'upgrade'
       LIMIT 1`,
      [userId, order_id]
    );
    if (existingUpgrade.rows.length > 0) {
      await client.query("COMMIT");
      return res.json({ success: true, message: "Upgrade already recorded (idempotent)" });
    }

    // Fetch latest purchase
    const purchaseResult = await client.query(
      `SELECT t.id, t.items, t.amount_in_paise, p.tiers
       FROM "Transaction" t
       LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
       WHERE t.user_id = $1
         AND (t.items->>'projectId') = $2
         AND t.type = 'purchase'
       ORDER BY t.created_at DESC
       LIMIT 1`,
      [userId, project_id]
    );

    // Fetch project tiers
    const projectResult = await client.query(
      `SELECT id, tiers FROM "Project" WHERE id = $1`,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Project not found" });
    }

    const { tiers } = projectResult.rows[0];
    const targetTier = tiers?.find((t) => t.level === target_tier_level);

    if (!targetTier) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Target tier not found" });
    }

    let upgradePricePaise;
    let newTotalPaise;

    if (purchaseResult.rows.length === 0) {
      // First-time buy — charge full price
      upgradePricePaise = Math.round(targetTier.price * 100);
      newTotalPaise = upgradePricePaise;
    } else {
      const purchase = purchaseResult.rows[0];
      const currentTierName = purchase.items?.tier;
      const currentTier = tiers?.find((t) => t.name === currentTierName);
      const currentTierLevel = currentTier?.level ?? 1;

      if (target_tier_level <= currentTierLevel) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Target tier must be higher than current tier" });
      }

      const amountPaidRupees = purchase.amount_in_paise / 100;
      const upgradePrice = targetTier.price - amountPaidRupees;

      if (upgradePrice <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid upgrade price" });
      }

      upgradePricePaise = Math.round(upgradePrice * 100);
      newTotalPaise = Math.round(targetTier.price * 100); // Total = full target tier price

      // Update the existing purchase to the new tier and cumulative total
      await client.query(
        `UPDATE "Transaction"
         SET items = items || jsonb_build_object('tier', $1::text),
             amount_in_paise = $2,
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4`,
        [targetTier.name, newTotalPaise, purchase.id, userId]
      );
    }

    // Record upgrade transaction (audit trail)
    await client.query(
      `INSERT INTO "Transaction" (user_id, type, status, amount_in_paise, items, payment_info)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "upgrade",
        "completed",
        upgradePricePaise,
        JSON.stringify({ projectId: project_id, tier: targetTier.name }),
        JSON.stringify({ orderId: order_id }),
      ]
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Upgrade recorded successfully", new_tier: targetTier.name });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error confirming upgrade:", err);
    res.status(500).json({ error: "Failed to confirm upgrade" });
  } finally {
    client.release();
  }
});

export default router;


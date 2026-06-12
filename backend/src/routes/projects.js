import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Helper to normalize a project row to a consistent frontend-friendly format
const formatProject = (row) => ({
  ...row,
  // DB stores images/videos inside the media jsonb column
  images: row.media?.images || [],
  videos: row.media?.videos || [],
  tech_stack: row.technologies || [],        // alias for old frontend refs
  technologies: row.technologies || [],
  image_count: (row.media?.images || []).length,
  has_video: (row.media?.videos || []).length > 0,
});

// ─── GET /api/projects/featured ───────────────────────────────────────
router.get("/featured", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, slug, title, description, category,
        is_published, is_featured, media, technologies, features, tiers, analytics,
        created_at, updated_at
      FROM "Project"
      WHERE is_published = true AND is_featured = true
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows.map(formatProject) });
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.status(500).json({ error: error.message || "Error fetching featured projects" });
  }
});

// ─── GET /api/projects ────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, slug, title, description, category,
        is_published, is_featured, media, technologies, features, tiers, analytics,
        created_at, updated_at
      FROM "Project"
      WHERE is_published = true
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows.map(formatProject) });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message || "Error fetching projects" });
  }
});

// ─── GET /api/projects/:slug ──────────────────────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM "Project" WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true, data: formatProject(result.rows[0]) });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: error.message || "Error fetching project" });
  }
});

// ─── GET /api/projects/:slug/access (requires purchase) ──────────────
router.get("/:slug/access", verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    const projectResult = await pool.query(
      'SELECT id, slug, title, tiers FROM "Project" WHERE slug = $1',
      [slug],
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const project = projectResult.rows[0];

    // Check if user has purchased this project
    const purchaseResult = await pool.query(
      `SELECT o.*, tier.name as tier_name, tier.level as tier_level, tier.id as tier_id_fk
       FROM "Order" o
       LEFT JOIN "Tier" tier ON o.tier_id = tier.id
       WHERE o.user_id = $1 AND o.project_id = $2 AND o.type = 'purchase' AND o.status = 'completed'
       ORDER BY o.created_at DESC LIMIT 1`,
      [userId, project.id],
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(403).json({
        error: "Access Denied - You have not purchased this project",
        code: "NOT_PURCHASED",
      });
    }

    const purchase = purchaseResult.rows[0];
    const tierLevel = purchase.tier_level;
    // Find matching tier in project JSONB tiers for the drive link
    const tierInfo = project.tiers?.find((t) => Number(t.level) === Number(tierLevel));

    res.json({
      success: true,
      access: {
        purchased: true,
        tier: tierLevel,
        tierName: purchase.tier_name || tierInfo?.name,
        driveLink: tierInfo?.drive_link,
        features: tierInfo?.features,
        accessGrantedAt: purchase.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying project access:", error);
    res.status(500).json({ error: "Failed to verify access" });
  }
});

export default router;

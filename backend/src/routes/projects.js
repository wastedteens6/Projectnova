import express from "express";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get featured/trending projects (public)
router.get("/featured", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, slug, title, description, category, 
        is_published, tech_stack, features, tiers, media, analytics,
        created_at, updated_at
      FROM "Project"
      WHERE is_published = true AND is_featured = true
      ORDER BY created_at DESC
    `);

    // Format for frontend
    const formattedRows = result.rows.map((row) => {
      return {
        ...row,
        images: row.media?.images || [],
        videos: row.media?.videos || [],
        image_count: row.media?.images?.length || 0,
        has_video: row.media?.videos?.length > 0,
      };
    });

    res.json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res
      .status(500)
      .json({ error: error.message || "Error fetching featured projects" });
  }
});

// Get all published projects (public listing)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, slug, title, description, category, 
        is_published, tech_stack, features, tiers, media, analytics,
        created_at, updated_at
      FROM "Project"
      WHERE is_published = true
      ORDER BY created_at DESC
    `);

    // Format for frontend
    const formattedRows = result.rows.map((row) => {
      return {
        ...row,
        // Include images for card display (with fallback to media.images)
        images: row.media?.images || [],
        videos: row.media?.videos || [],
        image_count: row.media?.images?.length || 0,
        has_video: row.media?.videos?.length > 0,
      };
    });

    res.json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message || "Error fetching projects" });
  }
});

// Get detailed project by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query('SELECT * FROM "Project" WHERE slug = $1', [
      slug,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = result.rows[0];

    // The new schema already has features, tiers, media in JSONB with per-project pricing!
    const formattedProject = {
      ...project,
      images: project.media?.images || [],
      videos: project.media?.videos || [],
    };

    res.json({
      success: true,
      data: formattedProject,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: error.message || "Error fetching project" });
  }
});

// Get project access details WITH purchase verification
// CRITICAL: Verify user has purchased before returning tier content
router.get("/:slug/access", verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    // Get project
    const projectResult = await pool.query(
      'SELECT id, slug, title, tiers FROM "Project" WHERE slug = $1',
      [slug],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    // CRITICAL VERIFICATION: Check if user has purchased this project
    const purchaseResult = await pool.query(
      `
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND (t.items->>'projectId')::uuid = $2 AND t.type = 'purchase'
      LIMIT 1
      `,
      [userId, project.id],
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(403).json({
        error: "Access Denied - You have not purchased this project",
        code: "NOT_PURCHASED",
      });
    }

    // User has purchased - return access details
    const purchase = purchaseResult.rows[0];
    const tierLevel = parseInt(purchase.items?.tier);
    const tierInfo = project.tiers?.find((t) => t.level === tierLevel);

    res.json({
      success: true,
      access: {
        purchased: true,
        tier: tierLevel,
        tierName: tierInfo?.name,
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

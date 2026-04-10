import express from "express";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";

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

export default router;

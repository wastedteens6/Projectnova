import express from "express";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";

const router = express.Router();
const SETTINGS_FILE = path.join(process.cwd(), 'global_settings.json');

const getGlobalSettings = () => {
   try { if (fs.existsSync(SETTINGS_FILE)) return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch(e){}
   return null;
}

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

    const settings = getGlobalSettings();

    // Format for frontend (ensure tiers price is in rupees if stored as paise, though seeded as rupees)
    const formattedRows = result.rows.map(row => {
      let updatedTiers = row.tiers || [];
      if (settings && updatedTiers.length > 0) {
        updatedTiers = updatedTiers.map(t => ({
          ...t,
          price: t.level === 1 ? (settings.tier1 || t.price) : t.level === 2 ? (settings.tier2 || t.price) : (settings.tier3 || t.price)
        }));
      }

      return {
        ...row,
        tiers: updatedTiers,
        image_count: row.media?.images?.length || 0,
        has_video: row.media?.videos?.length > 0
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

    const result = await pool.query(
      'SELECT * FROM "Project" WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = result.rows[0];
    
    const settings = getGlobalSettings();
    let updatedTiers = project.tiers || [];
    if (settings && updatedTiers.length > 0) {
        updatedTiers = updatedTiers.map(t => ({
            ...t,
            price: t.level === 1 ? (settings.tier1 || t.price) : t.level === 2 ? (settings.tier2 || t.price) : (settings.tier3 || t.price)
        }));
    }

    // The new schema already has features, tiers, media in JSONB!
    // Just ensure numeric types are correct if needed
    const formattedProject = {
      ...project,
      images: project.media?.images || [],
      videos: project.media?.videos || [],
      tiers: updatedTiers
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

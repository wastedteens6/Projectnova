import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../config/database.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Create uploads directories if they don't exist
const uploadDirs = ["uploads/projects/images", "uploads/projects/videos"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "previewVideo") {
      cb(null, "uploads/projects/videos");
    } else if (file.fieldname.startsWith("projectImages")) {
      cb(null, "uploads/projects/images");
    } else {
      cb(null, "uploads/projects");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * @route POST /api/admin/projects/create
 * @description Create a new project (Optimized JSONB Schema)
 */
router.post("/create", adminAuth, upload.any(), async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      techStack,
      keyFeatures,
      tier1GoogleDrive,
      tier1Features,
      tier1Price,
      tier2GoogleDrive,
      tier2Features,
      tier2Price,
      tier3GoogleDrive,
      tier3Features,
      tier3Price,
      isPublished,
    } = req.body;

    if (!title || !category || !description) {
      return res
        .status(400)
        .json({ error: "Title, category, and description are required" });
    }

    const slug = generateSlug(title);

    // Prepare JSONB columns
    const techStackArr = Array.isArray(techStack)
      ? techStack
      : techStack?.split(",").map((t) => t.trim()) || [];
    const featuresArr = Array.isArray(keyFeatures)
      ? keyFeatures
      : keyFeatures?.split(",").map((f) => f.trim()) || [];

    const tiers = [
      {
        level: 1,
        name: "Basic",
        price: parseInt(tier1Price) || 0,
        drive_link: tier1GoogleDrive,
        features: tier1Features?.split(",").map((f) => f.trim()) || [],
      },
      {
        level: 2,
        name: "Standard",
        price: parseInt(tier2Price) || 0,
        drive_link: tier2GoogleDrive,
        features: tier2Features?.split(",").map((f) => f.trim()) || [],
      },
      {
        level: 3,
        name: "Premium",
        price: parseInt(tier3Price) || 0,
        drive_link: tier3GoogleDrive,
        features: tier3Features?.split(",").map((f) => f.trim()) || [],
      },
    ].filter((t) => t.drive_link);

    const media = { images: [], videos: [] };
    const files = req.files || [];
    files.forEach((file) => {
      if (file.fieldname.startsWith("projectImages")) {
        media.images.push(`/uploads/projects/images/${file.filename}`);
      } else if (file.fieldname === "previewVideo") {
        media.videos.push(`/uploads/projects/videos/${file.filename}`);
      }
    });

    const result = await pool.query(
      `
      INSERT INTO "Project" (
        title, slug, description, category, 
        is_published, tech_stack, features, tiers, media
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        title,
        slug,
        description,
        category,
        isPublished === "true" || isPublished === true,
        JSON.stringify(techStackArr),
        JSON.stringify(featuresArr),
        JSON.stringify(tiers),
        JSON.stringify(media),
      ],
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message || "Error creating project" });
  }
});

/**
 * @route GET /api/admin/projects/all
 */
router.get("/all", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Project" ORDER BY created_at DESC',
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res
      .status(500)
      .json({ error: "Error fetching projects", details: error.message });
  }
});

/**
 * @route PUT /api/admin/projects/:id/toggle-featured
 * @description Toggle featured status of a project
 */
router.put("/:id/toggle-featured", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current featured status
    const projectResult = await pool.query(
      'SELECT is_featured FROM "Project" WHERE id = $1',
      [id],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const currentFeatured = projectResult.rows[0].is_featured || false;
    const newFeatured = !currentFeatured;

    // Update featured status
    const result = await pool.query(
      `UPDATE "Project" SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newFeatured, id],
    );

    res.json({
      success: true,
      message: newFeatured
        ? "Project featured successfully"
        : "Project unfeatured successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);

    // Check if it's a column missing error
    if (error.message && error.message.includes("is_featured")) {
      return res.status(500).json({
        error:
          'Database not updated. Please run the migration: UPDATE "Project" SET is_featured = false WHERE is_featured IS NULL or is_featured doesn\'t exist',
        details: error.message,
      });
    }

    res
      .status(500)
      .json({
        error: "Failed to toggle featured status",
        details: error.message,
      });
  }
});

/**
 * @route PUT /api/admin/projects/:id
 * @description Update an existing project
 */
router.put("/:id", adminAuth, upload.any(), async (req, res) => {
  try {
    console.log(`🔄 UPDATE PROJECT REQUEST: ID=${req.params.id}`);
    const { id } = req.params;
    const {
      title,
      category,
      description,
      techStack,
      keyFeatures,
      tier1GoogleDrive,
      tier1Features,
      tier1Price,
      tier2GoogleDrive,
      tier2Features,
      tier2Price,
      tier3GoogleDrive,
      tier3Features,
      tier3Price,
      isPublished,
    } = req.body;

    const oldProject = await pool.query(
      'SELECT * FROM "Project" WHERE id = $1',
      [id],
    );
    if (oldProject.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const project = oldProject.rows[0];

    // Update fields or keep old ones
    const newTitle = title || project.title;
    const slug = title ? generateSlug(title) : project.slug;

    const techStackArr = techStack
      ? Array.isArray(techStack)
        ? techStack
        : techStack.split(",").map((t) => t.trim())
      : project.tech_stack;
    const featuresArr = keyFeatures
      ? Array.isArray(keyFeatures)
        ? keyFeatures
        : keyFeatures.split(",").map((f) => f.trim())
      : project.features;

    let tiers = project.tiers || [];
    if (tier1GoogleDrive || tier2GoogleDrive || tier3GoogleDrive) {
      tiers = [
        {
          level: 1,
          name: "Basic",
          price: tier1Price ? parseInt(tier1Price) : tiers[0]?.price || 0,
          drive_link: tier1GoogleDrive || tiers[0]?.drive_link,
          features:
            tier1Features?.split(",").map((f) => f.trim()) ||
            tiers[0]?.features ||
            [],
        },
        {
          level: 2,
          name: "Standard",
          price: tier2Price ? parseInt(tier2Price) : tiers[1]?.price || 0,
          drive_link: tier2GoogleDrive || tiers[1]?.drive_link,
          features:
            tier2Features?.split(",").map((f) => f.trim()) ||
            tiers[1]?.features ||
            [],
        },
        {
          level: 3,
          name: "Premium",
          price: tier3Price ? parseInt(tier3Price) : tiers[2]?.price || 0,
          drive_link: tier3GoogleDrive || tiers[2]?.drive_link,
          features:
            tier3Features?.split(",").map((f) => f.trim()) ||
            tiers[2]?.features ||
            [],
        },
      ].filter((t) => t.drive_link);
    } else if (tier1Price || tier2Price || tier3Price) {
      // Update only prices if tiers haven't changed
      tiers = tiers.map((t) => ({
        ...t,
        price:
          t.level === 1
            ? tier1Price
              ? parseInt(tier1Price)
              : t.price
            : t.level === 2
              ? tier2Price
                ? parseInt(tier2Price)
                : t.price
              : tier3Price
                ? parseInt(tier3Price)
                : t.price,
      }));
    }

    const media = project.media || { images: [], videos: [] };
    const files = req.files || [];
    files.forEach((file) => {
      if (file.fieldname.startsWith("projectImages")) {
        media.images.push(`/uploads/projects/images/${file.filename}`);
      } else if (file.fieldname === "previewVideo") {
        media.videos = [`/uploads/projects/videos/${file.filename}`]; // Replace video
      }
    });

    const result = await pool.query(
      `
      UPDATE "Project" SET
        title = $1, slug = $2, description = $3, category = $4,
        is_published = $5, tech_stack = $6, features = $7, 
        tiers = $8, media = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `,
      [
        newTitle,
        slug,
        description || project.description,
        category || project.category,
        isPublished !== undefined
          ? isPublished === "true" || isPublished === true
          : project.is_published,
        JSON.stringify(techStackArr),
        JSON.stringify(featuresArr),
        JSON.stringify(tiers),
        JSON.stringify(media),
        id,
      ],
    );

    res.json({
      success: true,
      message: "Updated successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

/**
 * @route DELETE /api/admin/projects/:id
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query(
      'SELECT media FROM "Project" WHERE id = $1',
      [id],
    );

    if (projectResult.rows.length > 0) {
      const media = projectResult.rows[0].media;
      // Delete images
      media.images?.forEach((img) => {
        const p = path.join(".", img);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      // Delete videos
      media.videos?.forEach((vid) => {
        const p = path.join(".", vid);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    }

    await pool.query('DELETE FROM "Project" WHERE id = $1', [id]);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;

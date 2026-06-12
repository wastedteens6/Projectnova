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
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * POST /api/admin/projects/create
 */
router.post("/create", adminAuth, upload.any(), async (req, res) => {
  try {
    const {
      title, category, description,
      techStack, keyFeatures,
      tier1GoogleDrive, tier1Features, tier1Price,
      tier2GoogleDrive, tier2Features, tier2Price,
      tier3GoogleDrive, tier3Features, tier3Price,
      isPublished,
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: "Title, category, and description are required" });
    }

    const slug = generateSlug(title);

    const techStackArr = Array.isArray(techStack)
      ? techStack
      : techStack?.split(",").map((t) => t.trim()) || [];

    const featuresArr = Array.isArray(keyFeatures)
      ? keyFeatures
      : keyFeatures?.split(",").map((f) => f.trim()) || [];

    const tiers = [
      {
        level: 1, name: "Basic",
        price: parseInt(tier1Price) || 0,
        drive_link: tier1GoogleDrive,
        features: tier1Features?.split(",").map((f) => f.trim()) || [],
      },
      {
        level: 2, name: "Standard",
        price: parseInt(tier2Price) || 0,
        drive_link: tier2GoogleDrive,
        features: tier2Features?.split(",").map((f) => f.trim()) || [],
      },
      {
        level: 3, name: "Premium",
        price: parseInt(tier3Price) || 0,
        drive_link: tier3GoogleDrive,
        features: tier3Features?.split(",").map((f) => f.trim()) || [],
      },
    ].filter((t) => t.drive_link);

    // Collect uploaded files
    const images = [];
    const videos = [];
    const files = req.files || [];
    files.forEach((file) => {
      if (file.fieldname.startsWith("projectImages")) {
        images.push(`/uploads/projects/images/${file.filename}`);
      } else if (file.fieldname === "previewVideo") {
        videos.push(`/uploads/projects/videos/${file.filename}`);
      }
    });

    const result = await pool.query(
      `
      INSERT INTO "Project" (
        title, slug, description, category, is_published,
        technologies, features, tiers, media
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        title, slug, description, category,
        isPublished === "true" || isPublished === true,
        JSON.stringify(techStackArr),    // jsonb column
        JSON.stringify(featuresArr),     // jsonb column
        JSON.stringify(tiers),           // jsonb column
        JSON.stringify({ images, videos }), // media jsonb column
      ],
    );

    res.status(201).json({ success: true, message: "Project created successfully", project: result.rows[0] });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message || "Error creating project" });
  }
});

/**
 * GET /api/admin/projects/all
 */
router.get("/all", adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Project" ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: "Error fetching projects", details: error.message });
  }
});

/**
 * PUT /api/admin/projects/:id/toggle-featured
 */
router.put("/:id/toggle-featured", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query(
      'SELECT is_featured FROM "Project" WHERE id = $1',
      [id],
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const newFeatured = !projectResult.rows[0].is_featured;
    const result = await pool.query(
      `UPDATE "Project" SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newFeatured, id],
    );
    res.json({
      success: true,
      message: newFeatured ? "Project featured successfully" : "Project unfeatured successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ error: "Failed to toggle featured status", details: error.message });
  }
});

/**
 * PUT /api/admin/projects/:id
 */
router.put("/:id", adminAuth, upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, description,
      techStack, keyFeatures,
      tier1GoogleDrive, tier1Features, tier1Price,
      tier2GoogleDrive, tier2Features, tier2Price,
      tier3GoogleDrive, tier3Features, tier3Price,
      isPublished,
    } = req.body;

    const oldProject = await pool.query('SELECT * FROM "Project" WHERE id = $1', [id]);
    if (oldProject.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const project = oldProject.rows[0];

    const newTitle = title || project.title;
    const slug = title ? generateSlug(title) : project.slug;

    const techStackArr = techStack
      ? (Array.isArray(techStack) ? techStack : techStack.split(",").map((t) => t.trim()))
      : project.technologies || [];

    const featuresArr = keyFeatures
      ? (Array.isArray(keyFeatures) ? keyFeatures : keyFeatures.split(",").map((f) => f.trim()))
      : project.features || [];

    let tiers = project.tiers || [];
    if (tier1GoogleDrive || tier2GoogleDrive || tier3GoogleDrive) {
      tiers = [
        { level: 1, name: "Basic", price: tier1Price ? parseInt(tier1Price) : tiers[0]?.price || 0, drive_link: tier1GoogleDrive || tiers[0]?.drive_link, features: tier1Features?.split(",").map((f) => f.trim()) || tiers[0]?.features || [] },
        { level: 2, name: "Standard", price: tier2Price ? parseInt(tier2Price) : tiers[1]?.price || 0, drive_link: tier2GoogleDrive || tiers[1]?.drive_link, features: tier2Features?.split(",").map((f) => f.trim()) || tiers[1]?.features || [] },
        { level: 3, name: "Premium", price: tier3Price ? parseInt(tier3Price) : tiers[2]?.price || 0, drive_link: tier3GoogleDrive || tiers[2]?.drive_link, features: tier3Features?.split(",").map((f) => f.trim()) || tiers[2]?.features || [] },
      ].filter((t) => t.drive_link);
    } else if (tier1Price || tier2Price || tier3Price) {
      tiers = tiers.map((t) => ({
        ...t,
        price: t.level === 1 ? (tier1Price ? parseInt(tier1Price) : t.price)
          : t.level === 2 ? (tier2Price ? parseInt(tier2Price) : t.price)
          : (tier3Price ? parseInt(tier3Price) : t.price),
      }));
    }

    // Handle file uploads — stored inside media jsonb column
    const existingMedia = project.media || {};
    const images = [...(existingMedia.images || [])];
    const videos = [...(existingMedia.videos || [])];
    const files = req.files || [];
    files.forEach((file) => {
      if (file.fieldname.startsWith("projectImages")) {
        images.push(`/uploads/projects/images/${file.filename}`);
      } else if (file.fieldname === "previewVideo") {
        videos[0] = `/uploads/projects/videos/${file.filename}`;
      }
    });

    const result = await pool.query(
      `
      UPDATE "Project" SET
        title = $1, slug = $2, description = $3, category = $4,
        is_published = $5, technologies = $6, features = $7,
        tiers = $8, media = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `,
      [
        newTitle, slug, description || project.description, category || project.category,
        isPublished !== undefined ? (isPublished === "true" || isPublished === true) : project.is_published,
        JSON.stringify(techStackArr),
        JSON.stringify(featuresArr),
        JSON.stringify(tiers),
        JSON.stringify({ images, videos }),
        id,
      ],
    );

    res.json({ success: true, message: "Updated successfully", project: result.rows[0] });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed", details: error.message });
  }
});

/**
 * DELETE /api/admin/projects/:id
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query('SELECT media FROM "Project" WHERE id = $1', [id]);

    if (projectResult.rows.length > 0) {
      const { images, videos } = projectResult.rows[0].media || {};
      (images || []).forEach((img) => {
        const p = path.join(".", img);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      (videos || []).forEach((vid) => {
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

/**
 * GET /api/admin/projects/purchases — All purchases for admin
 */
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
        p.tiers,
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
      price: row.price_in_paise / 100,
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

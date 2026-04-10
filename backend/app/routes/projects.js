import express from "express";

const router = express.Router();

// In-memory storage (DEPRECATED - Use database instead)
// All pricing is now stored in the PostgreSQL database in the Project.tiers JSONB field
// Prices should NEVER be hardcoded here - fetch from database via /src/routes/projects.js
let projects = [];

// Get all projects
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: projects,
  });
});

// Create new project (Admin only)
// NOTE: This endpoint is deprecated - use database endpoint instead
// All tier pricing MUST come from the database tiers JSONB field
router.post("/create", (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      category,
      techStack,
    } = req.body;

    // Validate required fields (NO hardcoded default prices)
    if (!title || !slug || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields. Use database endpoint for pricing.",
      });
    }

    // Check if slug already exists
    if (projects.some((p) => p.slug === slug)) {
      return res.status(400).json({
        success: false,
        error: "Project with this slug already exists",
      });
    }

    // Create new project WITHOUT hardcoded prices
    const newProject = {
      id: String(Math.max(...projects.map((p) => parseInt(p.id) || 0), 0) + 1),
      slug,
      title,
      description,
      category,
      techStack: Array.isArray(techStack) ? techStack : [techStack],
      // NOTE: Prices come from database tiers only, never hardcoded
      tiers: [], // Empty - must be set in database
      thumbnailUrl: "/projects/default.jpg",
      views: 0,
      isPublished: true,
    };

    projects.push(newProject);

    res.json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete project (Admin only)
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const deletedProject = projects.splice(projectIndex, 1);

    res.json({
      success: true,
      message: "Project deleted successfully",
      data: deletedProject[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project by slug
router.get("/:slug", (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    });
  }

  res.json({
    success: true,
    data: {
      ...project,
      tier1Features: ["Source Code", "Documentation", "Setup Guide"],
      tier2Features: [
        "Everything in Tier 1",
        "Video Tutorials",
        "Architecture Diagram",
      ],
      tier3Features: [
        "Everything in Tier 2",
        "One-on-One Support",
        "Deployment Help",
      ],
      tier4Features: [
        "Everything in Tier 3",
        "Lifetime Updates",
        "Premium Support",
      ],
    },
  });
});

export default router;

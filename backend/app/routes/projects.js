import express from "express";

const router = express.Router();

// In-memory storage (will be replaced with database)
let projects = [
  {
    id: "1",
    slug: "mern-ecommerce",
    title: "MERN E-commerce Platform",
    description: "Complete e-commerce app with MERN stack",
    category: "Full Stack",
    techStack: ["MongoDB", "Express", "React", "Node.js"],
    tier1Price: 399,
    tier2Price: 999,
    tier3Price: 1999,
    tier4Price: 2999,
    thumbnailUrl: "/projects/mern-ecommerce.jpg",
    views: 1500,
    isPublished: true,
  },
  {
    id: "2",
    slug: "django-blog",
    title: "Django Blog Platform",
    description: "Blogging platform with Django and PostgreSQL",
    category: "Backend",
    techStack: ["Django", "PostgreSQL", "HTML/CSS"],
    tier1Price: 299,
    tier2Price: 799,
    tier3Price: 1499,
    tier4Price: 2199,
    thumbnailUrl: "/projects/django-blog.jpg",
    views: 1200,
    isPublished: true,
  },
];

// Get all projects
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: projects,
  });
});

// Create new project (Admin only)
router.post("/create", (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      category,
      techStack,
      tier1Price,
      tier2Price,
      tier3Price,
      tier4Price,
    } = req.body;

    // Validate required fields
    if (!title || !slug || !description || !category || !tier1Price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Check if slug already exists
    if (projects.some((p) => p.slug === slug)) {
      return res.status(400).json({
        success: false,
        error: "Project with this slug already exists",
      });
    }

    // Create new project
    const newProject = {
      id: String(Math.max(...projects.map((p) => parseInt(p.id) || 0), 0) + 1),
      slug,
      title,
      description,
      category,
      techStack: Array.isArray(techStack) ? techStack : [techStack],
      tier1Price: parseInt(tier1Price),
      tier2Price: parseInt(tier2Price),
      tier3Price: parseInt(tier3Price),
      tier4Price: parseInt(tier4Price),
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

import express from "express";
import { pool } from "../config/database.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Get all roles
router.get("/", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, permissions, created_at FROM "Role" ORDER BY name ASC`
    );
    res.json({ success: true, roles: result.rows });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Create a new role
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Role name is required" });
    }

    // Convert string to lower case, remove spaces
    const cleanName = name.toLowerCase().replace(/\s+/g, '_');

    // Check if role exists
    const existing = await pool.query(`SELECT name FROM "Role" WHERE name = $1`, [cleanName]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Role already exists" });
    }

    const result = await pool.query(
      `INSERT INTO "Role" (name, permissions) VALUES ($1, $2) RETURNING *`,
      [cleanName, permissions || []]
    );

    res.status(201).json({ success: true, role: result.rows[0] });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Update a role
router.put("/:name", adminAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const { permissions } = req.body;

    const result = await pool.query(
      `UPDATE "Role" SET permissions = $1 WHERE name = $2 RETURNING *`,
      [permissions || [], name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    res.json({ success: true, role: result.rows[0] });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Delete a role
router.delete("/:name", adminAuth, async (req, res) => {
  try {
    const { name } = req.params;

    if (name === "admin" || name === "user") {
      return res.status(400).json({ success: false, error: "Cannot delete default roles" });
    }

    // Check if users are using this role
    const users = await pool.query(`SELECT id FROM "User" WHERE role = $1 LIMIT 1`, [name]);
    if (users.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Cannot delete role assigned to users" });
    }

    const result = await pool.query(`DELETE FROM "Role" WHERE name = $1 RETURNING *`, [name]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

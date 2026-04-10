import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check if user exists
    const checkUser = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, name, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error("Reg error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
       success: true,
       token,
       user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Admin Login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin login attempt:", email);

    const result = await pool.query('SELECT * FROM "User" WHERE email = $1 AND role = $2', [email, 'admin']);
    console.log("Admin user query result:", result.rows.length, "rows");
    
    if (result.rows.length === 0) {
      console.log("Admin login failed - no admin user found for email:", email);
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const user = result.rows[0];
    console.log("Admin user found:", user.email, "role:", user.role);

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Admin login failed - password mismatch");
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    console.log("Admin login successful for:", user.email);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, email, name, role FROM "User" WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get all users (Admin only)
router.get("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Get users - Token present:", !!token);
    
    if (!token) return res.status(401).json({ error: "No token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Get users - Decoded token:", decoded);
    } catch (tokenErr) {
      console.error("Get users - Token verification error:", tokenErr.message);
      return res.status(401).json({ error: "Invalid token" });
    }
    
    // Check if user is admin
    console.log("Get users - User role:", decoded.role);
    if (decoded.role !== 'admin') {
      console.log("Get users - Unauthorized, user is not admin");
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    const result = await pool.query('SELECT id, email, name, role, created_at FROM "User" ORDER BY created_at DESC');
    console.log("Get users - Query result rows:", result.rows.length);
    
    // Ensure we have an array of users
    const users = result.rows || [];
    
    res.json({ 
      success: true, 
      data: users,
      count: users.length 
    });
  } catch (err) {
    console.error("Get users error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// Test endpoint - get all users (NO AUTH - for debugging only)
router.get("/all-users", async (req, res) => {
  try {
    console.log("=== ALL USERS DEBUG ENDPOINT ===");
    
    const allUsers = await pool.query('SELECT id, email, name, role, created_at FROM "User" ORDER BY created_at DESC');
    console.log(`Found ${allUsers.rows.length} users`);
    
    res.json({ 
      success: true, 
      totalCount: allUsers.rows.length,
      users: allUsers.rows,
      usersList: allUsers.rows.map((u) => `${u.name} (${u.email}) - ${u.role}`)
    });
  } catch (err) {
    console.error("All users endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint - get total user count (debugging)
router.get("/users/count/debug", async (req, res) => {
  try {
    console.log("=== DEBUG: Fetching all users ===");
    
    const result = await pool.query('SELECT COUNT(*) as total FROM "User"');
    const count = parseInt(result.rows[0]?.total || 0);
    console.log(`Count query result:`, result.rows[0]);
    console.log(`Total users: ${count}`);
    
    // Also get all users for debugging
    const allUsers = await pool.query('SELECT id, email, name, role, created_at FROM "User" ORDER BY created_at DESC');
    console.log(`All users query returned ${allUsers.rows.length} rows`);
    console.log(`Users:`, JSON.stringify(allUsers.rows, null, 2));
    
    res.json({ 
      success: true, 
      totalCount: count,
      users: allUsers.rows,
      usersList: allUsers.rows.map((u) => ({ email: u.email, name: u.name, role: u.role }))
    });
  } catch (err) {
    console.error("Debug users error:", err);
    res.status(500).json({ error: err.message, details: err.toString() });
  }
});

export default router;

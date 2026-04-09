import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // TODO: Hash password, save to DB
  const token = jwt.sign(
    { email, name, role: "user" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    },
  );

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: { id: "1", email, name, role: "user" },
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // TODO: Check DB, verify password
  const token = jwt.sign({ email, role: "user" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  res.json({
    success: true,
    token,
    user: { id: "1", email, name: "User", role: "user" },
  });
});

// Admin Login
router.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Hardcoded admin credentials for demo (TODO: Check DB with admin role)
  const ADMIN_EMAIL = "admin@wastedteens.com";
  const ADMIN_PASSWORD = "admin123";

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  res.json({
    success: true,
    token,
    user: { id: "1", email, name: "Admin", role: "admin" },
  });
});

// Get current user
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;

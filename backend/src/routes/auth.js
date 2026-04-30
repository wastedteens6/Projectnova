import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { createRequire } from "module";
import { pool } from "../config/database.js";
import { adminAuth } from "../middleware/adminAuth.js";

import { generateSecret, generateURI, verifySync } from "otplib";
const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;
const APP_NAME = "ProjectNova";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = async (user) => {
  let permissions = [];
  try {
    const roleRes = await pool.query(`SELECT permissions FROM "Role" WHERE name = $1`, [user.role]);
    if (roleRes.rows.length > 0) {
      permissions = roleRes.rows[0].permissions;
    }
  } catch (err) {
    console.error("Error fetching permissions for token", err);
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─── POST /register ───────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, name, hashedPassword]
    );

    const user = result.rows[0];

    // Force MFA setup on registration
    const secret = generateSecret();
    await pool.query(
      `UPDATE "User" SET mfa_secret = $1, mfa_enabled = false WHERE id = $2`,
      [secret, user.id]
    );

    const otpauth = generateURI({ label: user.email, issuer: APP_NAME, secret });
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    // Short-lived token that only allows calling /mfa/verify-setup
    const setupToken = jwt.sign(
      { mfa_setup_pending: true, id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(201).json({
      success: true,
      mfa_setup_required: true,
      setup_token: setupToken,
      qrDataUrl,
      secret,
      otpauth,
    });
  } catch (error) {
    console.error("Reg error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    // ── Block admin accounts from the user login portal ───────────────────────
    if (user.role === 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ── Account lockout check (database-persisted, crash-safe) ────────────────
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      const remainingMs = new Date(user.lockout_until) - new Date();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        error: `Account locked. Try again in ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}.`,
        locked: true,
        lockedUntil: user.lockout_until,
      });
    }

    // ── Password verification ─────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      const lockoutUntil = shouldLock
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      // Persist updated attempt count and potential lockout (crash-safe)
      await pool.query(
        `UPDATE "User" SET failed_login_attempts = $1, lockout_until = $2 WHERE id = $3`,
        [newAttempts, lockoutUntil, user.id]
      );

      if (shouldLock) {
        return res.status(423).json({
          error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
          locked: true,
          lockedUntil: lockoutUntil,
        });
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - newAttempts;
      return res.status(401).json({
        error: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before lockout.`,
        attemptsLeft,
      });
    }

    // ── Successful password — reset lockout state ─────────────────────────────
    await pool.query(
      `UPDATE "User" SET failed_login_attempts = 0, lockout_until = NULL WHERE id = $1`,
      [user.id]
    );

    // ── Read global MFA toggle ────────────────────────────────────────────────
    const mfaSetting = await pool.query(`SELECT value FROM "Settings" WHERE key = 'mfaRequired'`);
    const mfaRequired = mfaSetting.rows[0]?.value !== 'false'; // default true if missing

    // ── If MFA is globally disabled, skip all MFA checks and issue JWT now ───
    if (!mfaRequired) {
      const token = await generateToken(user);
      setTokenCookie(res, token);
      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    // ── MFA check ─────────────────────────────────────────────────────────────
    if (user.mfa_enabled && user.mfa_secret) {
      // Already enrolled — require OTP code to proceed
      const mfaToken = jwt.sign(
        { mfa_pending: true, id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      return res.json({ success: true, mfa_required: true, mfa_token: mfaToken });
    }

    // ── MFA not yet set up — FORCE enrollment before issuing a session ─────────
    if (!user.mfa_enabled) {
      // Generate a fresh TOTP secret and persist it now (not yet active)
      const secret = generateSecret();
      await pool.query(
        `UPDATE "User" SET mfa_secret = $1, mfa_enabled = false WHERE id = $2`,
        [secret, user.id]
      );

      const otpauth = generateURI({ label: user.email, issuer: APP_NAME, secret });
      const qrDataUrl = await QRCode.toDataURL(otpauth);

      // Short-lived token that only allows calling /mfa/verify-setup
      const setupToken = jwt.sign(
        { mfa_setup_pending: true, id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.json({
        success: true,
        mfa_setup_required: true,
        setup_token: setupToken,
        qrDataUrl,
        secret,
        otpauth,
      });
    }

    // ── All good — issue full JWT ─────────────────────────────────────────────
    const token = await generateToken(user);
    setTokenCookie(res, token);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});


// ─── POST /login/verify-mfa ───────────────────────────────────────────────────
// Accepts the short-lived mfa_token + the 6-digit TOTP code from the authenticator app
router.post("/login/verify-mfa", async (req, res) => {
  try {
    const { mfa_token, code } = req.body;
    if (!mfa_token || !code)
      return res.status(400).json({ error: "MFA token and code required" });

    let decoded;
    try {
      decoded = jwt.verify(mfa_token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "MFA session expired. Please log in again." });
    }

    if (!decoded.mfa_pending)
      return res.status(400).json({ error: "Invalid MFA token" });

    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];

    const isValid = verifySync({ token: code, secret: user.mfa_secret });
    if (!isValid?.valid)
      return res.status(401).json({ error: "Invalid authenticator code. Please try again." });

    const token = await generateToken(user);
    setTokenCookie(res, token);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("MFA verify error:", error);
    res.status(500).json({ error: "MFA verification failed" });
  }
});

// ─── POST /admin-login ────────────────────────────────────────────────────────
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM "User" WHERE email = $1 AND role = $2',
      [email, "admin"]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid admin credentials" });

    const user = result.rows[0];

    // Account lockout check for admin too
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockout_until) - new Date()) / 60000);
      return res.status(423).json({
        error: `Account locked. Try again in ${remainingMin} minute(s).`,
        locked: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      const lockoutUntil = shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;
      await pool.query(
        `UPDATE "User" SET failed_login_attempts = $1, lockout_until = $2 WHERE id = $3`,
        [newAttempts, lockoutUntil, user.id]
      );
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    await pool.query(
      `UPDATE "User" SET failed_login_attempts = 0, lockout_until = NULL WHERE id = $1`,
      [user.id]
    );

    // MFA check for admin
    if (user.mfa_enabled && user.mfa_secret) {
      const mfaToken = jwt.sign(
        { mfa_pending: true, id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      return res.json({ success: true, mfa_required: true, mfa_token: mfaToken });
    }

    res.json({
      success: true,
      token: await generateToken(user),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// ─── POST /logout ────────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.mfa_enabled, r.permissions 
       FROM "User" u
       LEFT JOIN "Role" r ON u.role = r.name
       WHERE u.id = $1`,
      [decoded.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ─── POST /mfa/setup ─────────────────────────────────────────────────────────
// Generates a new TOTP secret and returns QR code for the user to scan
router.post("/mfa/setup", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = result.rows[0];

    // Generate a fresh secret
    const secret = generateSecret();

    // Save secret to DB (not yet enabled — user must verify first)
    await pool.query('UPDATE "User" SET mfa_secret = $1, mfa_enabled = false WHERE id = $2', [
      secret, user.id,
    ]);

    const otpauth = generateURI({ label: user.email, issuer: APP_NAME, secret });
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    res.json({ success: true, secret, qrDataUrl, otpauth });
  } catch (error) {
    console.error("MFA setup error:", error);
    res.status(500).json({ error: "MFA setup failed" });
  }
});

// ─── POST /mfa/verify-setup ───────────────────────────────────────────────────
// User scanned QR and enters first code to confirm — this enables MFA.
// Accepts either:
//   - Authorization header (regular auth token, from Dashboard setup)
//   - setup_token in body (forced setup flow, from login)
router.post("/mfa/verify-setup", async (req, res) => {
  try {
    const { code, setup_token } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    // Resolve identity from either the forced setup_token or regular auth header
    const headerToken = req.headers.authorization?.split(" ")[1];
    const tokenToUse = setup_token || headerToken;
    if (!tokenToUse) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(tokenToUse, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }

    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = result.rows[0];

    if (!user.mfa_secret)
      return res.status(400).json({ error: "No MFA secret found. Please run setup first." });

    const isValid = verifySync({ token: code, secret: user.mfa_secret });
    if (!isValid?.valid)
      return res.status(401).json({ error: "Invalid code. Make sure your authenticator app is synced and try again." });

    // Enable MFA permanently in DB
    await pool.query('UPDATE "User" SET mfa_enabled = true WHERE id = $1', [user.id]);

    // If this was a forced setup (from login), issue a full session JWT immediately
    // so the user doesn't have to log in again after enrolling
    if (decoded.mfa_setup_pending) {
      const fullUser = result.rows[0];
      const token = await generateToken(fullUser);
      setTokenCookie(res, token);
      return res.json({
        success: true,
        forced_setup_complete: true,
        message: "🎉 MFA enabled! You are now logged in.",
        token,
        user: { id: fullUser.id, email: fullUser.email, name: fullUser.name, role: fullUser.role },
      });
    }

    res.json({ success: true, message: "MFA enabled successfully! You will need your authenticator app on future logins." });
  } catch (error) {
    console.error("MFA verify-setup error:", error);
    res.status(500).json({ error: "MFA verification failed" });
  }
});


// ─── POST /mfa/disable ────────────────────────────────────────────────────────
// User can disable their own MFA (requires current code to confirm)
router.post("/mfa/disable", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Current authenticator code required" });

    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = result.rows[0];

    if (!user.mfa_enabled) return res.status(400).json({ error: "MFA is not enabled" });

    const isValid = verifySync({ token: code, secret: user.mfa_secret });
    if (!isValid?.valid) return res.status(401).json({ error: "Invalid code" });

    await pool.query('UPDATE "User" SET mfa_enabled = false, mfa_secret = NULL WHERE id = $1', [user.id]);
    res.json({ success: true, message: "MFA disabled successfully." });
  } catch (error) {
    console.error("MFA disable error:", error);
    res.status(500).json({ error: "Failed to disable MFA" });
  }
});

// ─── GET /users ───────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ error: "Unauthorized - Admin access required" });

    const result = await pool.query(
      `SELECT id, email, name, role, mfa_enabled,
              failed_login_attempts,
              lockout_until,
              created_at
       FROM "User" ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ─── PATCH /users/:id/role  (Admin) ──────────────────────────────────────────
router.patch("/users/:id/role", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Prevent self-role modification
    if (req.user.id === id) {
      return res.status(400).json({ error: "You cannot change your own role." });
    }

    // Validate role dynamically against the Role table
    const roleCheck = await pool.query('SELECT name FROM "Role" WHERE name = $1', [role]);
    if (roleCheck.rows.length === 0) {
      return res.status(400).json({ error: `Invalid role '${role}'.` });
    }

    const result = await pool.query(
      'UPDATE "User" SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, role',
      [role, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: `Role updated to '${role}'`, user: result.rows[0] });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// ─── PATCH /users/:id/reset-mfa  (Admin) ─────────────────────────────────────
router.patch("/users/:id/reset-mfa", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE "User" SET mfa_enabled = false, mfa_secret = NULL,
       updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, name`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "MFA reset successfully. User can re-enroll next login.", user: result.rows[0] });
  } catch (error) {
    console.error("MFA reset error:", error);
    res.status(500).json({ error: "Failed to reset MFA" });
  }
});

// ─── PATCH /users/:id/unlock  (Admin) ────────────────────────────────────────
router.patch("/users/:id/unlock", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE "User" SET failed_login_attempts = 0, lockout_until = NULL,
       updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, name`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "Account unlocked successfully.", user: result.rows[0] });
  } catch (error) {
    console.error("Unlock error:", error);
    res.status(500).json({ error: "Failed to unlock account" });
  }
});

export default router;

# CODE CHANGES - EXACT LINE DIFFS

## 1. NEW FILE: backend/src/middleware/auth.js

```javascript
import jwt from "jsonwebtoken";

/**
 * Verify JWT token and extract authenticated user
 * CRITICAL: Never trust user_id from request body/query
 * Always extract from verified JWT token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - Token required",
        code: "NO_TOKEN",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Attach user info from verified token ONLY
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // For backward compatibility, also attach userId
    req.userId = decoded.id;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};

/**
 * Verify JWT and check user is admin
 */
export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Check admin role from verified token
    if (decoded.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden - Admin access required",
        code: "INSUFFICIENT_PRIVILEGES",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default {
  verifyToken,
  verifyAdminToken,
};
```

---

## 2. MODIFIED: backend/src/routes/purchases.js

### Line 1-3: CHANGED

```javascript
// BEFORE:
import express from "express";
import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";

// AFTER:
import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
```

### Line 5: CHANGED

```javascript
// BEFORE:
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// AFTER:
const router = express.Router();
```

### Line 71-95: CHANGED - /check-purchase endpoint

```javascript
// BEFORE:
// Check if user has purchased a project
router.get("/check-purchase/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) return res.json({ purchased: false });

    const result = await pool.query(
      `
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.items->>'projectId' = $2 AND t.type = 'purchase'
    `,
      [userId, projectId],
    );

// AFTER:
// Check if user has purchased a project
// CRITICAL: ONLY check authenticated user's purchases
router.get("/check-purchase/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    // SECURITY: Use authenticated user ID from JWT, never trust query params
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.items->>'projectId' = $2 AND t.type = 'purchase'
    `,
      [userId, projectId],
    );
```

### Line 145-226: CHANGED - /user endpoint (MAJOR)

```javascript
// BEFORE:
// Get user's purchases by email
router.get("/user", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email parameter required" });
    }

    // SECURITY: Verify that the authenticated user matches the email being queried
    // (users can only query their own purchases, admins bypass this check)
    const userRes = await pool.query(
      'SELECT id, email, role FROM "User" WHERE email = $1',
      [email],
    );

    if (userRes.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const targetUser = userRes.rows[0];

    // Check authorization: only the user themselves or admins can see this data
    if (req.userId !== targetUser.id) {
      return res
        .status(403)
        .json({ error: "Forbidden - You can only view your own data" });
    }

    const userId = targetUser.id;

    const result = await pool.query(
      `
      SELECT 
        t.id as transaction_id,
        t.items->>'projectId' as project_id,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as price_in_paise,
        t.payment_info->>'orderId' as order_id,
        t.created_at,
        p.title as project_title,
        p.slug,
        p.tiers,
        p.id
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.type = 'purchase'
      ORDER BY t.created_at DESC
    `,
      [userId],
    );

    const data = result.rows.map((row) => {
      const tierLevel = parseInt(row.tier_level);
      const tierInfo = row.tiers?.find((t) => t.level === tierLevel);
      return {
        id: row.id || row.transaction_id,
        name: row.project_title || "Project",
        title: row.project_title,
        slug: row.slug,
        tier: tierInfo?.name || `Tier ${tierLevel}`,
        price: row.price_in_paise,
        date: new Date(row.created_at).toLocaleDateString(),
        orderId: row.order_id,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching user purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// AFTER:
// Get user's purchases by email
// CRITICAL: Verify user can only fetch their own data
router.get("/user", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      // If no email provided, return authenticated user's purchases
      const userId = req.userId;

      const result = await pool.query(
        `
        SELECT 
          t.id as transaction_id,
          t.items->>'projectId' as project_id,
          t.items->>'tier' as tier_level,
          t.amount_in_paise as price_in_paise,
          t.payment_info->>'orderId' as order_id,
          t.created_at,
          p.title as project_title,
          p.slug,
          p.tiers,
          p.id
        FROM "Transaction" t
        LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
        WHERE t.user_id = $1 AND t.type = 'purchase'
        ORDER BY t.created_at DESC
      `,
        [userId],
      );

      const data = result.rows.map((row) => {
        const tierLevel = parseInt(row.tier_level);
        const tierInfo = row.tiers?.find((t) => t.level === tierLevel);
        return {
          id: row.id || row.transaction_id,
          name: row.project_title || "Project",
          title: row.project_title,
          slug: row.slug,
          tier: tierInfo?.name || `Tier ${tierLevel}`,
          price: row.price_in_paise,
          date: new Date(row.created_at).toLocaleDateString(),
          orderId: row.order_id,
        };
      });

      return res.json({ success: true, data });
    }

    // CRITICAL: If email is provided, verify it matches authenticated user
    // Users CANNOT query other users' data
    const userRes = await pool.query(
      'SELECT id, email, role FROM "User" WHERE email = $1',
      [email],
    );

    if (userRes.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const targetUser = userRes.rows[0];

    // CRITICAL: Enforce user ownership - only admins can access other users' data
    if (req.userId !== targetUser.id && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden - You can only view your own purchases",
        code: "USER_MISMATCH",
      });
    }

    const userId = targetUser.id;

    const result = await pool.query(
      `
      SELECT 
        t.id as transaction_id,
        t.items->>'projectId' as project_id,
        t.items->>'tier' as tier_level,
        t.amount_in_paise as price_in_paise,
        t.payment_info->>'orderId' as order_id,
        t.created_at,
        p.title as project_title,
        p.slug,
        p.tiers,
        p.id
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND t.type = 'purchase'
      ORDER BY t.created_at DESC
    `,
      [userId],
    );

    const data = result.rows.map((row) => {
      const tierLevel = parseInt(row.tier_level);
      const tierInfo = row.tiers?.find((t) => t.level === tierLevel);
      return {
        id: row.id || row.transaction_id,
        name: row.project_title || "Project",
        title: row.project_title,
        slug: row.slug,
        tier: tierInfo?.name || `Tier ${tierLevel}`,
        price: row.price_in_paise,
        date: new Date(row.created_at).toLocaleDateString(),
        orderId: row.order_id,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching user purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});
```

---

## 3. MODIFIED: backend/src/routes/receipts.js

### Line 1: ADDED

```javascript
import { verifyToken } from "../middleware/auth.js";
```

### Lines 36-70: CHANGED - /receipt/:transactionId endpoint

```javascript
// BEFORE:
router.get("/receipt/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { userId } = req.query;

    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const trans = result.rows[0];

// AFTER:
router.get("/receipt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId; // SECURITY: Get from verified JWT

    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const trans = result.rows[0];

    // CRITICAL: Verify user owns this transaction
    if (trans.user_id !== userId) {
      return res.status(403).json({
        error: "Forbidden - You can only view your own receipts",
        code: "USER_MISMATCH"
      });
    }
```

### Lines 72-117: CHANGED - /download-txt/:transactionId endpoint

```javascript
// BEFORE:
router.get("/download-txt/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const trans = result.rows[0];

// AFTER:
router.get("/download-txt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId; // SECURITY: Get from verified JWT

    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const trans = result.rows[0];

    // CRITICAL: Verify user owns this transaction
    if (trans.user_id !== userId) {
      return res.status(403).json({ error: "Forbidden - You can only download your own receipts" });
    }
```

---

## 4. MODIFIED: backend/src/routes/checkout.js

### Line 1-3: CHANGED

```javascript
// BEFORE:
import express from "express";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "Unauthorized - Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// AFTER:
import express from "express";
import Razorpay from "razorpay";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
```

### verify-payment (around line 95): ADDED COMMENT

```javascript
router.post("/verify-payment", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, projectIds, tier, price } = req.body;
    const userId = req.userId;

    // SECURITY: Extract user info from verified JWT, never from request body
    console.log('✅ Verifying payment for authenticated user:', userId);
```

---

## 5. MODIFIED: backend/src/routes/orders.js

### Line 1-3: CHANGED

```javascript
// BEFORE:
import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// AFTER:
import express from "express";
import { pool } from "../config/database.js";
import { verifyToken, verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();
```

### Line 7-31: CHANGED - GET / endpoint

```javascript
// BEFORE:
// Get all orders (Admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    // Fetch all transactions (purchases) with user and project details
    const result = await pool.query(`

// AFTER:
// Get all orders (Admin only)
// CRITICAL: Use centralized verifyAdminToken middleware
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    // Fetch all transactions (purchases) with user and project details
    const result = await pool.query(`
```

---

## 6. MODIFIED: backend/src/routes/projects.js

### Line 1-6: CHANGED

```javascript
// BEFORE:
import express from "express";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";

const router = express.Router();

// AFTER:
import express from "express";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
```

### Line 91-131: ADDED NEW - /:slug/access endpoint

```javascript
// NEW ENDPOINT NOT IN ORIGINAL FILE
// Get project access details WITH purchase verification
// CRITICAL: Verify user has purchased before returning tier content
router.get("/:slug/access", verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    // Get project
    const projectResult = await pool.query(
      'SELECT id, slug, title, tiers FROM "Project" WHERE slug = $1',
      [slug],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    // CRITICAL VERIFICATION: Check if user has purchased this project
    const purchaseResult = await pool.query(
      `
      SELECT t.*, p.tiers
      FROM "Transaction" t
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.user_id = $1 AND (t.items->>'projectId')::uuid = $2 AND t.type = 'purchase'
      LIMIT 1
      `,
      [userId, project.id],
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(403).json({
        error: "Access Denied - You have not purchased this project",
        code: "NOT_PURCHASED",
      });
    }

    // User has purchased - return access details
    const purchase = purchaseResult.rows[0];
    const tierLevel = parseInt(purchase.items?.tier);
    const tierInfo = project.tiers?.find((t) => t.level === tierLevel);

    res.json({
      success: true,
      access: {
        purchased: true,
        tier: tierLevel,
        tierName: tierInfo?.name,
        driveLink: tierInfo?.drive_link,
        features: tierInfo?.features,
        accessGrantedAt: purchase.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying project access:", error);
    res.status(500).json({ error: "Failed to verify access" });
  }
});

export default router;
```

---

## 7. MODIFIED: frontend/src/pages/Projects.tsx

### Line 35-49: CHANGED

```javascript
// BEFORE:
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedProjects') || '[]')
    const map: { [key: string]: any } = {}
    saved.forEach((p: any) => { if (p.id && p.date) map[p.id] = p })
    setPurchasedProjects(map)
  }, [])

// AFTER:
  useEffect(() => {
    // CRITICAL FIX: Fetch purchased projects from API (not localStorage)
    // This ensures we get the correct user's data based on JWT token
    const token = localStorage.getItem('token')
    if (!token) {
      // User not logged in - no purchases
      setPurchasedProjects({})
      return
    }

    // Fetch authenticated user's purchases from backend
    axios.get('http://localhost:5000/api/purchases/my-purchases', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        // Transform purchased projects array into map for quick lookup
        const map: { [key: string]: any } = {}
        res.data.purchases?.forEach((p: any) => {
          map[p.project_id] = {
            tier: p.tier_name,
            date: new Date(p.created_at).toLocaleDateString(),
            price: `₹${p.price_in_paise / 100}`,
            transactionId: p.transaction_id
          }
        })
        setPurchasedProjects(map)
      })
      .catch(err => {
        console.error('Error fetching purchased projects:', err)
        setPurchasedProjects({})
      })
  }, [localStorage.getItem('token')])
```

---

## 8. MODIFIED: frontend/src/components/Navbar.tsx

### Line 14-19: CHANGED

```javascript
// BEFORE:
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  window.location.href = "/auth/login";
};

// AFTER:
const handleLogout = () => {
  // SECURITY FIX: Clear all user-related data on logout
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("cart");
  localStorage.removeItem("savedProjects");
  localStorage.removeItem("upgradeContext");

  // Redirect to login
  window.location.href = "/auth/login";
};
```

---

## Summary of Changes

| Category               | Changes     | Lines                         |
| ---------------------- | ----------- | ----------------------------- |
| **New Files**          | 1           | middleware/auth.js (88 lines) |
| **Backend Changes**    | 5 files     | ~150 lines modified total     |
| **Frontend Changes**   | 2 files     | ~50 lines modified total      |
| **Documentation**      | 3 files     | Complete                      |
| **Total Code Changes** | **8 files** | **~200 lines**                |

All changes follow the "SECURITY FIX" (✅) vs "BEFORE BUG" (❌) pattern for easy code review.

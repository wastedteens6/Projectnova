import jwt from "jsonwebtoken";

/**
 * Verify JWT token and extract authenticated user
 * CRITICAL: Never trust user_id from request body/query
 * Always extract from verified JWT token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
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

/**
 * CRITICAL: Verify that the request user_id matches the authenticated user
 * Use this middleware to prevent users from accessing other users' data
 *
 * Usage: app.get('/api/user/:userId/data', verifyToken, ensureUserOwnership, handler)
 *
 * This will verify:
 * - User is authenticated
 * - :userId param matches req.user.id
 * - Prevents: GET /api/user/other-user-id/purchases
 */
export const ensureUserOwnership = (paramName = "userId") => {
  return (req, res, next) => {
    const requestedUserId = req.params[paramName];
    const authenticatedUserId = req.user?.id;

    if (!requestedUserId || !authenticatedUserId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "MISSING_IDENTITY",
      });
    }

    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        error: "Forbidden - You can only access your own data",
        code: "USER_MISMATCH",
        requested: requestedUserId,
        authenticated: authenticatedUserId,
      });
    }

    next();
  };
};

export default {
  verifyToken,
  verifyAdminToken,
  ensureUserOwnership,
};

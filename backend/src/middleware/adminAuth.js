import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify role is admin
    if (decoded.role !== 'admin') {
      // Fallback to email check for safety
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [
        "admin@projectnova.com",
      ];
      if (!adminEmails.includes(decoded.email)) {
        return res.status(403).json({ error: "Admin access required" });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

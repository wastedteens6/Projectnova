import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  testDatabaseConnection,
  closeDatabaseConnection,
} from "./config/database.js";
import { runMigrations } from "./config/migrations.js";

// Load environment variables from .env.development in development
const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.development";
dotenv.config({ path: envFile });

// Verify JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-secret-key-change-in-production";
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Order matters!
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS for images
  }),
);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000"
];

if (process.env.CLIENT_URL) {
  const urls = process.env.CLIENT_URL.split(",").map(url => url.trim());
  allowedOrigins.push(...urls);
}
if (process.env.FRONTEND_URL) {
  const urls = process.env.FRONTEND_URL.split(",").map(url => url.trim());
  allowedOrigins.push(...urls);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(allowedOrigin => origin === allowedOrigin);
      const isVercel = origin.endsWith(".vercel.app");

      if (isAllowed || isVercel) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import supportRoutes from "./routes/support.js";
import purchasesRoutes from "./routes/purchases.js";
import receiptsRoutes from "./routes/receipts.js";
import adminRoutes from "./routes/admin.js";
import customProjectRoutes from "./routes/custom-projects.js";
import notificationRoutes from "./routes/notifications.js";
import webhookRoutes from "./routes/webhook.js";
import rolesRoutes from "./routes/roles.js";
import settingsRoutes from "./routes/settings.js";

// ─── IMPORTANT: Webhook must be mounted BEFORE express.json() ────────────────
// Razorpay webhook requires the raw request body (Buffer) for HMAC verification.
// express.json() would parse and destroy the raw body before the webhook can use it.
app.use("/api/webhook", webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiters with different strictness levels
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
});

// Much more lenient limiter for auth endpoints (many login attempts during dev/testing)
// SKIP for development to avoid blocking during testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
});

// Even more lenient for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 1000,
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
});

// Apply rate limiters - auth routes get more lenient treatment
app.use("/api/auth", authLimiter);
app.use("/api/admin", adminLimiter);
// Apply stricter limiter to other API routes
app.use("/api", limiter);

// Serve uploaded files - BEFORE applying heavy middleware
// Use absolute path from backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, "../uploads");
console.log("📁 Serving static files from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", authRoutes); // Admin user management endpoints share auth router
app.use("/api/projects", projectRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/receipts", receiptsRoutes);
app.use("/api/admin/projects", adminRoutes);
app.use("/api/custom-projects", customProjectRoutes);
app.use("/api/admin/custom-projects", customProjectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/settings", settingsRoutes);

// Health check with database status
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    res.json({
      status: "ok",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "error",
      message: error.message,
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);

  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn(
      "⚠️ Warning: Database connection failed. Please run: npm run db:init",
    );
  } else {
    // Run database migrations
    try {
      await runMigrations();
    } catch (error) {
      console.error("❌ Failed to run migrations:", error);
      process.exit(1);
    }
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await closeDatabaseConnection();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await closeDatabaseConnection();
    process.exit(0);
  });
});

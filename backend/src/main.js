import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import {
  testDatabaseConnection,
  closeDatabaseConnection,
} from "./config/database.js";

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

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

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

app.use("/api/auth", authRoutes);
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

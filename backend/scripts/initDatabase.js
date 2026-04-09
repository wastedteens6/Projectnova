import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.development") });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin123",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "projectnova",
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log("🔄 Initializing database with 3NF schema...");

    // Read the SQL file from migrations directory
    const sqlFile = path.join(
      __dirname,
      "../migrations/01_init_3nf_schema.sql",
    );
    const sql = fs.readFileSync(sqlFile, "utf-8");

    // Execute the SQL
    await client.query(sql);

    console.log("✅ Database initialized successfully!");
    console.log("📊 Tables created:");
    console.log("  - User");
    console.log("  - Category");
    console.log("  - Technology");
    console.log("  - Tier");
    console.log("  - Project");
    console.log("  - ProjectFeature");
    console.log("  - ProjectTechnology");
    console.log("  - ProjectTierContent");
    console.log("  - ProjectTierFeature");
    console.log("  - ProjectImage");
    console.log("  - ProjectVideo");
    console.log("  - Purchase");
    console.log("  - Upgrade");
    console.log("  - Receipt");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});

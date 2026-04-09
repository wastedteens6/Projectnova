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

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log("⚠️  Dropping existing tables and types...");

    // Drop all tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS "CustomProjectRequest" CASCADE;
      DROP TABLE IF EXISTS "Receipt" CASCADE;
      DROP TABLE IF EXISTS "Upgrade" CASCADE;
      DROP TABLE IF EXISTS "Purchase" CASCADE;
      DROP TABLE IF EXISTS "ProjectVideo" CASCADE;
      DROP TABLE IF EXISTS "ProjectImage" CASCADE;
      DROP TABLE IF EXISTS "ProjectTierFeature" CASCADE;
      DROP TABLE IF EXISTS "ProjectTierContent" CASCADE;
      DROP TABLE IF EXISTS "ProjectTechnology" CASCADE;
      DROP TABLE IF EXISTS "ProjectFeature" CASCADE;
      DROP TABLE IF EXISTS "Project" CASCADE;
      DROP TABLE IF EXISTS "Tier" CASCADE;
      DROP TABLE IF EXISTS "Technology" CASCADE;
      DROP TABLE IF EXISTS "Category" CASCADE;
      DROP TABLE IF EXISTS "User" CASCADE;
    `);

    // Drop orphaned types
    await client.query(`
      DROP TYPE IF EXISTS "CustomProjectRequest" CASCADE;
      DROP TYPE IF EXISTS "Category" CASCADE;
      DROP TYPE IF EXISTS "Technology" CASCADE;
      DROP TYPE IF EXISTS "Tier" CASCADE;
      DROP TYPE IF EXISTS "Project" CASCADE;
      DROP TYPE IF EXISTS "ProjectFeature" CASCADE;
      DROP TYPE IF EXISTS "ProjectTechnology" CASCADE;
      DROP TYPE IF EXISTS "ProjectTierContent" CASCADE;
      DROP TYPE IF EXISTS "ProjectTierFeature" CASCADE;
      DROP TYPE IF EXISTS "ProjectImage" CASCADE;
      DROP TYPE IF EXISTS "ProjectVideo" CASCADE;
      DROP TYPE IF EXISTS "Purchase" CASCADE;
      DROP TYPE IF EXISTS "Upgrade" CASCADE;
      DROP TYPE IF EXISTS "Receipt" CASCADE;
      DROP TYPE IF EXISTS "User" CASCADE;
    `);

    console.log("🔄 Initializing database with 3NF schema...");

    // Read the SQL file from migrations directory
    const sqlFile = path.join(
      __dirname,
      "../migrations/01_init_3nf_schema.sql",
    );
    const sql = fs.readFileSync(sqlFile, "utf-8");

    // Execute the SQL
    await client.query(sql);

    console.log("✅ Database reset and initialized successfully!");
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
    console.log("  - CustomProjectRequest");
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();

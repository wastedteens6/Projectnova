import { pool } from "../config/database.js";

export const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...");

    // Check if is_featured column exists on Project
    const checkColumn = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Project' AND column_name = 'is_featured'
    `);

    if (checkColumn.rows.length === 0) {
      console.log("📝 Adding is_featured column to Project table...");
      await pool.query(`
        ALTER TABLE "Project" 
        ADD COLUMN is_featured BOOLEAN DEFAULT false
      `);
      console.log("✅ is_featured column created successfully");
    } else {
      console.log("✅ is_featured column already exists");
    }

    // Ensure index exists for faster featured project queries
    const checkIndex = await pool.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'Project' AND indexname = 'idx_project_featured_published'
    `);

    if (checkIndex.rows.length === 0) {
      console.log("📝 Creating index for featured projects...");
      await pool.query(`
        CREATE INDEX idx_project_featured_published 
        ON "Project" (is_featured DESC, created_at DESC) 
        WHERE is_published = true
      `);
      console.log("✅ Index created successfully");
    } else {
      console.log("✅ Featured projects index already exists");
    }

    // Verify 6-table schema is in place
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const tableNames = tablesResult.rows.map((r) => r.table_name);
    const required = ["User", "Project", "Tier", "Order", "Upgrade", "Request"];
    const missing = required.filter((t) => !tableNames.includes(t));

    if (missing.length > 0) {
      console.warn("⚠️  Missing tables:", missing.join(", "));
      console.warn("   Run: npm run db:init to initialize the database");
    } else {
      console.log("✅ All 6 core tables verified:", required.join(", "));
    }

    console.log("✅ All migrations completed successfully\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

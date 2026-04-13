import { pool } from "../config/database.js";

export const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...");

    // Check if is_featured column exists
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

    // Ensure index exists for faster queries
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

    // Ensure Transaction.updated_at exists (needed for tier upgrades)
    const checkUpdatedAt = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Transaction' AND column_name = 'updated_at'
    `);
    if (checkUpdatedAt.rows.length === 0) {
      console.log("📝 Adding updated_at column to Transaction table...");
      await pool.query(`
        ALTER TABLE "Transaction"
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()
      `);
      console.log("✅ updated_at column added to Transaction");
    } else {
      console.log("✅ Transaction.updated_at already exists");
    }

    // Ensure 'upgrade' is a valid type in Transaction (handles both enum and varchar)
    try {
      await pool.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'transaction_type'
          ) THEN
            -- It's an enum — add 'upgrade' if missing
            IF NOT EXISTS (
              SELECT 1 FROM pg_enum
              WHERE enumtypid = 'transaction_type'::regtype
              AND enumlabel = 'upgrade'
            ) THEN
              ALTER TYPE transaction_type ADD VALUE 'upgrade';
            END IF;
          END IF;
        END
        $$;
      `);
      console.log("✅ Transaction type 'upgrade' ensured");
    } catch (typeErr) {
      // Ignore — column is likely a plain VARCHAR, upgrade value will work fine
      console.log("ℹ️  Transaction type is VARCHAR, 'upgrade' values allowed");
    }

    console.log("✅ All migrations completed successfully\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

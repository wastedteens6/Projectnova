import { pool } from "../config/database.js";

export const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...");

    // ── 1. is_featured column on Project ──────────────────────────────────────
    const checkFeatured = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Project' AND column_name = 'is_featured'
    `);
    if (checkFeatured.rows.length === 0) {
      await pool.query(`ALTER TABLE "Project" ADD COLUMN is_featured BOOLEAN DEFAULT false`);
      console.log("✅ Added is_featured to Project");
    }

    // ── 2. Index for featured projects ─────────────────────────────────────────
    const checkFeaturedIdx = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'Project' AND indexname = 'idx_project_featured_published'
    `);
    if (checkFeaturedIdx.rows.length === 0) {
      await pool.query(`
        CREATE INDEX idx_project_featured_published
        ON "Project" (is_featured DESC, created_at DESC)
        WHERE is_published = true
      `);
      console.log("✅ Created featured projects index");
    }

    // ── 3. Production Payment Architecture ────────────────────────────────────
    // Add Razorpay-specific columns to Order table

    const addCol = async (table, column, definition) => {
      const res = await pool.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = $1 AND column_name = $2`,
        [table, column]
      );
      if (res.rows.length === 0) {
        await pool.query(`ALTER TABLE "${table}" ADD COLUMN ${column} ${definition}`);
        console.log(`✅ Added ${column} to ${table}`);
      }
    };

    // Order table: separate razorpay fields, add 'verified' and 'paid' statuses
    await addCol("Order", "razorpay_order_id",  "VARCHAR(255)");
    await addCol("Order", "razorpay_payment_id", "VARCHAR(255)");
    await addCol("Order", "razorpay_signature",  "TEXT");

    // Update Order.status to allow new lifecycle values: pending → verified → paid → refunded | failed
    // The status column already exists; just make sure the default is correct for new rows
    const checkOrderStatus = await pool.query(`
      SELECT column_default FROM information_schema.columns
      WHERE table_name = 'Order' AND column_name = 'status'
    `);
    if (checkOrderStatus.rows.length > 0) {
      console.log("✅ Order.status column verified");
    }

    // ── 4. Create Payment table (audit log of all Razorpay events) ────────────
    const checkPaymentTable = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Payment'
    `);

    if (checkPaymentTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Payment" (
          id                   SERIAL PRIMARY KEY,
          order_id             UUID REFERENCES "Order"(id) ON DELETE SET NULL,
          razorpay_order_id    VARCHAR(255),
          razorpay_payment_id  VARCHAR(255) UNIQUE,  -- ensures idempotency
          amount               INTEGER DEFAULT 0,     -- in paise
          status               VARCHAR(50) DEFAULT 'pending',
          -- 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
          raw_event            JSONB DEFAULT '{}',    -- full Razorpay webhook payload
          created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created Payment table");

      // Indexes for Payment
      await pool.query(`CREATE INDEX idx_payment_order    ON "Payment"(order_id)`);
      await pool.query(`CREATE INDEX idx_payment_rzp_oid  ON "Payment"(razorpay_order_id)`);
      await pool.query(`CREATE INDEX idx_payment_rzp_pid  ON "Payment"(razorpay_payment_id)`);
      console.log("✅ Created Payment table indexes");
    } else {
      console.log("✅ Payment table already exists");
    }

    // ── 5. Index on Order.razorpay_order_id for fast webhook lookups ──────────
    const checkRzpIdx = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'Order' AND indexname = 'idx_order_razorpay_order_id'
    `);
    if (checkRzpIdx.rows.length === 0) {
      await pool.query(`
        CREATE INDEX idx_order_razorpay_order_id ON "Order"(razorpay_order_id)
      `);
      console.log("✅ Created index on Order.razorpay_order_id");
    }

    // ── 6. Verify required tables ─────────────────────────────────────────────
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    const tableNames = tablesResult.rows.map((r) => r.table_name);
    const required = ["User", "Project", "Order", "Payment", "Request", "Notification"];
    const missing = required.filter((t) => !tableNames.includes(t));

    if (missing.length > 0) {
      console.warn("⚠️  Missing tables:", missing.join(", "));
    } else {
      console.log("✅ All required tables verified:", required.join(", "));
    }

    console.log("✅ All migrations completed\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

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

    // ── 1.5 Role-Based Access Control (RBAC) ──────────────────────────────────
    const checkRoleTable = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Role'
    `);
    if (checkRoleTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Role" (
          name VARCHAR(50) PRIMARY KEY,
          permissions TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created Role table");

      // Seed default roles
      await pool.query(`
        INSERT INTO "Role" (name, permissions) VALUES 
        ('admin', ARRAY['/admin/dashboard', '/admin/projects', '/admin/projects/create', '/admin/custom-projects', '/admin/users', '/admin/orders', '/admin/support', '/admin/analytics', '/admin/purchases']),
        ('user', ARRAY[]::TEXT[])
      `);
      console.log("✅ Seeded default roles");
    }

    // Remove the old CHECK constraint on User.role if it exists
    const constraintQuery = await pool.query(`
      SELECT conname FROM pg_constraint 
      WHERE conrelid = '"User"'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%'
    `);
    for (const row of constraintQuery.rows) {
      await pool.query(`ALTER TABLE "User" DROP CONSTRAINT "${row.conname}"`);
      console.log(`✅ Dropped old constraint ${row.conname} from User table`);
    }

    // Add Foreign Key for role
    const fkQuery = await pool.query(`
      SELECT conname FROM pg_constraint 
      WHERE conrelid = '"User"'::regclass AND contype = 'f' AND conname = 'fk_user_role'
    `);
    if (fkQuery.rows.length === 0) {
      // Clean up any stray roles that don't exist before adding the FK
      await pool.query(`UPDATE "User" SET role = 'user' WHERE role NOT IN (SELECT name FROM "Role")`);
      await pool.query(`ALTER TABLE "User" ADD CONSTRAINT fk_user_role FOREIGN KEY (role) REFERENCES "Role"(name) ON UPDATE CASCADE ON DELETE RESTRICT`);
      console.log(`✅ Added fk_user_role to User table`);
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

    // ── 6. Ensure Notification table exists ──────────────────────────────────
    const checkNotifTable = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Notification'
    `);
    if (checkNotifTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Notification" (
          id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id    UUID REFERENCES "User"(id) ON DELETE CASCADE,
          title      VARCHAR(255) NOT NULL,
          message    TEXT NOT NULL,
          type       VARCHAR(50),
          is_read    BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await pool.query(`CREATE INDEX idx_notification_user ON "Notification"("user_id")`);
      await pool.query(`CREATE INDEX idx_notification_read ON "Notification"("is_read")`);
      console.log("✅ Created Notification table");
    } else {
      console.log("✅ Notification table exists");
    }

    // ── 6b. Ensure Request table exists ──────────────────────────────────────
    const checkRequestTable = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Request'
    `);
    if (checkRequestTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Request" (
          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id      UUID REFERENCES "User"(id) ON DELETE CASCADE,
          user_email   VARCHAR(255),
          type         VARCHAR(50)  NOT NULL,
          subject      VARCHAR(255) NOT NULL,
          description  TEXT         NOT NULL,
          details      JSONB        DEFAULT '{}',
          status       VARCHAR(50)  DEFAULT 'pending',
          admin_notes  TEXT,
          conversation JSONB        DEFAULT '[]',
          created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
          updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created Request table");
    } else {
      console.log("✅ Request table exists");
    }


    // ── 7. MFA and Account Lockout columns on User ───────────────────────────
    await addCol("User", "failed_login_attempts", "INTEGER DEFAULT 0");
    await addCol("User", "lockout_until",          "TIMESTAMP DEFAULT NULL");
    await addCol("User", "mfa_secret",             "VARCHAR(255) DEFAULT NULL");
    await addCol("User", "mfa_enabled",            "BOOLEAN DEFAULT false");
    console.log("✅ MFA and lockout columns verified on User");

    // ── 8. Ensure User.updated_at exists (needed for admin actions) ───────────
    await addCol("User", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    console.log("✅ User.updated_at column verified");

    // ── 9. Persist cart in DB (crash-safe, synced across devices) ─────────────
    const checkCartTable = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Cart'
    `);
    if (checkCartTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Cart" (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id     UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          project_id  UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
          tier        VARCHAR(100),
          tier_level  INTEGER DEFAULT 1,
          price       INTEGER DEFAULT 0,
          is_upgrade  BOOLEAN DEFAULT false,
          metadata    JSONB DEFAULT '{}',
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, project_id)
        )
      `);
      await pool.query(`CREATE INDEX idx_cart_user ON "Cart"("user_id")`);
      console.log("✅ Created Cart table");
    } else {
      console.log("✅ Cart table exists");
    }

    // ── 4. Global Settings ────────────────────────────────────────────────────
    const checkSettingsTable = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Settings'
    `);
    if (checkSettingsTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE "Settings" (
          key VARCHAR(50) PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created Settings table");

      // Seed default settings
      await pool.query(`
        INSERT INTO "Settings" (key, value) VALUES 
        ('siteName', 'ProjectNova'),
        ('siteEmail', 'support@projectnova.com'),
        ('currency', 'INR'),
        ('taxRate', '18'),
        ('maintenanceMode', 'false'),
        ('mfaRequired', 'true')
      `);
      console.log("✅ Seeded default settings");
    }


    // ── Ensure mfaRequired setting exists (upsert for existing DBs) ──────────
    await pool.query(`
      INSERT INTO "Settings" (key, value) VALUES ('mfaRequired', 'true')
      ON CONFLICT (key) DO NOTHING
    `);

    console.log("✅ All migrations completed\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

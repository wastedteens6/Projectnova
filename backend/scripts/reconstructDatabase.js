import pkg from "pg";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

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

async function reconstruct() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting Database Optimization (25 -> 5 Tables)...");

    await client.query("BEGIN");

    // 1. Drop all known old tables
    const oldTables = [
      "Analytics", "Cart", "CartItem", "Category", "CustomProjectRequest",
      "Download", "Order", "OrderItem", "Project", "ProjectCustomizationRequest",
      "ProjectFeature", "ProjectImage", "ProjectTechnology", "ProjectTierContent",
      "ProjectTierFeature", "ProjectVideo", "Purchase", "Receipt", "SupportTicket",
      "Technology", "TicketResponse", "Tier", "Upgrade", "User", "Support", "Transaction", "CustomRequest"
    ];

    for (const table of oldTables) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    console.log("🗑️ Old tables dropped.");

    // 2. Create the 5 Optimized Tables
    
    // -- 1. Users --
    await client.query(`
      CREATE TABLE "User" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -- 2. Projects --
    await client.query(`
      CREATE TABLE "Project" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        is_published BOOLEAN DEFAULT true,
        tech_stack JSONB DEFAULT '[]',
        features JSONB DEFAULT '[]',
        tiers JSONB DEFAULT '[]',
        media JSONB DEFAULT '{"images": [], "videos": []}',
        analytics JSONB DEFAULT '{"views": 0, "downloads": 0}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -- 3. Transactions --
    await client.query(`
      CREATE TABLE "Transaction" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        amount_in_paise INTEGER DEFAULT 0,
        items JSONB DEFAULT '[]',
        payment_info JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -- 4. Support --
    await client.query(`
      CREATE TABLE "Support" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        conversation JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -- 5. CustomRequests --
    await client.query(`
      CREATE TABLE "CustomRequest" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        details JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("🆕 Optimized 5-table schema created.");

    // 3. Seed some initial data
    
    // Hash passwords
    const adminHash = await bcrypt.hash("admin123", 10);
    const userHash = await bcrypt.hash("user123", 10);

    // Create Admin and User
    await client.query(`
      INSERT INTO "User" (email, name, password, role) VALUES 
      ('admin@admin.com', 'Admin User', $1, 'admin'),
      ('user@example.com', 'Regular User', $2, 'user')
    `, [adminHash, userHash]);

    // No default projects added keeping the environment clean

    await client.query("COMMIT");
    console.log("✅ Database reconstruction complete!");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Reconstruction failed:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

reconstruct();

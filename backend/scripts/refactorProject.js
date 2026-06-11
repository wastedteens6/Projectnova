import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.development") });

async function refactorProjectTable() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("Refactoring 'Project' table to match application code...");

    // Drop existing Project-related tables that might conflict
    await client.query(`DROP TABLE IF EXISTS "ProjectTechnology" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ProjectFeature" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ProjectImage" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ProjectVideo" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ProjectTierFeature" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ProjectTierContent" CASCADE`);
    
    // Drop and recreate Project table
    await client.query(`DROP TABLE IF EXISTS "Project" CASCADE`);
    
    await client.query(`
      CREATE TABLE "Project" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        is_published BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        technologies TEXT[] DEFAULT '{}',
        features TEXT[] DEFAULT '{}',
        tiers JSONB DEFAULT '[]',
        images TEXT[] DEFAULT '{}',
        videos TEXT[] DEFAULT '{}',
        analytics JSONB DEFAULT '{"views": 0, "downloads": 0}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("✅ 'Project' table refactored successfully!");

    // Also ensure Other tables are correctly named
    // In admin.js line 309: FROM "Order" o
    // We already have Order table from fixSchema.js, but let's make sure it has all columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
        project_id UUID REFERENCES "Project"(id) ON DELETE SET NULL,
        tier_id INTEGER,
        order_id VARCHAR(255), -- razorpay_order_id
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature TEXT,
        type VARCHAR(50) DEFAULT 'purchase',
        status VARCHAR(50) DEFAULT 'pending',
        amount_in_paise INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ 'Order' table verified!");

  } catch (error) {
    console.error("Error refactoring schema:", error.message);
  } finally {
    await client.end();
  }
}

refactorProjectTable();

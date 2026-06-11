import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.development") });

async function fixSchema() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("Connected to projectnova database for schema fix.");

    // Create Order table if it doesn't exist
    // Based on what routes/orders.js and migrations.js expect
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
        project_id UUID REFERENCES "Project"(id) ON DELETE SET NULL,
        tier_id INTEGER,
        type VARCHAR(50) DEFAULT 'purchase',
        status VARCHAR(50) DEFAULT 'pending',
        amount_in_paise INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Verified 'Order' table.");

    // Create Request table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Request" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
        user_email VARCHAR(255),
        type VARCHAR(50),
        subject VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Verified 'Request' table.");

    // Create Notification table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
        title VARCHAR(255),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Verified 'Notification' table.");

  } catch (error) {
    console.error("Error fixing schema:", error.message);
  } finally {
    await client.end();
  }
}

fixSchema();

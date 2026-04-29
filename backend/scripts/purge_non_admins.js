import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.development") });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin123",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "projectnova",
});

async function purgeUsers() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Delete all Orders that don't belong to admins
    // First, find all admin IDs
    const adminsRes = await client.query('SELECT id FROM "User" WHERE role = \'admin\'');
    const adminIds = adminsRes.rows.map(r => r.id);
    
    console.log(`Found ${adminIds.length} admin(s).`);

    // Delete orders not belonging to these admins
    const delOrders = await client.query('DELETE FROM "Order" WHERE user_id NOT IN (SELECT id FROM "User" WHERE role = \'admin\') OR user_id IS NULL');
    console.log(`Deleted ${delOrders.rowCount} orders.`);

    // 2. Delete all other data associated with non-admins (Support, Requests, etc.)
    const delRequests = await client.query('DELETE FROM "Request" WHERE user_id NOT IN (SELECT id FROM "User" WHERE role = \'admin\')');
    console.log(`Deleted ${delRequests.rowCount} requests.`);

    const delUpgrades = await client.query('DELETE FROM "Upgrade" WHERE user_id NOT IN (SELECT id FROM "User" WHERE role = \'admin\')');
    console.log(`Deleted ${delUpgrades.rowCount} upgrades.`);

    // 3. Finally, delete non-admin users
    const delUsers = await client.query('DELETE FROM "User" WHERE role != \'admin\'');
    console.log(`Deleted ${delUsers.rowCount} non-admin users.`);

    await client.query("COMMIT");
    console.log("Purge complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Purge failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

purgeUsers();

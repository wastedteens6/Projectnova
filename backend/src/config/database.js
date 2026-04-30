import pkg from "pg";
import { getDatabaseConfig } from "./env.js";

const { Pool } = pkg;

// Create PostgreSQL connection pool
export const pool = new Pool(getDatabaseConfig());

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ PostgreSQL database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Close database connection
export async function closeDatabaseConnection() {
  try {
    await pool.end();
    console.log("✅ Database connection pool closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }
}

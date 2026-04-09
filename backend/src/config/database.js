import pkg from "pg";
const { Pool } = pkg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin123",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "projectnova",
});

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

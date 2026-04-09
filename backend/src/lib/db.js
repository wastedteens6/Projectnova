import { pool } from "../config/database.js";

// Re-export the pool for use in routes
export default pool;

// Helper function to execute queries
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

// Helper function for single row query
export async function queryOne(text, params) {
  const results = await query(text, params);
  return results.length > 0 ? results[0] : null;
}

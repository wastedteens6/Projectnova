import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.development") });

async function checkColumns() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Project'
    `);
    console.log("Columns in 'Project' table:");
    console.table(res.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

checkColumns();

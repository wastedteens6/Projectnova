import pkg from "pg";
const { Client } = pkg;
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.development") });

async function seedAdmin() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("Seeding admin user...");

    const email = "admin@admin.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkRes = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
    
    if (checkRes.rows.length === 0) {
      await client.query(
        'INSERT INTO "User" (email, name, password, role) VALUES ($1, $2, $3, $4)',
        [email, "Admin User", hashedPassword, "admin"]
      );
      console.log("✅ Admin user seeded successfully!");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  } finally {
    await client.end();
  }
}

seedAdmin();

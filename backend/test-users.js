import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin123",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "projectnova",
});

async function testUsers() {
  try {
    console.log("\n=== TESTING USER DATA ===\n");

    // Test 1: Count all users
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM "User"',
    );
    const totalCount = countResult.rows[0]?.total;
    console.log(`✓ Total users in database: ${totalCount}`);

    // Test 2: List all users
    const allUsers = await pool.query(
      'SELECT id, email, name, role, created_at FROM "User" ORDER BY created_at DESC',
    );
    console.log(`✓ Users found: ${allUsers.rows.length}`);

    if (allUsers.rows.length > 0) {
      console.log("\nUser List:");
      allUsers.rows.forEach((user, idx) => {
        console.log(
          `  ${idx + 1}. ${user.name} (${user.email}) - Role: ${user.role}`,
        );
      });
    } else {
      console.log("  WARNING: No users found!");
    }

    // Test 3: Check for abc@gmail.com specifically
    const abcUser = await pool.query(
      'SELECT id, email, name, role FROM "User" WHERE email = $1',
      ["abc@gmail.com"],
    );
    console.log(
      `\n✓ abc@gmail.com exists: ${abcUser.rows.length > 0 ? "YES" : "NO"}`,
    );

    if (abcUser.rows.length > 0) {
      const user = abcUser.rows[0];
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - ID: ${user.id}`);
    }

    // Test 4: Check for admin user
    const adminUser = await pool.query(
      'SELECT id, email, name, role FROM "User" WHERE role = $1',
      ["admin"],
    );
    console.log(`\n✓ Admin users: ${adminUser.rows.length}`);

    if (adminUser.rows.length > 0) {
      adminUser.rows.forEach((user) => {
        console.log(`  - ${user.name} (${user.email})`);
      });
    } else {
      console.log("  WARNING: No admin users found!");
    }

    console.log("\n=== TEST COMPLETE ===\n");
    await pool.end();
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
    process.exit(1);
  }
}

testUsers();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "projectnova",
  user: "postgres",
  password: "admin123",
});

async function test() {
  try {
    console.log("\n📊 PURCHASE DATABASE DIAGNOSTICS\n");

    // Check total transactions
    const txCount = await pool.query(
      'SELECT COUNT(*) FROM "Transaction" WHERE type = $1',
      ["purchase"],
    );
    console.log(`✅ Total purchases in DB: ${txCount.rows[0].count}`);

    // Check recent purchases
    console.log("\n📝 Last 5 purchases:\n");
    const recent = await pool.query(
      `
      SELECT 
        t.id,
        t.user_id,
        t.items->>'projectId' as project_id,
        t.amount_in_paise,
        t.created_at,
        u.email
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      WHERE t.type = $1
      ORDER BY t.created_at DESC
      LIMIT 5
    `,
      ["purchase"],
    );

    if (recent.rows.length === 0) {
      console.log("⚠️  No purchases found in database");
    } else {
      recent.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. User: ${row.email || row.user_id}`);
        console.log(`   Amount: ₹${row.amount_in_paise / 100}`);
        console.log(`   Project ID: ${row.project_id}`);
        console.log(`   Date: ${row.created_at}`);
        console.log();
      });
    }

    // Check projects table
    const projCount = await pool.query('SELECT COUNT(*) FROM "Project"');
    console.log(`📦 Total projects in DB: ${projCount.rows[0].count}`);

    // Check users table
    const userCount = await pool.query('SELECT COUNT(*) FROM "User"');
    console.log(`👥 Total users in DB: ${userCount.rows[0].count}`);

    console.log("\n✅ Diagnostics complete\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

test();

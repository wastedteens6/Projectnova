import pg from 'pg';

async function run() {
  const pool = new pg.Pool({
    connectionString: "postgresql://postgres:admin123@localhost:5432/projectnova"
  });
  try {
    const res = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    console.log(`Total Tables: ${res.rows.length}`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();

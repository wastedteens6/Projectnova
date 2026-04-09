import pg from 'pg';

async function run() {
  const pool = new pg.Pool({
    connectionString: "postgresql://postgres:admin123@localhost:5432/projectnova"
  });
  try {
    const res = await pool.query('SELECT * FROM "CustomProjectRequest"');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();

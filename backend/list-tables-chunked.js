import pg from 'pg';
const pool = new pg.Pool({ connectionString: "postgresql://postgres:admin123@localhost:5432/projectnova" });
const { rows } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
for (let i = 0; i < rows.length; i += 5) {
  console.log(rows.slice(i, i + 5).map(r => r.table_name).join(', '));
}
console.log('Total:', rows.length);
await pool.end();

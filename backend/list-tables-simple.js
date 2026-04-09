import pg from 'pg';
const pool = new pg.Pool({ connectionString: "postgresql://postgres:admin123@localhost:5432/projectnova" });
const { rows } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
console.log(rows.map(r => r.table_name).join(', '));
await pool.end();

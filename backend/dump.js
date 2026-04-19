import { pool } from './src/config/database.js';

async function run() {
  try {
    const t = await pool.query(`SELECT * FROM "Tier"`);
    console.log(t.rows);
  } catch(e) { console.error(e) } finally { pool.end() }
}
run();

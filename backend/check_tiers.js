import { pool } from './src/config/database.js';
async function run() {
  try {
    const r = await pool.query('SELECT tiers, title FROM "Project" LIMIT 1');
    console.log(JSON.stringify(r.rows[0], null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();

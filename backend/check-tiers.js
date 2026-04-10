import { pool } from './src/config/database.js';

async function checkTiers() {
  try {
    const res = await pool.query('SELECT id, title, slug, tiers FROM "Project" LIMIT 3');
    console.log('Project Tiers:');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTiers();

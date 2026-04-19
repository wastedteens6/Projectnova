import { pool } from './src/config/database.js';

async function run() {
  try {
    const r = await pool.query(`
      SELECT user_id, project_id, MAX(tier_id) as highest_tier 
      FROM "Order" 
      WHERE type = 'upgrade' OR type = 'purchase'
      GROUP BY user_id, project_id
    `);
    
    for (const update of r.rows) {
      if (update.highest_tier > 1) {
        console.log('Fixing purchase row for project', update.project_id, 'to tier', update.highest_tier);
        await pool.query(
          `UPDATE "Order" SET tier_id = $1 WHERE user_id = $2 AND project_id = $3 AND type = 'purchase'`,
          [update.highest_tier, update.user_id, update.project_id]
        );
      }
    }
    console.log("Upgrades successfully synced to master purchases!");
  } catch(e) { console.error(e) } finally { pool.end() }
}
run();

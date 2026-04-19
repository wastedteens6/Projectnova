import { pool } from './src/config/database.js';
async function run() {
  try {
    const r = await pool.query(`SELECT o.tier_id, t.level as tier_numeric_level, p.tiers FROM "Order" o LEFT JOIN "Project" p ON o.project_id = p.id LEFT JOIN "Tier" t ON o.tier_id = t.id WHERE o.tier_id IS NOT NULL LIMIT 5`);
    for (const row of r.rows) {
      const tierLevel = row.tier_numeric_level || 1;
      let tiersArr = [];
      if (Array.isArray(row.tiers)) tiersArr = row.tiers;
      else if (typeof row.tiers === 'string') { try { tiersArr = JSON.parse(row.tiers) } catch(e){} }
      const matchedTier = tiersArr.find(t => Number(t.level) === Number(tierLevel));
      console.log('Order tierLevel:', tierLevel, 'DriveLink Found:', matchedTier?.drive_link);
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();

import { pool } from './src/config/database.js';

async function addPricesToTiers() {
  try {
    // Get all projects
    const projectsRes = await pool.query('SELECT id, tiers FROM "Project"');
    
    for (const project of projectsRes.rows) {
      if (!project.tiers) continue;
      
      // Add prices to tiers based on level
      const updatedTiers = project.tiers.map(tier => ({
        ...tier,
        price: tier.level === 1 ? 499 : tier.level === 2 ? 999 : 1999
      }));
      
      // Update project
      await pool.query(
        'UPDATE "Project" SET tiers = $1 WHERE id = $2',
        [JSON.stringify(updatedTiers), project.id]
      );
      
      console.log(`✅ Updated ${project.id}: Added prices to tiers`);
    }
    
    console.log('\n🎉 All projects updated with tier prices!');
    console.log('Tier prices set to:');
    console.log('  - Level 1 (Basic/Starter): ₹499');
    console.log('  - Level 2 (Standard/Pro): ₹999');
    console.log('  - Level 3 (Premium/Master): ₹1999');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addPricesToTiers();

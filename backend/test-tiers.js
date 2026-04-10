import { pool } from './src/config/database.js'

async function checkProjectTiers() {
  try {
    console.log('\n=== CHECKING PROJECT TIERS ===\n')
    
    const result = await pool.query(`
      SELECT 
        title, 
        slug,
        tiers
      FROM "Project"
      LIMIT 3
    `)

    result.rows.forEach((row, idx) => {
      console.log(`[${idx}] ${row.title} (${row.slug})`)
      console.log('Tiers:', JSON.stringify(row.tiers, null, 2))
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkProjectTiers()

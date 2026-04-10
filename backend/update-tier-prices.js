import { pool } from './src/config/database.js'

async function updateTierPrices() {
  try {
    console.log('\n=== UPDATING TIER PRICES ===\n')
    
    // First, let's see what tiers currently exist
    const checkResult = await pool.query(`
      SELECT id, title, tiers
      FROM "Project"
    `)

    console.log(`Found ${checkResult.rows.length} projects`)
    
    // Update each project
    for (const project of checkResult.rows) {
      if (project.tiers && Array.isArray(project.tiers)) {
        console.log(`\nProject: ${project.title}`)
        console.log('Current tiers:', JSON.stringify(project.tiers, null, 2))
        
        // Ensure each tier has a price
        const updatedTiers = project.tiers.map((tier, idx) => {
          if (!tier.price || tier.price === 0) {
            const defaultPrices = [2499, 3499, 4499] // Default prices for Starter, Standard, Premium
            return {
              ...tier,
              price: defaultPrices[idx] || 2499
            }
          }
          return tier
        })
        
        console.log('Updated tiers:', JSON.stringify(updatedTiers, null, 2))
        
        // Update in database
        await pool.query(
          'UPDATE "Project" SET tiers = $1 WHERE id = $2',
          [JSON.stringify(updatedTiers), project.id]
        )
        console.log('✅ Updated in database')
      }
    }

    console.log('\n=== VERIFICATION ===\n')
    
    // Verify the updates
    const verifyResult = await pool.query(`
      SELECT title, tiers
      FROM "Project"
    `)
    
    verifyResult.rows.forEach((row) => {
      console.log(`${row.title}:`, JSON.stringify(row.tiers, null, 2))
    })

    console.log('\n✅ All projects updated!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

updateTierPrices()

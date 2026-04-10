import { pool } from './src/config/database.js'

async function fixTierPrices() {
  try {
    console.log('\n🔧 FIXING TIER PRICES...\n')
    
    // Fixed tier prices based on level
    const defaultPrices = {
      1: 2499,
      2: 3499,
      3: 4499
    }
    
    const result = await pool.query(`
      SELECT id, title, tiers
      FROM "Project"
      WHERE tiers IS NOT NULL
    `)

    console.log(`Found ${result.rows.length} projects with tiers\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const project of result.rows) {
      try {
        const tiers = JSON.parse(JSON.stringify(project.tiers))
        let needsUpdate = false
        
        // Check and fix each tier
        tiers.forEach(tier => {
          const tierLevel = parseInt(tier.level) || 1
          if (!tier.price || tier.price === 0 || tier.price === '0') {
            tier.price = defaultPrices[tierLevel] || 2499
            needsUpdate = true
          }
        })
        
        if (needsUpdate) {
          await pool.query(
            'UPDATE "Project" SET tiers = $1 WHERE id = $2',
            [JSON.stringify(tiers), project.id]
          )
          console.log(`✅ Updated: ${project.title}`)
          console.log(`   Tiers:`, JSON.stringify(tiers.map(t => ({ level: t.level, name: t.name, price: t.price }))))
          updated++
        } else {
          console.log(`⏭️  Skipped: ${project.title} (already has prices)`)
          skipped++
        }
      } catch (err) {
        console.error(`❌ Error processing ${project.title}:`, err.message)
      }
    }

    console.log(`\n✨ Done! Updated: ${updated}, Skipped: ${skipped}`)
    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

fixTierPrices()

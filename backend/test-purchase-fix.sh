#!/bin/bash
# Test script to verify purchase fix is working

echo "🧪 TESTING PURCHASE DASHBOARD FIX"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check backend database
echo "📊 Checking database for purchases..."
cd backend

# Create a test query script
cat > test-query.js << 'EOF'
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'projectnova',
  user: 'postgres',
  password: 'admin123'
});

async function test() {
  try {
    // Get purchase count
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM "Transaction" WHERE type = $1',
      ['purchase']
    );
    const count = result.rows[0].count;
    
    if (count > 0) {
      console.log(`${count}`);
    } else {
      console.log('0');
    }
  } finally {
    await pool.end();
  }
}

test();
EOF

# Run the query
count=$(node test-query.js 2>/dev/null)

if [ "$count" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS: Found $count purchase(s) in database${NC}"
  echo ""
  echo "📝 Recent purchases:"
  node -e "
    import pkg from 'pg';
    const { Pool } = pkg;
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'projectnova',
      user: 'postgres',
      password: 'admin123'
    });
    
    pool.query(\`
      SELECT 
        t.id,
        u.email,
        t.amount_in_paise / 100 as price_rupees,
        t.created_at
      FROM \"Transaction\" t
      LEFT JOIN \"User\" u ON t.user_id = u.id
      WHERE t.type = 'purchase'
      ORDER BY t.created_at DESC
      LIMIT 3
    \`, async (err, res) => {
      if (err) console.error('Error:', err.message);
      else {
        res.rows.forEach((row, i) => {
          console.log(\`  \${i+1}. \${row.email} - ₹\${row.price_rupees}\`);
        });
      }
      await pool.end();
    });
  " 2>/dev/null
else
  echo -e "${RED}❌ FAIL: No purchases found in database${NC}"
  echo ""
  echo "📋 To test the fix:"
  echo "   1. Go to http://localhost:5173 (frontend)"
  echo "   2. Login"
  echo "   3. Add a project to cart"
  echo "   4. Go to checkout"
  echo "   5. Complete payment (mock mode)"
  echo "   6. Run this test again"
fi

echo ""
echo "✅ Test complete"

# Cleanup
rm -f test-query.js

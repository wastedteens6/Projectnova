# Integration Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd backend
npm install @prisma/client prisma
```

Already installed: ✅ (check package.json)

### 2. Initialize Database

```bash
# Set up database
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

### 3. Start Backend

```bash
npm run dev
```

The backend will automatically create the SQLite database at `backend/prisma/dev.db`

### 4. Test Purchases

The system is ready! Use the UI to:

1. Browse projects on home/projects page
2. Add to cart and proceed to checkout
3. Complete mock payment (in development mode)
4. See updated UI with Download Receipt and Upgrade buttons

---

## Step-by-Step Integration

### Backend Setup

#### Step 1: Verify Prisma Configuration

File: `backend/prisma/schema.prisma` (Already created)

#### Step 2: Update Environment Variables

File: `backend/.env.development` (Already updated)

Add if missing:

```env
DATABASE_URL="file:./prisma/dev.db"
```

#### Step 3: Create Database

```bash
cd backend
npm run db:push
```

This creates:

- SQLite database file at `backend/prisma/dev.db`
- All required tables (users, projects, purchases, etc.)

#### Step 4: Verify Routes are Loaded

Check `backend/src/main.js`:

```javascript
// (Already updated)
app.use("/api/purchases", purchasesRoutes);
app.use("/api/receipts", receiptsRoutes);
```

### Frontend Setup

#### Step 1: Import Service

In any component that needs purchase functionality:

```typescript
import {
  recordPurchase,
  downloadReceipt,
  checkPurchaseStatus,
  upgradePurchase,
} from "@/services/purchaseService";
```

#### Step 2: Use Wrapper Functions

All functionality is in `frontend/src/services/purchaseService.ts` for easy API calls.

#### Step 3: Update Component State

Projects.tsx already includes:

- Purchase status checking
- Dynamic button rendering
- Receipt download handling
- Upgrade functionality

### Testing the Complete Flow

#### Test 1: Record a Purchase

1. Go to home page
2. Click "Explore Projects"
3. Click "Buy Now" on any project
4. Complete checkout with mock payment
5. Should see:
   - "Download Receipt" button
   - "Upgrade Project" button
   - Success message

#### Test 2: Download Receipt

1. After purchase, click "Download Receipt"
2. Receipt file (`.txt`) should download with:
   - Transaction ID
   - Receipt number
   - Buyer information
   - Project details
   - Date/time
   - Amount paid

#### Test 3: Upgrade Tier

1. After purchase (non-Tier 3), click "Upgrade Project"
2. Add to cart
3. Proceed to checkout
4. Complete mock payment
5. Tier should update (see "Upgrade to Tier 3" next time if on Tier 2)

#### Test 4: Search & Filter

1. On projects page, use search bar
2. Select category filters
3. Both should work together
4. Results persist after purchase

---

## Demonstrating Purchase UI Updates

### Before Purchase

Project card shows:

- "Add to Cart" button (blue)
- "Buy Now" button (purple)

### After Purchase

Project card shows:

- "Download Receipt" button (green) ✅
- "Upgrade Project" button (orange) ⬆️

### After Upgrading to Tier 3

Project card shows:

- "Download Receipt" button (green) ✅
- "Already on highest tier!" message

---

## API Endpoints Reference

### Purchases API

#### Record Purchase

```
POST /api/purchases/record-purchase
Content-Type: application/json

{
  "projectId": "proj123",
  "tier": "Tier 1",
  "price": 499,
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "orderId": "order_123"
}

Response:
{
  "success": true,
  "purchase": {
    "id": "purch123",
    "userId": "user456",
    "projectId": "proj123",
    "tier": "Tier 1",
    "price": 49900,
    "createdAt": "2024-04-08T..."
  }
}
```

#### Check Purchase Status

```
GET /api/purchases/check-purchase/:projectId?userId=user456

Response:
{
  "purchased": true,
  "tier": "Tier 1",
  "price": 49900
}
```

#### Get My Purchases

```
GET /api/purchases/my-purchases
Auth: Bearer token

Response:
{
  "success": true,
  "purchases": [...]
}
```

#### Upgrade Purchase

```
POST /api/purchases/upgrade
Content-Type: application/json
Auth: Bearer token

{
  "projectId": "proj123",
  "newTier": "Tier 2",
  "priceIncrease": 500
}

Response:
{
  "success": true,
  "upgrade": {...},
  "updatedPurchase": {...}
}
```

### Receipts API

#### Get Receipt

```
GET /api/receipts/receipt/:purchaseId?userId=user456

Response:
{
  "success": true,
  "receipt": {
    "transactionId": "TXN-...",
    "receiptNumber": "RCP-...",
    "date": "08/04/2024",
    "time": "...",
    "user": {...},
    "project": {...},
    "tier": "Tier 1",
    "amount": "₹499",
    "status": "PAID"
  }
}
```

#### Download Receipt (TXT)

```
GET /api/receipts/download-txt/:purchaseId?userId=user456

Returns: File download (receipt_RCP-xxxxx.txt)
```

#### Download Receipt (JSON)

```
GET /api/receipts/download/:purchaseId?userId=user456

Returns: File download (receipt_RCP-xxxxx.json)
```

---

## Database Schema Quick Reference

### Purchase Record

```
{
  id: string (unique)
  userId: string (FK to User)
  projectId: string (FK to Project)
  tier: string ("Tier 1" | "Tier 2" | "Tier 3")
  price: int (amount in paise)
  orderId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Upgrade Record

```
{
  id: string (unique)
  purchaseId: string (FK to Purchase)
  fromTier: string
  toTier: string
  priceIncrease: int (paise)
  createdAt: DateTime
}
```

### Receipt Record

```
{
  id: string (unique)
  purchaseId: string (FK to Purchase)
  userId: string (FK to User)
  transactionId: string
  pdfUrl: string (optional, for future PDF storage)
  createdAt: DateTime
}
```

---

## Troubleshooting

### Issue: Database not creating tables

```bash
# Check if Prisma is installed
npm list @prisma/client

# Reinstall if needed
npm install @prisma/client prisma

# Try migration again
npm run db:push
```

### Issue: Purchase not saving

```bash
# Check backend logs for errors
npm run dev

# Check if DATABASE_URL is set
echo $DATABASE_URL

# Verify database file exists
ls -la backend/prisma/dev.db
```

### Issue: Receipts not downloading

```javascript
// Check browser console for errors
// Verify userId is being passed correctly
console.log("userId:", localStorage.getItem("userId"));

// Test API directly
fetch("http://localhost:5000/api/receipts/receipt/purchaseId?userId=userId");
```

### Issue: Upgrade button not showing

```javascript
// Verify purchase was recorded
db.purchase.findUnique({ where: { userId_projectId: {...} } })

// Check tier value
console.log('tier:', purchase.tier)

// Should be exactly: "Tier 1", "Tier 2", or "Tier 3"
```

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend APIs implemented
3. ✅ Frontend integration ready
4. 📋 (Optional) Add email receipt notifications
5. 📋 (Optional) Add PDF receipt generation
6. 📋 (Optional) Add analytics dashboard
7. 📋 (Optional) Add refund system

---

## Support & Questions

### Check These Files

- Backend logic: `backend/src/routes/purchases.js`, `backend/src/routes/receipts.js`
- Frontend service: `frontend/src/services/purchaseService.ts`
- UI components: `frontend/src/pages/Projects.tsx`, `frontend/src/pages/Checkout.tsx`
- Database schema: `backend/prisma/schema.prisma`

### Debug Mode

Enable verbose logging:

```javascript
// In any file
console.log("Purchase flow:", {
  projectId,
  userId,
  tier,
  price,
});
```

### Contact

For implementation questions, check the main guide: `docs/POST_PURCHASE_IMPLEMENTATION.md`

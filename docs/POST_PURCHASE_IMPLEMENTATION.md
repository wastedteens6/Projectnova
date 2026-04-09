# Post-Purchase System Implementation Guide

## Overview

This guide explains the complete post-purchase system including upgrades and receipt generation that's been added to the ProjectNova e-commerce platform.

## Architecture

### Database Schema (Prisma)

The system uses four main models:

1. **User** - Stores user information
2. **Project** - Project metadata
3. **Purchase** - Records user purchases with tier information
4. **Upgrade** - Tracks tier upgrades
5. **Receipt** - Generated receipts for purchases

### Backend Structure

#### New Routes

**1. `/api/purchases` - Purchase Management**

- `POST /record-purchase` - Record a new purchase
- `GET /my-purchases` - Get user's purchase history
- `GET /check-purchase/:projectId` - Check if user has purchased a project
- `POST /upgrade` - Upgrade to higher tier

**2. `/api/receipts` - Receipt Generation & Download**

- `GET /receipt/:purchaseId` - Get receipt data
- `GET /download/:purchaseId` - Download as JSON
- `GET /download-txt/:purchaseId` - Download as TXT file
- `GET /user-receipts/:userId` - List all user receipts

#### Updated Routes

**`/api/checkout/verify-payment`** - Extended to automatically record purchases after payment verification

## Frontend Implementation

### Components Updated

1. **Projects.tsx** - Displays projects with:
   - Search functionality
   - Category filters
   - Dynamic buttons based on purchase status
   - Upgrade functionality

2. **Checkout.tsx** - Handles:
   - Payment processing
   - Purchase recording (via backend)
   - localStorage fallback

### New Service: `purchaseService.ts`

Helper functions for:

- `recordPurchase()` - Record purchase in database
- `checkPurchaseStatus()` - Check if user owns project
- `downloadReceipt()` - Download receipt as file
- `getReceipt()` - Fetch receipt data
- `upgradePurchase()` - Upgrade to next tier

## Tier System

### Pricing

- **Tier 1**: ₹499
- **Tier 2**: ₹999
- **Tier 3**: ₹1999

### Features

- Dynamic button updates after purchase
- Price difference calculation for upgrades
- Upgrade history tracking

## Purchase Flow

### Step 1: User Adds to Cart

```
User selects "Add to Cart" or "Buy Now"
→ Cart stored in localStorage
```

### Step 2: User Proceeds to Checkout

```
POST /api/checkout/create-order
↓
Mock or Real Razorpay order created
↓
Frontend displays Razorpay modal
```

### Step 3: Payment Success

```
POST /api/checkout/verify-payment
↓
Backend records purchase in database:
  - Creates/updates User record
  - Creates/updates Project record
  - Creates Purchase record with tier info
↓
Frontend updates UI
↓
Redirects to Dashboard
```

### Step 4: Post-Purchase UI

```
Project card now shows:
- "Download Receipt" button
- "Upgrade Project" button (if not on highest tier)
- Removes "Add to Cart" / "Buy Now" buttons
```

## Upgrade Flow

### Step 1: User Clicks "Upgrade Project"

```
User is on purchased project and sees upgrade option
↓
Click "Upgrade to Next Tier"
```

### Step 2: Price Calculation

```
Next tier price difference is calculated
Example: Currently on Tier 1 (₹499) → Tier 2 (₹999)
Additional cost = ₹500
```

### Step 3: Add to Cart & Checkout

```
Upgrade is added to cart as special item
↓
User proceeds to checkout
↓
Payment is processed for additional amount only
↓
Backend records upgrade in database
```

### Step 4: Tier Updated

```
Purchase record tier updated to new tier
Upgrade record created with history
Receipt shows new tier

Next time: Button shows upgrade to Tier 3
```

## Receipt System

### Receipt Generation

Each receipt contains:

- Transaction ID: `TXN-${timestamp}-${random}`
- Receipt Number: `RCP-${purchaseId}`
- User information (name, email)
- Project details
- Tier purchased
- Amount paid
- Date & Time
- Payment method
- Status (PAID)

### Download Options

1. **Text Format (.txt)** - Formatted receipt with borders
2. **JSON Format (.json)** - Structured receipt data

### Storage

Currently receipts are generated on-the-fly. To persist:

1. Store PDF in cloud storage (S3, etc.)
2. Store URL in `Receipt.pdfUrl` field
3. Add PDF generation library (e.g., PDFKit)

## Implementation Checklist

### Backend Setup

- [x] Create Prisma schema
- [x] Set up database connection
- [x] Create `/api/purchases` routes
- [x] Create `/api/receipts` routes
- [x] Update `/api/checkout/verify-payment`
- [x] Add purchase recording logic

### Database Migration

```bash
# Initialize database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### Frontend Integration

- [x] Create `purchaseService.ts`
- [x] Update Projects.tsx with purchase checks
- [x] Update Checkout.tsx to record purchases
- [x] Add receipt download functionality
- [x] Add upgrade UI buttons
- [x] Update Home.tsx with search

### Configuration

- Add `DATABASE_URL` to `.env.development`
- Ensure Prisma Client is installed
- Configure SQLite path or use actual database

## API Usage Examples

### Check Purchase Status

```javascript
import { checkPurchaseStatus } from "@/services/purchaseService";

const status = await checkPurchaseStatus(projectId, userId);
// Returns: { purchased: boolean, tier: string, price: number }
```

### Record Purchase

```javascript
import { recordPurchase } from "@/services/purchaseService";

const purchase = await recordPurchase(
  projectId,
  "Tier 1",
  499,
  userEmail,
  userName,
);
```

### Download Receipt

```javascript
import { downloadReceipt } from "@/services/purchaseService";

await downloadReceipt(purchaseId, userId, "my-receipt");
// Downloads receipt_RCP-xxxxx.txt
```

### Upgrade Purchase

```javascript
import { upgradePurchase } from "@/services/purchaseService";

const upgrade = await upgradePurchase(
  projectId,
  "Tier 2",
  500, // Price difference
);
```

## Backward Compatibility

✅ **No Breaking Changes**

- Existing localStorage system still works
- Cart functionality unchanged
- Order flow preserved
- Payment system extended, not modified
- Frontend gracefully handles both old and new data

## Debugging

### Check Database Records

```javascript
// Via Prisma Studio
npx prisma studio

// Via queries
npx prisma db execute --stdin
```

### Common Issues

1. **Purchases not saving**
   - Check DATABASE_URL in .env
   - Verify Prisma migration ran
   - Check browser console for API errors

2. **Receipts not downloading**
   - Check CORS settings
   - Verify API endpoint is accessible
   - Check userId parameter in request

3. **Upgrade button not showing**
   - Verify purchase was recorded
   - Check tier matches expected values
   - Check user ID matches purchase

## Future Enhancements

1. **PDF Receipt Generation**
   - Use PDFKit or similar
   - Embed project details
   - Add branding/logo

2. **Email Receipts**
   - Send receipt via nodemailer
   - Store in cloud storage
   - Track sent receipts

3. **Advanced Analytics**
   - Track upgrade rates
   - Monitor tier distribution
   - Analyze purchase patterns

4. **Subscription Model**
   - Add recurring payments
   - Monthly tiers
   - Auto-renewal logic

5. **Refund System**
   - Refund logic for recent purchases
   - Automatic tier downgrade
   - Refund status tracking

## Support

For issues or questions, check:

1. Backend logs: `npm run dev`
2. Frontend console: Browser DevTools
3. Database: `npx prisma studio`
4. API endpoints: Postman collection (coming soon)

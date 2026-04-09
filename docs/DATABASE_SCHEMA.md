# Database Schema Changes

## Overview

This document describes the database schema additions for the post-purchase system.

## New Tables

### `users` Table

Stores user account information (extended from auth system).

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String
  password  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  purchases Purchase[]
  receipts  Receipt[]
}
```

**SQL Equivalent:**

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### `projects` Table

Stores project metadata.

```prisma
model Project {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  description String
  category    String?
  techStack   String?    // JSON string array

  purchases Purchase[]
}
```

**SQL Equivalent:**

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  techStack TEXT
);
```

---

### `purchases` Table

Records user purchases with tier information. **KEY TABLE**

```prisma
model Purchase {
  id        String     @id @default(cuid())
  userId    String
  projectId String
  tier      String     @default("Tier 1")
  price     Int        // Amount in paise
  orderId   String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  receipt   Receipt?
  upgrades  Upgrade[]

  @@unique([userId, projectId])
}
```

**SQL Equivalent:**

```sql
CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  tier TEXT DEFAULT 'Tier 1',
  price INTEGER NOT NULL,
  orderId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (userId, projectId)
);
```

**Key Points:**

- `price` is in paise (₹1 = 100 paise)
- `tier` tracks current tier level
- Unique constraint ensures one active purchase per user per project
- Cascading delete means deleting user/project deletes their purchases

**Example Records:**

```
id: "purch_abc123"
userId: "user_xyz789"
projectId: "proj_demo001"
tier: "Tier 1"
price: 49900        # ₹499
orderId: "order_123"
createdAt: 2024-04-08T10:30:00Z
```

---

### `upgrades` Table

Tracks tier upgrades for historical purposes.

```prisma
model Upgrade {
  id        String   @id @default(cuid())
  purchaseId String
  fromTier  String
  toTier    String
  priceIncrease Int  // Additional cost in paise
  createdAt DateTime @default(now())

  purchase  Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
}
```

**SQL Equivalent:**

```sql
CREATE TABLE upgrades (
  id TEXT PRIMARY KEY,
  purchaseId TEXT NOT NULL,
  fromTier TEXT NOT NULL,
  toTier TEXT NOT NULL,
  priceIncrease INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
);
```

**Example Records:**

```
id: "upg_def456"
purchaseId: "purch_abc123"
fromTier: "Tier 1"
toTier: "Tier 2"
priceIncrease: 50000    # Additional ₹500
createdAt: 2024-04-08T11:15:00Z
```

---

### `receipts` Table

Stores receipt metadata and optional PDF links.

```prisma
model Receipt {
  id        String   @id @default(cuid())
  purchaseId String  @unique
  transactionId String
  pdfUrl    String?
  createdAt DateTime @default(now())
  userId    String

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  purchase  Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
}
```

**SQL Equivalent:**

```sql
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  purchaseId TEXT UNIQUE NOT NULL,
  transactionId TEXT NOT NULL,
  pdfUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Example Records:**

```
id: "rcp_ghi789"
purchaseId: "purch_abc123"
transactionId: "TXN-1712571600000-a1b2c3d4e"
pdfUrl: null                    # To be filled when PDF is generated
createdAt: 2024-04-08T10:30:00Z
userId: "user_xyz789"
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ password    │
└─────┬───────┘
      │ 1
      │
      ├─────── 1:N ────── Purchase
      │
      └─────── 1:N ────── Receipt


┌─────────────┐
│   Project   │
├─────────────┤
│ id (PK)     │
│ title       │
│ slug        │
└─────┬───────┘
      │ 1
      │
      └─────── 1:N ────── Purchase
                            │ 1
                            │
                            ├─── 1:1 ── Receipt
                            │
                            └─── 1:N ── Upgrade
```

### Relationship Details

1. **User → Purchase** (1:Many)
   - One user can have many purchases
   - Delete user → delete all purchases (cascade)

2. **Project → Purchase** (1:Many)
   - One project can be purchased by many users
   - Delete project → delete all purchases (cascade)

3. **Purchase → Receipt** (1:One)
   - Each purchase has one optional receipt
   - Generated after successful purchase

4. **Purchase → Upgrade** (1:Many)
   - One purchase can have multiple upgrades
   - Tracks full upgrade history

5. **User → Receipt** (1:Many)
   - User can have many receipt records
   - Useful for listing all receipts for a user

---

## Migration Instructions

### Option 1: Automatic (Recommended)

```bash
cd backend
npm run db:push
```

Prisma will:

1. Analyze the schema
2. Generate SQL migrations
3. Apply migrations automatically
4. Create tables in dev.db

### Option 2: Manual SQL

If using PostgreSQL/MySQL instead of SQLite:

```bash
npm run db:migrate dev
```

Follow prompts to create named migration.

### Option 3: Full Reset

```bash
# WARNING: Deletes all data
rm backend/prisma/dev.db

# Re-create database
npm run db:push
```

---

## Data Types Reference

| Type       | SQLite Type   | Description             |
| ---------- | ------------- | ----------------------- |
| `String`   | TEXT          | Text data, limited size |
| `Int`      | INTEGER       | Whole numbers only      |
| `DateTime` | DATETIME      | Timestamp with timezone |
| `Boolean`  | INTEGER (0/1) | True/False              |

---

## Indexing Strategy

### Current Indexes (Automatic)

- `users.email` - UNIQUE (for lookups)
- `projects.slug` - UNIQUE (for SEO/lookups)
- `purchases` foreign keys - Indexed by Prisma
- `purchases.userId_projectId` - UNIQUE compound

### Recommended Additional Indexes (for scaling)

```sql
-- For get my purchases queries
CREATE INDEX idx_purchases_userId ON purchases(userId);

-- For receipt lookups
CREATE INDEX idx_receipts_userId ON receipts(userId);

-- For user filtration
CREATE INDEX idx_purchases_createdAt ON purchases(createdAt DESC);

-- For tier analytics
CREATE INDEX idx_purchases_tier ON purchases(tier);
```

Add to `schema.prisma` if needed:

```prisma
model Purchase {
  // ... fields
  @@index([userId])
  @@index([createdAt])
  @@index([tier])
}
```

---

## Backup & Recovery

### Backup Database

```bash
# SQLite
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# With timestamp
cp backend/prisma/dev.db backend/prisma/dev.db.$(date +%s).backup
```

### Restore Database

```bash
cp backend/prisma/dev.db.backup backend/prisma/dev.db
```

### Export Data

```bash
# Export to JSON
npx prisma db execute --stdin <<EOF
SELECT * FROM purchases;
EOF
```

---

## Data Validation

### Tier Values

Must be one of:

- `"Tier 1"`
- `"Tier 2"`
- `"Tier 3"`

### Price Values

- Stored in paise (₹1 = 100 paise)
- Must be positive integer
- Example: ₹499 = 49900 paise

### Email Validation

- UNIQUE constraint enforced
- Valid email format recommended (add validation in API)

---

## Constraints Explained

### UNIQUE Constraints

```
purchases(userId, projectId)
→ One user can only have ONE active purchase record per project
→ Prevents duplicate purchases
```

### FOREIGN KEY Constraints

```
purchases.userId → users.id
purchases.projectId → projects.id
→ Can't create purchase for non-existent user/project
→ Deleting user/project cascades delete to purchases
```

### DEFAULT Values

```
purchases.tier = "Tier 1"
purchases.createdAt = NOW()
→ Automatically set if not provided
```

---

## Future Schema Enhancements

### For PDF Storage

```prisma
model Receipt {
  // ... existing fields
  pdfUrl    String?
  pdfSize   Int?
  pdfHash   String?
}
```

### For Subscriptions

```prisma
model Subscription {
  id          String   @id @default(cuid())
  userId      String
  plan        String  // "monthly", "yearly"
  startDate   DateTime
  endDate     DateTime?
  autoRenew   Boolean  @default(true)
  price       Int
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

### For Refunds

```prisma
model Refund {
  id          String   @id @default(cuid())
  purchaseId  String
  reason      String
  amount      Int
  status      String  // "pending", "approved", "rejected"
  createdAt   DateTime @default(now())

  purchase    Purchase @relation(fields: [purchaseId], references: [id])
}
```

---

## Statistics Queries

### Total Revenue

```sql
SELECT
  SUM(price) / 100.0 as total_revenue_rupees,
  COUNT(*) as total_purchases
FROM purchases;
```

### Revenue by Tier

```sql
SELECT
  tier,
  COUNT(*) as purchase_count,
  SUM(price) / 100.0 as tier_revenue
FROM purchases
GROUP BY tier;
```

### Most Popular Projects

```sql
SELECT
  p.title,
  COUNT(pu.id) as purchase_count
FROM purchases pu
JOIN projects p ON pu.projectId = p.id
GROUP BY pu.projectId
ORDER BY purchase_count DESC
LIMIT 10;
```

### Upgrade Statistics

```sql
SELECT
  fromTier,
  toTier,
  COUNT(*) as upgrade_count
FROM upgrades
GROUP BY fromTier, toTier;
```

---

## Maintenance

### Regular Backups

```bash
# Daily backup script
0 3 * * * cp /path/to/db /path/to/backup/db.$(date +\%s).backup
```

### Database Cleanup

```sql
-- Remove old test data (over 30 days old)
DELETE FROM receipts
WHERE createdAt < datetime('now', '-30 days')
AND transactionId LIKE 'TXN-test-%';
```

### Optimization

```sql
-- Analyze query performance
ANALYZE;

-- Rebuild indexes
REINDEX;

-- Vacuum to reclaim space
VACUUM;
```

Execute via Prisma:

```bash
npx prisma db execute --stdin < cleanup.sql
```

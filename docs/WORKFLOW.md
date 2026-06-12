# ProjectNova - Business & Technical Workflows

This document details all business and developer workflows inside the ProjectNova platform. Each workflow traces frontend UI components, backend endpoints, and database interactions.

---

## 👥 User Workflows

### 1. User Registration & MFA Configuration
*   **Step-by-Step:**
    1.  User enters credentials inside the signup form.
    2.  System registers user and redirects to MFA setup wizard if required.
    3.  A unique TOTP secret is generated, QR code is generated, and user registers device.
*   **Frontend Components:** `Register.tsx`, `MfaSetup.tsx`
*   **Backend APIs:** `POST /api/auth/register`, `POST /api/auth/setup-mfa`
*   **Database Actions:** `INSERT INTO "User"` and `UPDATE "User" SET metadata = metadata || '{"mfa_secret": "..."}'`

### 2. User Authentication & Login
*   **Step-by-Step:**
    1.  User submits username and password.
    2.  If credentials match, backend checks if MFA is active.
    3.  If active, a temporary JWT is generated, prompting code inputs. Valid code returns the session token.
*   **Frontend Components:** `Login.tsx`, `MfaVerify.tsx`
*   **Backend APIs:** `POST /api/auth/login`, `POST /api/auth/verify-mfa`
*   **Database Actions:** `SELECT password, metadata FROM "User" WHERE email = $1`

### 3. Catalog Browsing & Cart Management
*   **Step-by-Step:**
    1.  User scrolls list of projects or queries titles.
    2.  Items are added/removed from persistent backend carts.
*   **Frontend Components:** `Catalog.tsx`, `ProjectDetail.tsx`, `CartContext.tsx`
*   **Backend APIs:** `GET /api/projects`, `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/:projectId`
*   **Database Actions:** `SELECT * FROM "Project"`, `INSERT INTO "Cart" ON CONFLICT DO UPDATE`

### 4. Checkout, Payments & Dynamic Upgrade
*   **Step-by-Step:**
    1.  User clicks checkout or triggers tier upgrade.
    2.  Backend calculates upgrade diffs or processes checkout order.
    3.  Razorpay checkout modal loads. On success, signature is validated and database creates verified order.
*   **Frontend Components:** `Checkout.tsx`, `PurchaseUpgrade.tsx`, `RazorpayModal.ts`
*   **Backend APIs:** `POST /api/checkout/create-order`, `POST /api/checkout/verify-payment`, `POST /api/purchases/upgrade-tier/preview`, `POST /api/purchases/upgrade-tier/confirm`
*   **Database Actions:** `INSERT INTO "Transaction"`, `UPDATE "Order" SET tier_id = $1`, `INSERT INTO "Order"` (for upgrades tracking).

### 5. Receipts & Support Tickets
*   **Step-by-Step:**
    1.  Customer downloads invoice receipt (txt layout formatted for printing).
    2.  User submits help requests and messages support.
*   **Frontend Components:** `Purchases.tsx`, `ReceiptView.tsx`, `Support.tsx`
*   **Backend APIs:** `GET /api/receipts/receipt/:transactionId`, `GET /api/receipts/download-txt/:transactionId`, `POST /api/support/tickets`, `POST /api/support/tickets/:id/message`
*   **Database Actions:** `SELECT FROM "Order"`, `INSERT INTO "Request"`, `UPDATE "Request" SET conversation = $1`

---

## 👑 Admin Workflows

### 1. Project Management
*   **Step-by-Step:**
    1.  Admin logs in and opens project catalog settings.
    2.  Admin uploads image cards, details descriptions, package names, files, and links.
*   **Frontend Components:** `AdminDashboard.tsx`, `ProjectUpload.tsx`
*   **Backend APIs:** `POST /api/projects/create` (using `multer` storage middleware)
*   **Database Actions:** `INSERT INTO "Project" (title, description, tiers, media)`

### 2. Settings & Asset Uploading
*   **Step-by-Step:**
    1.  Admin modifies default site name, currencies, tax configurations.
    2.  Admin uploads brand image logo and favicon icons.
*   **Frontend Components:** `AdminSettings.tsx`
*   **Backend APIs:** `PUT /api/settings`, `POST /api/settings/upload`
*   **Database Actions:** `INSERT INTO "Settings" ON CONFLICT DO UPDATE`

### 3. Role Management Configuration
*   **Step-by-Step:**
    1.  Admin sets custom database user roles.
    2.  Roles define list of matching action authorization permissions.
*   **Frontend Components:** `AdminRoles.tsx`
*   **Backend APIs:** `GET /api/roles`, `POST /api/roles`, `PUT /api/roles/:name`, `DELETE /api/roles/:name`
*   **Database Actions:** `INSERT INTO "Role"`, `UPDATE "Role"`, `DELETE FROM "Role"`

---

## 💻 Developer Workflows

### 1. Setting Up Local Environment

#### Pre-requisites:
- Install **Node.js** (v18+)
- Install **PostgreSQL** database engine

#### Database Schema Generation:
Run schema scripts to load structures:
```bash
# Set environment details in backend/.env.development
# Initialize table setup
npm run db:init
```
Alternatively, log in to PostgreSQL CLI `psql` and execute setup seeds:
```bash
psql -U postgres -d projectnova -f schema.sql
```

#### Running Backend Services:
```bash
cd backend
npm install
npm run dev
```

#### Running Frontend Application:
```bash
cd frontend
npm install
npm run dev
```

### 2. Config File Configurations

Create configuration files mapping environment variables:

**Backend (`backend/.env.development`):**
```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/projectnova"
JWT_SECRET="your-dev-secret-key"
JWT_EXPIRY="7d"
PORT=5000
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
CLIENT_URL="http://localhost:5173"
```

**Frontend (`frontend/.env.local`):**
```ini
VITE_API_URL="http://localhost:5000"
VITE_APP_NAME="ProjectNova"
```

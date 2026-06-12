# ProjectNova - Deployment Guide

This guide outlines the deployment process for ProjectNova, a full-stack e-commerce marketplace. The monorepo consists of two separate applications:
- `/frontend` → React + Vite Single Page Application (SPA)
- `/backend` → Node.js + Express REST API

---

## ════════════════════════════════════════════
## PART 1 — DATABASE SETUP (Do this first)
## ════════════════════════════════════════════

1. **Provision a PostgreSQL Instance:**
   We recommend provisioning an instance via the Railway PostgreSQL plugin or using an external managed PostgreSQL provider (e.g., Neon or Supabase).
2. **Retrieve Connection String:**
   Copy the `DATABASE_URL` connection string. The connection string format should resemble:
   ```
   postgresql://postgres:password@host.railway.internal:5432/railway
   ```
3. **Database Migration Strategy:**
   The backend automatically runs migrations on startup via [migrations.js](file:///c:/Users/Shree%20Londhe/Desktop/Wastedteens%20site/projectnova/Projectnova/backend/src/config/migrations.js).
   No manual schema execution is needed.
   > [!NOTE]
   > In case of schema mismatches or if automatic migrations need manual override, you can manually execute the SQL schema definition:
   > ```bash
   > psql -U postgres -d projectnova -f schema.sql
   > ```
4. **Post-First Boot Table Verification:**
   After the first boot of the backend, confirm that the following tables were successfully created:
   *   `Role`
   *   `User`
   *   `Project`
   *   `Cart`
   *   `Order`
   *   `Payment`
   *   `Support`
   *   `CustomRequest`
   *   `Notification`
   *   `Settings`

---

## ════════════════════════════════════════════
## PART 2 — BACKEND DEPLOYMENT (Railway)
## ════════════════════════════════════════════

*   **Root Directory:** `/backend`
*   **Install Command:** `npm install`
*   **Start Command:** `npm start` (Runs `node src/main.js`)
*   **Node Version:** `18+`

### Required Railway Environment Variables

Configure the following variables in the Railway environment variables dashboard:

| Environment Variable | Description / Action | Example / Details |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string copied in Part 1 | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Cryptographic secret key to sign tokens | Minimum 32-character long random string |
| `JWT_EXPIRY` | Token expiration time | `7d` |
| `PORT` | API listener port | `5000` |
| `CLIENT_URL` | Exact URL of the Vercel frontend app | `https://<your-vercel-frontend-url>.vercel.app` (No trailing slash) |
| `RAZORPAY_KEY_ID` | Razorpay API Credentials | `rzp_live_xxxx` (Staging: `rzp_test_xxx`) |
| `RAZORPAY_KEY_SECRET` | Razorpay API Signature Secret | `<razorpay secret>` |
| `SMTP_HOST` | Transactional email provider host | `smtp.gmail.com` |
| `SMTP_PORT` | Port for secure SMTP connection | `587` |
| `SMTP_USER` | Email address dispatching alerts | `support@yourdomain.com` |
| `SMTP_PASSWORD` | App password generated from provider | `<gmail app password>` |

### Post-Deploy Backend Verification
*   **Action:** Execute a `GET` request to: `https://<your-railway-backend-url>/api/settings`
*   **Expected Response:** `200 OK` containing a JSON settings configuration object.
*   **Outcome:** Confirms that the Express framework is running and the database connection pool is active.

### Critical Backend Notes
> [!WARNING]
> **Razorpay Webhooks Integration:**
> *   Register the following endpoint URL in your Razorpay Dashboard under Webhooks: `https://<your-railway-backend-url>/api/webhook/razorpay`
> *   **Subscribed Event:** `payment.captured`
> *   **Middleware Constraints:** This route relies on signature validation of raw request buffers (`express.raw()`). Do **NOT** mount JSON parser middleware before this endpoint in the routing chain.

> [!IMPORTANT]
> **File Storage Policy:**
> Uploaded branding assets (logo/favicon) and project images are saved locally to the `/uploads` directory on disk. 
> *   **Single Instance:** Works out of the box using local storage.
> *   **Clustered/Multi-instance deployments:** Migrate local directory logic to an object storage provider (e.g., AWS S3 or Cloudflare R2) to avoid data loss during server redeployments.

---

## ════════════════════════════════════════════
## PART 3 — FRONTEND DEPLOYMENT (Vercel)
## ════════════════════════════════════════════

*   **Root Directory:** `/frontend`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`
*   **Install Command:** `npm install`
*   **Framework Preset:** `Vite`

### Router Rewrite Configuration (`/frontend/vercel.json`)
To avoid `404 Not Found` errors when refreshing routes on SPA client-side routing, ensure the following config is present in `/frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Vercel Environment Variables
Set these variables inside your Vercel Project Dashboard:

| Environment Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Railway backend root url | `https://<your-railway-backend-url>` (No trailing slash) |
| `VITE_APP_NAME` | Global web application name | `ProjectNova` |

### Post-Deploy Frontend Verification
1. Open the Vercel deployed URL and check that the homepage loads successfully.
2. Register a new test user to confirm the frontend can communicate with the backend API without CORS issues.
3. Open browser Developer Tools, inspect the **Network** tab, and verify that API requests are routed to the remote Railway URL instead of `localhost`.

---

## ════════════════════════════════════════════
## PART 4 — CORS CONFIGURATION CHECK
## ════════════════════════════════════════════

*   Verify that backend CORS parameters read from the `CLIENT_URL` environment variable inside [main.js](file:///c:/Users/Shree%20Londhe/Desktop/Wastedteens%20site/projectnova/Projectnova/backend/src/main.js):
    ```javascript
    cors({ origin: process.env.CLIENT_URL, credentials: true })
    ```
*   The backend `CLIENT_URL` variable **must exactly match** the Vercel deployment URL (including `https://` and without a trailing slash). If you map a custom domain on Vercel, update `CLIENT_URL` to match that domain exactly.

---

## ════════════════════════════════════════════
## PART 5 — POST-DEPLOYMENT CHECKLIST
## ════════════════════════════════════════════

*   [ ] `GET /api/settings` returns `200 OK` (checks database & backend health).
*   [ ] User registration completes end-to-end.
*   [ ] Login with MFA toggle functions properly (verify `mfaRequired` status inside `Settings` table).
*   [ ] Razorpay webhook URL registered with the `payment.captured` event.
*   [ ] Admin login succeeds (using default seed credentials: `admin@admin.com` / `admin123`).
    > [!CAUTION]
    > Change the default admin credentials immediately after deployment to secure the admin panel.
*   [ ] File uploading (logo/favicon) succeeds through the Admin Settings page.
*   [ ] Execute and confirm a complete test checkout flow in Razorpay test mode before toggling live mode.

---

## ════════════════════════════════════════════
## PART 6 — OPTIONAL: VM PM2 DEPLOYMENT
## ════════════════════════════════════════════

If hosting the backend API on a raw Linux virtual machine rather than Railway:
```bash
# Install PM2 Process Manager globally
npm install -g pm2

# Run API script under PM2 process monitor
pm2 start src/main.js --name "projectnova-api"

# Configure startup hook to resume processes on server reboots
pm2 startup
pm2 save
```

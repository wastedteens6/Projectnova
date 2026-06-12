# ProjectNova - Deployment Guide

This document provides step-by-step instructions for deploying ProjectNova frontend and backend to production environments.

---

## 🎨 Frontend Deployment (Vercel)

The frontend React application is optimized to run as a Single Page Application (SPA) on Vercel.

### 1. Build Settings
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`
*   **Install Command:** `npm install`

### 2. Router Rewrite Config (`vercel.json`)
To avoid `404 Not Found` errors when refreshing routes on the browser, create a `vercel.json` file inside the root of the frontend folder:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Production Environment Variables
Set the following keys inside the Vercel project configuration dashboard:

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Fully qualified URL of production API server | `https://api.projectnova.com` |
| `VITE_APP_NAME` | Global title of client interface | `ProjectNova` |

---

## ⚙️ Backend Deployment (Railway or Virtual Machine)

The Node.js Express API is optimized for Railway hosting or standard Linux servers monitored by PM2.

### 1. Startup Settings
*   **Install Command:** `npm install`
*   **Start Command:** `npm start` (Runs `node src/main.js`)

### 2. Production Environment Variables
Set these variables inside Railway's config dashboard or production `.env` config file:

| Key | Purpose | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Secure PostgreSQL database link | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Secret hash signing logins | `your-prod-long-random-string` |
| `JWT_EXPIRY` | Duration of active login tokens | `7d` |
| `PORT` | API listen port | `5000` |
| `CLIENT_URL` | Allowed CORS client domain origin | `https://www.projectnova.com` |
| `RAZORPAY_KEY_ID` | Production API Razorpay Key | `rzp_live_abcdef123` |
| `RAZORPAY_KEY_SECRET`| Production Signature Private Key | `xyzabc1237890` |
| `SMTP_HOST` | Production SMTP hostname (e.g. Gmail) | `smtp.gmail.com` |
| `SMTP_PORT` | Port for secure SMTP connection | `587` |
| `SMTP_USER` | Email username dispatching alerts | `support@projectnova.com` |
| `SMTP_PASSWORD` | Secure App Password | `abcd efgh ijkl mnop` |

### 3. Running with PM2 on VM
For virtual machine hosting (e.g. AWS EC2, DigitalOcean Droplet), use PM2 to monitor the server:
```bash
# Install PM2 globally
npm install -g pm2

# Start the application from the backend directory
pm2 start src/main.js --name "projectnova-api"

# Ensure PM2 recovers after VM reboots
pm2 startup
pm2 save
```

### 4. Health Check Endpoint
To configure load balancer status monitors or uptime triggers:
*   **Endpoint:** `GET /api/settings`
*   **Verification:** Returns a `200 OK` status with a list of settings keys on success, proving database connectivity and express operational status.

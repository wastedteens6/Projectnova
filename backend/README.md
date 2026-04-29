# ProjectNova - Backend 🚀

Node.js/Express backend API for ProjectNova, featuring a production-ready payment architecture and robust project management.

## 🏗️ Tech Stack

### Backend Core
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (ESM)
- **Database:** PostgreSQL (raw SQL with `pg` pool)
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Security:** Helmet + Express Rate Limit

### Payments (Production Ready)
- **Gateway:** Razorpay
- **Verification:** HMAC SHA-256 Signature Verification
- **Automation:** Webhooks (payment.captured, failed, refunded)

### Utilities
- **Emails:** Nodemailer (SMTP)
- **File Handling:** Multer

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── projects.js   # Projects endpoints
│   │   ├── cart.js       # Cart endpoints
│   │   ├── checkout.js   # Razorpay checkout flow
│   │   ├── purchases.js  # User purchases & upgrades
│   │   ├── webhook.js    # Razorpay webhook handler
│   │   └── notification.js # User notifications
│   ├── config/           # Configuration
│   │   ├── database.js   # Database pool setup
│   │   └── migrations.js # Auto-run DB schema updates
│   ├── middleware/       # Auth & validation middleware
│   └── main.js           # Main app entry point
├── scripts/              # DB init & utility scripts
├── uploads/              # Project media storage
├── .env.development      # Environment variables
└── package.json
```

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Config
Copy `.env.example` to `.env.development` and fill in your details:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/projectnova"
JWT_SECRET="your-secret-key"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

### 4. Database Initialization
Run the initialization script to setup the core tables:
```bash
npm run db:init
```

---

## 🚀 Running the App

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## 📡 API Routes Summary

- `POST /api/auth/*` - Register, Login, Me
- `GET  /api/projects/*` - Project listings & details
- `POST /api/checkout/create-order` - Initialize Razorpay order
- `POST /api/checkout/verify-payment` - Signature verification
- `POST /api/webhook/razorpay` - Automated payment capture
- `GET  /api/purchases/my-purchases` - User purchase history
- `POST /api/purchases/upgrade-tier/*` - Tier upgrade system
- `GET  /api/notifications` - User real-time notifications

---

## 🔐 Security Checklist
- [x] JWT tokens for protected routes
- [x] CORS protection enabled
- [x] Multi-layered rate limiting
- [x] Secure sensitive metadata in JSONB blocks
- [x] Mandatory signature checks for all payments

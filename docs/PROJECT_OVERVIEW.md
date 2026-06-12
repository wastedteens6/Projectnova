# ProjectNova - Executive Overview

Welcome to **ProjectNova** (by WastedTeens☠️), a modern, full-stack e-commerce marketplace specializing in selling academic project solutions, source codes, and documentation packages. 

ProjectNova offers students and developers a streamlined catalog of digital project solutions, complete with tier-based packages, secure billing/payment verification via Razorpay, custom project customization request channels, multi-factor authentication (MFA) security, and an interactive admin dashboard.

---

## 🎯 Project Purpose

The key objective of ProjectNova is to provide a premium, secure, and intuitive e-commerce experience for distributing digital projects. 

Specifically, it bridges the gap between pre-built project codebases and custom developer modifications:
1. **Ready-to-Run Packages:** Users can browse projects and buy starter, intermediate, or advanced packages.
2. **Dynamic Upgrades:** A user who purchased a "Starter" tier can dynamically upgrade to "Pro" or "Master" by paying the mathematical difference between the two tiers.
3. **Custom Requirements:** Users can submit specialized custom build requests.
4. **Developer/Admin Controls:** Administrators can configure branding (logo/favicon), manage maintenance mode globally, adjust global MFA requirements, create projects, adjust pricing, view logs, and audit transactions.

---

## ✨ Key Features

### 1. User & Auth Services
*   **Role-Based Access Control (RBAC):** Supports hierarchical structures (Admins vs. Regular Users). Admins can also create custom database roles and edit permissions dynamically.
*   **Multi-Factor Authentication (MFA):** Supports TOTP setups (compatible with Google Authenticator, Authy, etc.). Admins can force global MFA verification on user login via Settings.
*   **Secure Session Management:** HTTP-only cookies and Bearer tokens. Rate limiting and security middleware (Helmet, CORS) are enabled.

### 2. Digital Shopping & Cart
*   **Dynamic Cart System:** Persistent DB-driven cart store for registered users.
*   **Digital Tiers:** Every academic project is sold in three progressive levels (e.g. Starter, Pro, Master), each featuring different contents and drive links.

### 3. Payment & Transactions
*   **Razorpay Integration:** Real-time billing checkout initialization and webhook verification.
*   **Webhook Resilience:** High-priority webhook endpoint verifies signatures via the raw request buffer to process captured/failed payments.
*   **Dynamic Tier Upgrades:** Calculations to subtract already-paid amounts from higher tier prices, ensuring customer satisfaction.
*   **Downloadable Receipts:** Dynamic client receipt cards showing breakdowns of cost, GST (18%), and text-based files matching traditional invoice printers.

### 4. Support & Administration
*   **Interactive Support Ticket System:** Live support portal allowing users to raise tickets and chat with admin representatives.
*   **Global App Settings Dashboard:** Instant update toggles for site name, currency, tax rates, logos, and favicons.
*   **Project Upload Manager:** Admin page supporting multiple image and documentation file uploads.

---

## 🛠️ Technology Choices and Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | High performance, modular components, and fast hot-reloading for development. |
| **Styling** | TailwindCSS + Vanilla CSS | Modern utility classes paired with customized glassmorphism styling variables. |
| **State** | Zustand | Light-weight state management, avoiding boilerplate of Redux while maintaining global reactive state. |
| **Backend** | Node.js + Express | Highly scalable async runtime, massive ecosystem, and flexible routing patterns. |
| **Database** | PostgreSQL | Enterprise-grade relational stability, structured transactional guarantees (ACID), and robust JSONB support. |
| **Query Engine** | Raw `pg` Connection Pool | Maximum execution speed, explicit query visibility, and zero ORM overhead. |
| **Payments** | Razorpay SDK | Leading Indian payment gateway supporting UPI, Card, NetBanking, and webhooks. |

---

## 🌐 Deployment Overview

*   **Frontend Client:** Deployed to **Vercel** with SPA rewrites enabled.
*   **Backend Server:** Optimized for **Railway** or standard cloud VMs (using PM2 for process monitoring).
*   **Database:** Hosted via PostgreSQL instance with connection pooling.
*   **File Storage:** Local uploads or cloud bucket configurations for binary files (images/attachments).

---

## 📈 Current Project Maturity Assessment

ProjectNova is at a **Late-Stage Beta / Production-Ready** phase. Core e-commerce transaction lines, webhook handling, security filters, and user states are fully coded.

### Architectural Rationale & Recommendations:
1.  **Raw SQL vs ORM:** While raw SQL queries via `pg` pool are highly efficient, query syntax errors must be caught during development since compile-time checks are absent. Extensive tests are recommended.
2.  **MFA Bypass Cases:** Ensure database updates during registration set proper defaults so users are forced to verify their setup before proceeding to transaction checkouts.
3.  **Local vs Cloud Uploads:** The application currently saves uploaded branding files and project media to a local `uploads/` directory on disk. For cluster deployments (like multiple Railway instances), this should be migrated to cloud object storage (e.g. AWS S3) to prevent data loss.

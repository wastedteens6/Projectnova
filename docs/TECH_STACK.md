# ProjectNova - Technology Stack Details

This document provides a deep dive into the technology stack of ProjectNova, detailing all frontend, backend, and database technologies, their configurations, and a comprehensive analysis of every dependency used across the codebase.

---

## 🎨 Frontend Stack

*   **Core Framework:** React v18.3.1 (bootstrapped with Vite v5.2.11)
*   **State Management:** Zustand v4.5.2 (lightweight, reactive global hook stores)
*   **Routing:** React Router DOM v6.24.0 (declarative client-side routing)
*   **Styling:** TailwindCSS v3.4.3 (utility classes) combined with custom Vanilla CSS variables for glassmorphism aesthetics
*   **Icons:** React Icons v5.6.0 (feather, material, ionicons)
*   **Animations:** Framer Motion v12.38.0 (declarative spring and hover physics)
*   **API Client:** Axios v1.7.7 (configured with token interceptors and response handlers)
*   **Build System:** Vite (Fast, bundle-free dev server with rollup builds)

---

## ⚙️ Backend Stack

*   **Runtime Environment:** Node.js (ES Module format `"type": "module"`)
*   **Web Framework:** Express v4.18.2 (REST API architecture)
*   **Database Client:** pg v8.20.0 (Node-Postgres connection pooling)
*   **Authentication:** Custom JSON Web Token (`jsonwebtoken`) and cookie-based extraction via `cookie-parser`
*   **MFA Engine:** TOTP implementation using `otplib` v13.4.0 and `qrcode` v1.5.4
*   **Security Middlewares:** `helmet` v7.0.0 (HTTP headers), `cors` v2.8.5, `express-rate-limit` v7.0.0
*   **File Uploader:** `multer` v2.1.1 (multipart/form-data processor for images and files)
*   **Email Client:** `nodemailer` v6.9.0 (relays setup codes and receipt notification updates)
*   **Schema Validator:** `zod` v3.22.0 (input verification schemas for requests)

---

## 💾 Database Stack

*   **Engine:** PostgreSQL
*   **ORM:** None. Uses raw `pg` pool queries for maximum performance and expressiveness.
*   **Migration Strategy:** Script-driven tables setup via `/backend/src/config/migrations.js` containing DDL schemas executed dynamically on startup if tables are missing.
*   **Seeding Approach:** Custom seeds file (`schema.sql` manual initialization or automated in initialization scripts) writing seed admin credentials (`admin@admin.com` / `admin123`) and basic customer test records.

---

## 📦 Dependency Breakdown & Criticality

### Frontend Dependencies (`frontend/package.json`)

| Package | Purpose | Where Used | Criticality |
| :--- | :--- | :--- | :--- |
| `react` / `react-dom` | Provides core rendering, lifecycle hooks, and virtual DOM mapping. | Entire application. | **Critical** (Core Engine) |
| `react-router-dom` | Handles site navigation, route paths, admin protected layouts, and query parameters. | `frontend/src/App.tsx`, `frontend/src/routes.tsx` | **Critical** (Routing) |
| `zustand` | Maintains global states for authenticated user profiles, session cookies, and cart contents. | `frontend/src/store/useAuthStore.ts`, `useCartStore.ts` | **Critical** (State Management) |
| `axios` | Connects the frontend to the backend REST endpoints. Includes automatic Bearer token headers via interceptors. | `frontend/src/lib/api.ts`, `frontend/src/services/*` | **Critical** (API Layer) |
| `tailwindcss` | Provides clean utility styling classes. | Throughout the markup elements. | **Critical** (Aesthetics/Style) |
| `framer-motion` | Powers fluid page entry layouts, modal animations, and button spring movements. | `frontend/src/components/*`, `frontend/src/pages/*` | **Optional** (Polish/Animations) |
| `react-icons` | Imports SVGs for dashboards, carts, and user status indicators. | Headers, buttons, lists. | **Optional** (UI Asset) |

---

### Backend Dependencies (`backend/package.json`)

| Package | Purpose | Where Used | Criticality |
| :--- | :--- | :--- | :--- |
| `express` | Main framework routing HTTP requests, serving middlewares, and returning JSON. | `backend/src/main.js`, `backend/src/routes/*` | **Critical** (Framework) |
| `pg` | Establishes PostgreSQL client connection pool to execute CRUD queries. | `backend/src/config/database.js`, all database scripts. | **Critical** (Database Engine) |
| `jsonwebtoken` | Issues signed tokens on login and validates them inside middleware verification pipelines. | `backend/src/middleware/auth.js`, `backend/src/routes/auth.js` | **Critical** (Security) |
| `cookie-parser` | Extracts JWT tokens from HTTP-only client cookies. | `backend/src/main.js`, `backend/src/middleware/auth.js` | **Critical** (Auth Handling) |
| `bcryptjs` | Hashes user passwords on signup and compares passwords on login. | `backend/src/routes/auth.js` | **Critical** (Credentials Safety) |
| `otplib` | Generates secrets and verifies 6-digit MFA codes using Time-Based One-Time Passwords (TOTP). | `backend/src/routes/auth.js` | **Critical** (MFA Core) |
| `qrcode` | Converts TOTP secrets into QR code URLs for Google Authenticator/Authy setup. | `backend/src/routes/auth.js` | **Critical** (MFA Setup) |
| `razorpay` | Communicates with the Razorpay payment gateway to create pending orders. | `backend/src/routes/checkout.js` | **Critical** (Payment Engine) |
| `zod` | Validates shape, type, and bounds of API request body parameters before DB execution. | `backend/src/routes/*` (specifically auth, projects) | **Critical** (Validation Layer) |
| `multer` | Saves uploaded logo, favicon, and project files directly onto the server disk. | `backend/src/routes/settings.js`, `backend/src/routes/projects.js` | **Critical** (Upload Engine) |
| `nodemailer` | Dispatches auth activation alerts and setup codes. | `backend/src/services/emailService.js` | **Optional** (Notifications) |
| `cors` | Allows browser cross-origin requests from the client domain. | `backend/src/main.js` | **Critical** (Integration) |
| `helmet` | Enhances server security by automatically configuring standard HTTP headers. | `backend/src/main.js` | **Critical** (Security Baseline) |
| `express-rate-limit` | Prevents Denial of Service (DoS) and brute-force logins by restricting client request frequencies. | `backend/src/main.js` | **Critical** (API Protection) |
| `dotenv` | Imports environmental configurations from files. | Config loader. | **Critical** (Configuration) |

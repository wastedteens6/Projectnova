# ProjectNova - Architecture Documentation

This document explains the technical architecture of the ProjectNova platform, showing how data and authorization flow across the frontend application, the backend API, the database, and third-party gateways.

---

## 🗺️ High-Level System Architecture

ProjectNova is built on a decoupled, client-server model:
1.  **Frontend Client (Vite/React):** A single-page application (SPA) styled with TailwindCSS, managing client-side views, routes, state caches (Zustand), and payment gateway bindings.
2.  **Backend API (Node/Express):** A stateless RESTful service verifying client tokens, handling database queries, calculating upgrades, uploading media files, and listening to third-party webhooks.
3.  **Database (PostgreSQL):** Relational tables representing users, custom roles, projects, transactions, and system-wide setting overrides.

```mermaid
graph TD
    Client["React Client (Vite)"] <-->|REST API + HTTP Cookies| Server["Node/Express Backend"]
    Server <-->|Raw SQL via pg pool| DB["PostgreSQL Database"]
    Client -->|Initialize Checkout| RazorpayGateway["Razorpay JS SDK"]
    RazorpayGateway -->|Process Payment| RazorpayPlatform["Razorpay API Core"]
    RazorpayPlatform -->|Secure Webhook Callback| Server
```

---

## 🔒 Authentication Flow (with MFA Toggles)

Authentication utilizes JSON Web Tokens (JWT) stored in HTTP-only cookies and Authorization Bearer headers. Users are forced through an MFA verify check if Multi-Factor Authentication is enabled in settings or configured on their profile.

### Login with MFA Verification Sequence:

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant FE as Frontend App
    participant BE as Express API
    participant DB as PostgreSQL DB

    User->>FE: Enters credentials (email, password)
    FE->>BE: POST /api/auth/login
    BE->>DB: Fetch user by email
    DB-->>BE: Returns password hash, mfa_enabled, mfa_secret
    BE->>BE: Validates password (bcrypt)
    
    alt MFA is Enabled on User Profile or Required Globally
        BE-->>FE: Returns { mfaRequired: true, tempToken: "JWT" }
        FE->>User: Displays TOTP code verification field
        User->>FE: Submits 6-digit verification code
        FE->>BE: POST /api/auth/verify-mfa (Headers: tempToken)
        BE->>BE: Validates TOTP code (otplib)
    end
    
    BE->>BE: Issues authenticated JWT (role, email, userId)
    BE-->>FE: Set HTTP-Only Cookie or auth token
    FE->>User: Navigates to User Dashboard
```

---

## 💳 Checkout & Razorpay Payment Verification

ProjectNova guarantees payment integrity using signature verification. An order is initialized, a signature is verified, and a fallback webhook ensures consistency even if a customer closes their tab mid-transaction.

### E-Commerce Purchase Flow:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant FE as Frontend Client
    participant BE as Backend Server
    participant DB as PostgreSQL DB
    participant RP as Razorpay Server

    Customer->>FE: Clicks 'Checkout' (items in cart)
    FE->>BE: POST /api/checkout/create-order (amount, projectId)
    BE->>DB: Validates item price & details
    BE->>RP: Creates Razorpay order (amount_in_paise)
    RP-->>BE: Returns Razorpay Order ID (order_...)
    BE->>DB: Inserts pending transaction record
    BE-->>FE: Returns Razorpay Order Details
    FE->>Customer: Launches Razorpay Checkout Modal
    Customer->>RP: Completes payment (UPI / Card / NetBanking)
    RP-->>FE: Returns payment_id, order_id, signature

    alt Option A: Immediate Frontend Verification
        FE->>BE: POST /api/checkout/verify-payment
        BE->>BE: Computes expected signature using RAZORPAY_KEY_SECRET
        BE->>DB: Updates transaction status to 'success', creates 'Order'
        BE-->>FE: Returns { success: true }
        FE->>Customer: Displays receipt and project drive links
    else Option B: Fallback Webhook Verification
        RP->>BE: POST /api/webhook/razorpay (payment.captured Event)
        BE->>BE: Parses raw body buffer, validates signature
        BE->>DB: Commits transaction to database as 'success' / creates 'Order'
    end
```

---

## 🔄 Dynamic Tier Upgrade Architecture

A signature feature of ProjectNova is the progressive upgrade calculation. When a user who owns an active project at a lower tier level decides to upgrade to a higher tier:
1.  **Backend Calculation:** The system retrieves the user's latest verified order for that project.
2.  **Price Difference Lookup:** It calculates `Upgrade Price = Target Tier Price - Amount Already Paid`.
3.  **Database Upgrade Hook:** Once paid, the upgrade confirmation code updates the user's original `Order` record to point to the new `tier_id` and adds an audit record in the database for tracking.

```mermaid
flowchart TD
    Start([Request Tier Upgrade]) --> CheckExists{Has prior purchase?}
    CheckExists -- No --> FirstBuy[Charge full price of target tier]
    CheckExists -- Yes --> ExtractPrice[Retrieve amount already paid from Order]
    ExtractPrice --> CompareTiers{Target Level > Current Level?}
    CompareTiers -- No --> Reject[Return error: Target tier level too low]
    CompareTiers -- Yes --> SubtractPrice[Upgrade Price = Target Tier Price - Paid Amount]
    SubtractPrice --> GenerateOrder[Create pending transaction for difference]
```

---

## 🛠️ Admin Functionality Flow

Administrators manage catalog metadata, permissions, and settings dynamically:
*   **Branding & Site Toggles:** When an administrator uploads a new logo, `multer` saves the file and the database `Settings` table updates. The client application fetches these config variables via a public context provider on startup.
*   **Role Management Engine:** Admins can create new roles. These custom roles and arrays of permissions are stored in a `"Role"` table. When a user performs actions, the backend checks the permissions array.

---

## ⚠️ Security & Error Handling Infrastructure

### Security Guardrails:
1.  **Rate Limiting:** Protects endpoints from brute-force login attacks.
2.  **Helmet Integration:** Disables diagnostic headers and sets Content Security Policies (CSP).
3.  **Strict Token Verification:** The authentication middleware extracts `userId` and `role` directly from the signed cryptographic payload, preventing clients from spoofing identity parameters in request payloads.
4.  **Raw Webhook Parsing:** The Razorpay webhook utilizes a special body-parsing sequence (`express.raw()`) to verify the signature of webhook payloads before JSON serialization.

### Unified Error Architecture:
All backend handlers catch failures inside try/catch blocks and return standardized JSON error messages:
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE_IDENTIFIER"
}
```
This enables the frontend client to intercept error codes (e.g. `TOKEN_EXPIRED`, `USER_MISMATCH`) and redirect users accordingly.

# ProjectNova - REST API Reference Documentation

This document describes all API endpoints exposed by the ProjectNova Express backend, grouped by module. All base endpoints are prefixed with `/api`.

---

## 🔒 Authentication & MFA Module (`/api/auth`)

### 1. Register User
*   **Method:** `POST`
*   **Route:** `/register`
*   **Auth Required:** None
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "name": "Jane Doe",
      "password": "Password123!"
    }
    ```
*   **Successful Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    }
    ```
*   **Error Response (400 Bad Request):**
    ```json
    {
      "error": "Email already registered"
    }
    ```

### 2. Login User
*   **Method:** `POST`
*   **Route:** `/login`
*   **Auth Required:** None
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!"
    }
    ```
*   **Successful Response (MFA Required Toggle is Active - 200 OK):**
    ```json
    {
      "mfaRequired": true,
      "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Successful Response (MFA Bypass / Complete - 200 OK):**
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "role": "user"
      }
    }
    ```

### 3. Verify MFA TOTP Code
*   **Method:** `POST`
*   **Route:** `/verify-mfa`
*   **Auth Required:** Header `Authorization: Bearer <tempToken>`
*   **Request Body:**
    ```json
    {
      "code": "123456"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "role": "user"
      }
    }
    ```

---

## 🛒 Shopping Cart Module (`/api/cart`)

All requests inside this module require a valid authenticated JWT cookie or Bearer authorization header.

### 1. Fetch Cart Items
*   **Method:** `GET`
*   **Route:** `/`
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "project-uuid-111",
          "cartItemId": "cart-item-uuid-222",
          "name": "Academic Library System",
          "slug": "academic-library-system",
          "tier": "Pro",
          "tierLevel": 2,
          "price": 999,
          "isUpgrade": false,
          "image": "/uploads/projects/images/lib1.jpg"
        }
      ]
    }
    ```

### 2. Add or Update Cart Item
*   **Method:** `POST`
*   **Route:** `/`
*   **Request Body:**
    ```json
    {
      "projectId": "project-uuid-111",
      "tier": "Pro",
      "tierLevel": 2,
      "price": 999,
      "isUpgrade": false,
      "metadata": {}
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Item added to cart"
    }
    ```

---

## 💸 Checkout & Payments Module (`/api/checkout` & `/api/purchases`)

### 1. Initialize Razorpay Order
*   **Method:** `POST`
*   **Route:** `/checkout/create-order`
*   **Request Body:**
    ```json
    {
      "amount": 999,
      "projectIds": ["project-uuid-111"],
      "email": "customer@example.com",
      "phone": "+919876543210"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "order": {
        "id": "order_HjFk92sK1sJzla",
        "entity": "order",
        "amount": 99900,
        "currency": "INR",
        "receipt": "receipt_17182103"
      }
    }
    ```

### 2. Verify Razorpay Payment Signature
*   **Method:** `POST`
*   **Route:** `/checkout/verify-payment`
*   **Request Body:**
    ```json
    {
      "orderId": "order_HjFk92sK1sJzla",
      "paymentId": "pay_HjFm98sKlM2xPq",
      "signature": "abcd1234efgh5678ijkl9012"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Payment verified and order finalized"
    }
    ```

### 3. Webhook Listener (Razorpay API Source of Truth)
*   **Method:** `POST`
*   **Route:** `/webhook/razorpay`
*   **Auth Required:** Raw request buffer signature matching `X-Razorpay-Signature` header.
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true
    }
    ```

### 4. Confirm Tier Upgrade (Pay Difference)
*   **Method:** `POST`
*   **Route:** `/purchases/upgrade-tier/confirm`
*   **Request Body:**
    ```json
    {
      "project_id": "project-uuid-111",
      "target_tier_level": 3,
      "razorpay_order_id": "order_HkLm93sKaJzk",
      "razorpay_payment_id": "pay_HkLn97sKaXzL",
      "razorpay_signature": "fghj1234abcd5678"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Upgrade verified successfully",
      "new_tier": "Master",
      "id": "upgrade-order-uuid"
    }
    ```

---

## 🛠️ Global Settings & Asset Uploader (`/api/settings`)

### 1. Fetch Public Site Config
*   **Method:** `GET`
*   **Route:** `/`
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "settings": {
        "siteName": "ProjectNova Marketplace",
        "siteEmail": "support@wastedteens.com",
        "currency": "INR",
        "taxRate": "18",
        "maintenanceMode": "false",
        "mfaRequired": "true",
        "logo": "/uploads/branding/logo-1718290.png",
        "favicon": "/uploads/branding/favicon-1718290.ico"
      }
    }
    ```

### 2. Update Global Toggles (Admin-Only)
*   **Method:** `PUT`
*   **Route:** `/`
*   **Auth Required:** Admin verification token
*   **Request Body:**
    ```json
    {
      "settings": {
        "siteName": "ProjectNova Premium",
        "mfaRequired": "true"
      }
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Settings updated successfully"
    }
    ```

---

## 🎟️ Support Ticket Messaging Module (`/api/support`)

### 1. Create Support Ticket
*   **Method:** `POST`
*   **Route:** `/tickets`
*   **Request Body:**
    ```json
    {
      "subject": "Missing Drive Link",
      "message": "I bought Tier 2 but the Google Drive folder link returns 404."
    }
    ```
*   **Successful Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Support ticket created",
      "ticket": {
        "id": "ticket-uuid-000",
        "subject": "Missing Drive Link",
        "status": "open",
        "conversation": [
          { "sender": "user", "message": "I bought Tier 2 but the Google Drive folder link returns 404.", "timestamp": "2026-06-12T15:19:24.000Z" }
        ]
      }
    }
    ```

### 2. Add Message to Support Thread
*   **Method:** `POST`
*   **Route:** `/tickets/:id/message`
*   **Request Body:**
    ```json
    {
      "message": "Admin reply: Resolved, here is the updated folder link."
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Message added to ticket"
    }
    ```

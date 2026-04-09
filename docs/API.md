# ProjectNova API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### Login User
**POST** `/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:** Same as register

### Admin Login
**POST** `/auth/admin-login`
```json
{
  "email": "admin@wastedteens.com",
  "password": "admin123"
}
```
**Response:** User with role "admin"

### Get Current User
**GET** `/auth/me`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

---

## Project Endpoints

### Get All Projects
**GET** `/projects`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "slug": "mern-ecommerce",
      "title": "MERN E-commerce Platform",
      "description": "Complete e-commerce app with MERN stack",
      "category": "Full Stack",
      "techStack": ["MongoDB", "Express", "React", "Node.js"],
      "tier1Price": 399,
      "tier2Price": 999,
      "tier3Price": 1999,
      "tier4Price": 2999,
      "thumbnailUrl": "/projects/mern-ecommerce.jpg",
      "views": 1500,
      "isPublished": true
    }
  ]
}
```

### Get Project by Slug
**GET** `/projects/{slug}`
**Response:** Single project object from above

### Create Project (Admin)
**POST** `/projects/create`
**Headers:** `Authorization: Bearer {token}`
```json
{
  "title": "New Project",
  "description": "Project description",
  "category": "Web Development",
  "techStack": ["Node.js", "React"],
  "tier1Price": 299,
  "tier2Price": 699,
  "tier3Price": 1299,
  "tier4Price": 1999
}
```

---

## Cart Endpoints

### Get Cart
**GET** `/cart`
**Response:**
```json
{
  "success": true,
  "cartItems": []
}
```

### Add to Cart
**POST** `/cart/add`
```json
{
  "projectId": "1"
}
```

---

## Checkout Endpoints

### Create Order
**POST** `/checkout/create-order`
```json
{
  "amount": 39900,
  "projectIds": ["1", "2"],
  "email": "user@example.com",
  "phone": "+91 98765 43210"
}
```
**Response:**
```json
{
  "success": true,
  "orderId": "order_123456"
}
```

### Verify Payment
**POST** `/checkout/verify-payment`
```json
{
  "orderId": "order_123456",
  "paymentId": "pay_123456",
  "signature": "signature_here"
}
```

---

## Orders Endpoints

### Get Orders
**GET** `/orders`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "orders": []
}
```

---

## Support Endpoints

### Get Support Tickets
**GET** `/support/tickets`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "tickets": []
}
```

### Create Support Ticket
**POST** `/support/tickets`
**Headers:** `Authorization: Bearer {token}`
```json
{
  "subject": "Issue title",
  "message": "Issue description"
}
```

---

## Health Check

### Server Health
**GET** `/health`
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 - Unauthorized
```json
{
  "error": "No token" | "Invalid token"
}
```

### 404 - Not Found
```json
{
  "error": "Route not found" | "Project not found"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Test Instructions

### Using Thunder Client / Postman

1. **Test Register:**
   - POST: `http://localhost:5000/api/auth/register`
   - Body (JSON): 
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "password123"
   }
   ```

2. **Test Projects:**
   - GET: `http://localhost:5000/api/projects`

3. **Test Admin Login:**
   - POST: `http://localhost:5000/api/auth/admin-login`
   - Body (JSON):
   ```json
   {
     "email": "admin@wastedteens.com",
     "password": "admin123"
   }
   ```

---

**Last Updated:** April 7, 2026

# 🧪 DATA ISOLATION BUG - TESTING PLAYBOOK

## Pre-Test Setup

### Create Test Users

```bash
# User A
Email: alice@example.com
Password: test123456

# User B
Email: bob@example.com
Password: test123456
```

### Create Test Projects

- Project 1: "AI Deep Learning" - $500
- Project 2: "Web Security" - $300

---

## Test 1: Cross-User Purchase Isolation ✅

### Scenario

User A purchases Project 1. Check that User B CANNOT see User A's purchase.

### Steps

1. **User A: Log in**

   ```javascript
   // Browser console
   await fetch("http://localhost:5000/api/auth/login", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       email: "alice@example.com",
       password: "test123456",
     }),
   })
     .then((r) => r.json())
     .then((d) => {
       localStorage.setItem("token_a", d.token);
       console.log("User A token:", d.token);
     });
   ```

2. **User A: Purchase Project 1**
   - Navigate to `/projects/ai-deep-learning`
   - Click "Add to Cart"
   - Go to `/checkout`
   - Complete payment (mock mode)
   - Verify success message

3. **User A: Verify purchase is saved**

   ```javascript
   const token = localStorage.getItem("token_a");
   await fetch("http://localhost:5000/api/purchases/my-purchases", {
     headers: { Authorization: `Bearer ${token}` },
   })
     .then((r) => r.json())
     .then((d) => {
       console.log("User A purchases:", d.purchases);
       // Should show: AI Deep Learning - $500
     });
   ```

   **Expected:** Shows User A's purchase ✅

4. **User B: Log in** (open incognito window)

   ```javascript
   await fetch("http://localhost:5000/api/auth/login", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       email: "bob@example.com",
       password: "test123456",
     }),
   })
     .then((r) => r.json())
     .then((d) => {
       localStorage.setItem("token_b", d.token);
       console.log("User B token:", d.token);
     });
   ```

5. **User B: Try to access User A's purchases**

   ```javascript
   const token = localStorage.getItem("token_b");
   await fetch("http://localhost:5000/api/purchases/my-purchases", {
     headers: { Authorization: `Bearer ${token}` },
   })
     .then((r) => r.json())
     .then((d) => {
       console.log("User B purchases:", d.purchases);
       // Should be EMPTY - not AI Deep Learning!
     });
   ```

   **Expected:** Shows ONLY User B's purchases (empty if none) ✅

6. **User B: Try to spoof User A's user ID** (should be blocked)

   ```javascript
   // This should NOT work - user_id from query param is ignored
   const token = localStorage.getItem("token_b");
   const userAId = "alice-user-id"; // Try to trick it

   await fetch(
     "http://localhost:5000/api/purchases/check-purchase/project-1" +
       `?userId=${userAId}`,
     {
       // Ignored by backend!
       headers: { Authorization: `Bearer ${token}` },
     },
   )
     .then((r) => r.json())
     .then((d) => {
       console.log("Result:", d);
       // Should show: purchased: false (User B doesn't own it)
     });
   ```

   **Expected:** Returns `{purchased: false}` - ignores spoofed user_id ✅

### Verification

- ✅ User A can see their own purchases
- ✅ User B CANNOT see User A's purchases
- ✅ Query parameter userId is ignored (server uses JWT)
- ✅ Spoofing attempts fail

---

## Test 2: Receipt Access Control ✅

### Scenario

User A creates receipt for their purchase. User B tries to access it.

### Steps

1. **User A: Get their receipt**

   ```javascript
   const token = localStorage.getItem("token_a");

   // First get purchase transaction ID
   const purchases = await fetch(
     "http://localhost:5000/api/purchases/my-purchases",
     {
       headers: { Authorization: `Bearer ${token}` },
     },
   ).then((r) => r.json());

   const transactionId = purchases.purchases[0].transaction_id;
   console.log("Transaction ID:", transactionId);

   // Get receipt
   const receipt = await fetch(
     `http://localhost:5000/api/receipts/receipt/${transactionId}`,
     { headers: { Authorization: `Bearer ${token}` } },
   ).then((r) => r.json());

   console.log("Receipt:", receipt);
   ```

   **Expected:** 200 OK - Receipt returned ✅

2. **User B: Try to access User A's receipt**

   ```javascript
   const token = localStorage.getItem("token_b");
   const transactionId = "user-a-transaction-id"; // Try to access

   const receipt = await fetch(
     `http://localhost:5000/api/receipts/receipt/${transactionId}`,
     { headers: { Authorization: `Bearer ${token}` } },
   ).then((r) => r.json());

   console.log("Response:", receipt);
   ```

   **Expected:** 403 Forbidden - "You can only view your own receipts" ✅

### Verification

- ✅ Owner can access their receipt
- ✅ Non-owner gets 403 Forbidden
- ✅ Error message is clear

---

## Test 3: Complete Logout ✅

### Scenario

User A logs out. Check that all data is cleared from localStorage.

### Steps

1. **User A: Log in and check localStorage**

   ```javascript
   // After login, check what's stored
   Object.keys(localStorage).forEach((key) => {
     console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 50)}`);
   });

   // Expected keys present:
   // token, userEmail, userName, userRole
   ```

2. **User A: Click Logout button**
   - Click the "Logout" button in navbar

3. **User A: Verify complete data clear**

   ```javascript
   // After logout, check localStorage is clean
   Object.keys(localStorage).forEach((key) => {
     console.log(`${key}: ${localStorage.getItem(key)}`);
   });
   ```

   **Expected:** All keys are null/undefined ✅

   ```javascript
   // Specifically check:
   localStorage.getItem("token"); // null ✅
   localStorage.getItem("cart"); // null ✅
   localStorage.getItem("savedProjects"); // null ✅
   localStorage.getItem("userEmail"); // null ✅
   localStorage.getItem("upgradeContext"); // null ✅
   ```

4. **User B: Log in and verify no User A data**
   ```javascript
   // User B sees clean state
   localStorage.getItem("savedProjects"); // null (not User A's data)
   localStorage.getItem("cart"); // null (not User A's cart)
   ```
   **Expected:** User B starts with completely clean state ✅

### Verification

- ✅ All user data cleared on logout
- ✅ No data leakage to next user
- ✅ Page redirects to login
- ✅ Next user starts with clean slate

---

## Test 4: Project Access Verification ✅

### Scenario

User A (purchaser) can access project details. User B (non-purchaser) cannot.

### Steps

1. **User A: Access purchased project details**

   ```javascript
   const token = localStorage.getItem("token_a");

   const access = await fetch(
     "http://localhost:5000/api/projects/ai-deep-learning/access",
     { headers: { Authorization: `Bearer ${token}` } },
   ).then((r) => r.json());

   console.log("Access:", access);
   ```

   **Expected:** 200 OK - `{purchased: true, driveLink: "..."}` ✅

2. **User B: Try to access non-purchased project**

   ```javascript
   const token = localStorage.getItem("token_b");

   const access = await fetch(
     "http://localhost:5000/api/projects/ai-deep-learning/access",
     { headers: { Authorization: `Bearer ${token}` } },
   ).then((r) => r.json());

   console.log("Access:", access);
   ```

   **Expected:** 403 Forbidden - "Not purchased" ✅

3. **User B: Access public project list (should work)**

   ```javascript
   const projects = await fetch("http://localhost:5000/api/projects").then(
     (r) => r.json(),
   );

   console.log("Projects:", projects);
   ```

   **Expected:** 200 OK - Lists all projects (no purchase required) ✅

### Verification

- ✅ Purchaser can access project details
- ✅ Non-purchaser gets 403 on access endpoint
- ✅ Public endpoints still work (no auth needed)

---

## Test 5: Frontend Fetch Verification ✅

### Scenario

Frontend fetches purchases from API (not localStorage).

### Steps

1. **User A: Check Projects page**
   - Open `/projects` page
   - Check browser console for network requests
   - Should see: `GET /api/purchases/my-purchases` ✅
   - Should NOT see: Reading from localStorage ✅

2. **Inspect Network Tab**
   - Open DevTools → Network
   - Filter by "purchases"
   - Should see API call to `/api/purchases/my-purchases`
   - **NOT** loading from cache/localStorage

3. **User B: Switch to User B**
   - Log out as User A
   - Log in as User B
   - Open `/projects` page
   - Network should show NEW call to `/api/purchases/my-purchases`
   - Response should be User B's purchases (not User A's)

### Verification

- ✅ Frontend makes API call (not localStorage)
- ✅ API returns authenticated user's data
- ✅ New call made on user switch
- ✅ No stale data shown

---

## Test 6: Admin Orders Access ✅

### Scenario

Admin can see all orders. Regular user cannot.

### Steps

1. **Admin: Log in and view orders**

   ```javascript
   // Login as admin
   await fetch("http://localhost:5000/api/auth/admin-login", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       email: "admin@example.com",
       password: "admin123",
     }),
   })
     .then((r) => r.json())
     .then((d) => {
       localStorage.setItem("token_admin", d.token);
     });

   // Get all orders
   const token = localStorage.getItem("token_admin");
   const orders = await fetch("http://localhost:5000/api/orders", {
     headers: { Authorization: `Bearer ${token}` },
   }).then((r) => r.json());

   console.log("All orders:", orders);
   // Should show both User A and User B orders
   ```

   **Expected:** 200 OK - Shows ALL orders ✅

2. **User A: Try to view all orders (should fail)**

   ```javascript
   const token = localStorage.getItem("token_a");
   const orders = await fetch("http://localhost:5000/api/orders", {
     headers: { Authorization: `Bearer ${token}` },
   }).then((r) => r.json());

   console.log("Response:", orders);
   ```

   **Expected:** 403 Forbidden - "Admin access required" ✅

### Verification

- ✅ Admin can see all orders
- ✅ Users get 403 Forbidden
- ✅ Proper role checking

---

## Test 7: JWT Expiration ✅

### Scenario

Expired JWT should be rejected.

### Steps

1. **Get a token close to expiry**
   - Wait for token to approach expiry (if JWT_EXPIRY is short for testing)
   - Or manually manipulate token in browser

2. **Try to use expired token**

   ```javascript
   const token = "expired.jwt.token";

   const result = await fetch(
     "http://localhost:5000/api/purchases/my-purchases",
     { headers: { Authorization: `Bearer ${token}` } },
   );

   console.log("Status:", result.status); // Should be 401
   ```

   **Expected:** 401 Unauthorized ✅

### Verification

- ✅ Expired tokens rejected
- ✅ Clear 401 error
- ✅ User forced to re-login

---

## Test 8: Invalid JWT ✅

### Scenario

Tampered or invalid JWT should be rejected.

### Steps

1. **Try with invalid token**

   ```javascript
   const token = "not.a.valid.jwt";

   const result = await fetch(
     "http://localhost:5000/api/purchases/my-purchases",
     { headers: { Authorization: `Bearer ${token}` } },
   ).then((r) => r.json());

   console.log("Result:", result);
   ```

   **Expected:** 401 Unauthorized - "Invalid token" ✅

2. **Try token with modified signature**

   ```javascript
   // Valid token structure but signature tampered
   const token = "eyJhbGc...(valid-looking)...XXX";

   // Should fail verification
   ```

   **Expected:** 401 Unauthorized ✅

### Verification

- ✅ Invalid tokens rejected
- ✅ Tampered tokens rejected
- ✅ Signature verification working

---

## Summary Checklist

After running all tests, verify:

- [ ] Test 1: Cross-user isolation working
- [ ] Test 2: Receipt access control working
- [ ] Test 3: Logout clears all data
- [ ] Test 4: Project access verification working
- [ ] Test 5: Frontend fetches from API
- [ ] Test 6: Admin access control working
- [ ] Test 7: JWT expiration working
- [ ] Test 8: Invalid JWT rejected

---

## If Something Fails

### Troubleshooting

**Issue:** User can see other user's purchases

- Check: `middleware/auth.js` - verify JWT parsing
- Check: `purchases.js` - verify `req.userId` is used

**Issue:** 401 on valid token

- Check: JWT_SECRET matches frontend and backend
- Check: Token format: `Authorization: Bearer <token>`

**Issue:** localStorage not cleared on logout

- Check: `Navbar.tsx` - all keys being removed
- Check: Browser DevTools → Application → LocalStorage

**Issue:** Admin can't access orders

- Check: Token has `role: 'admin'` in JWT
- Check: `orders.js` - using `verifyAdminToken`

---

## Automated Test Script (Optional)

```javascript
// Run in browser console after fixes deployed
console.log("🧪 Starting data isolation tests...");

async function runTests() {
  // Test 1: User isolation
  const test1 = await checkUserIsolation();
  console.log("✅ Test 1 (User Isolation):", test1 ? "PASS" : "FAIL");

  // Test 2: Receipt control
  const test2 = await checkReceiptAccess();
  console.log("✅ Test 2 (Receipt Access):", test2 ? "PASS" : "FAIL");

  // Test 3: Logout
  const test3 = await checkLogout();
  console.log("✅ Test 3 (Logout):", test3 ? "PASS" : "FAIL");

  console.log("\n✅ All tests complete!");
}

runTests();
```

---

**All tests should PASS for production deployment ✅**

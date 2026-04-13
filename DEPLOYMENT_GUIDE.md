# 🚀 DEPLOYMENT & ROLLOUT GUIDE

## Status: All Fixes Complete ✅

### What Was Fixed

- ✅ Backend JWT authentication (centralized middleware)
- ✅ Backend ownership verification (all 6 route files)
- ✅ Frontend state management (API-driven, not localStorage)
- ✅ Complete logout functionality
- ✅ Project access gating
- ✅ Admin authorization checks

---

## Pre-Deployment Checklist

### 1. Environment Configuration ✅

```bash
# .env or environment variables

# JWT Configuration
JWT_SECRET="generate-new-random-value-below"
JWT_EXPIRY="24h"

# Generate secure JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6a7b8c9d0... (copy this)

# Database (verify correct)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=projectnova
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Payment (Razorpay)
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

# Security Headers
CORS_ORIGIN="https://yourdomain.com"  # NOT "*"
```

### 2. Code Review ✅

Files modified:

1. ✅ `backend/src/middleware/auth.js` - NEW (88 lines)
2. ✅ `backend/src/routes/purchases.js` - Modified
3. ✅ `backend/src/routes/receipts.js` - Modified
4. ✅ `backend/src/routes/checkout.js` - Modified
5. ✅ `backend/src/routes/orders.js` - Modified
6. ✅ `backend/src/routes/projects.js` - Modified
7. ✅ `frontend/src/pages/Projects.tsx` - Modified
8. ✅ `frontend/src/components/Navbar.tsx` - Modified

### 3. Database Verification ✅

```sql
-- Verify schema has proper FKs
SELECT constraint_name, table_name, column_name, foreign_table_name
FROM information_schema.key_column_usage
WHERE foreign_table_name IS NOT NULL;

-- Expected: user_id references User(id) in Purchase/Transaction tables
```

### 4. Security Headers ✅

```javascript
// Verify in app.js:
app.use(helmet()); // ✅ Enabled
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // ✅ Specific domain, not *
    credentials: true,
  }),
);
```

### 5. Rate Limiting ✅

```javascript
// Verify in app.js:
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit per IP
});
app.use("/api", limiter); // ✅ Applied
```

---

## Deployment Steps

### Stage 1: Local Testing (30 min)

```bash
# 1. Start backend
cd backend
npm install
npm start

# 2. Run test script
node test-db.js
node test-users.js
node test-tiers.js

# 3. Start frontend
cd ../frontend
npm install
npm run dev

# 4. Manual testing
# Open browser → http://localhost:5173
# Follow TESTING_PLAYBOOK.md
```

**Validation:**

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Frontend compiles without errors
- [ ] All 8 tests from TESTING_PLAYBOOK pass

### Stage 2: Staging Deployment (1-2 hours)

```bash
# 1. Deploy backend to staging
git push origin develop
# CI/CD pipeline runs tests

# 2. Verify staging env
https://staging-api.yourdomain.com/api/health

# 3. Deploy frontend to staging
# Ensure JWT_EXPIRY and CORS_ORIGIN point to staging

# 4. Run full test suite
# Use TESTING_PLAYBOOK.md with staging URLs
```

**Validation:**

- [ ] Staging API responds
- [ ] CORS configured for staging domain
- [ ] Frontend connects to staging API
- [ ] All 8 tests pass on staging

### Stage 3: Production Deployment (1-2 hours)

```bash
# 1. Create backup
pg_dump projectnova > backup-$(date +%Y%m%d).sql

# 2. Deploy backend
git tag v1.2.0-security-hotfix
git push origin main --tags
# CI/CD deploys to production

# 3. Verify production
https://api.yourdomain.com/api/health

# 4. Update frontend
# Ensure JWT_EXPIRY and CORS_ORIGIN point to production
npm run build
# Deploy dist/ to CDN

# 5. Smoke test production
# Use TESTING_PLAYBOOK.md with production URLs
```

**Validation:**

- [ ] Production API responds
- [ ] CORS configured for production domain
- [ ] Frontend connects to production API
- [ ] All 8 tests pass on production

---

## Smoke Tests (5 critical tests)

```javascript
// Run these immediately after deployment

// 1. Can users log in?
POST /api/auth/login
Body: {email, password}
Expected: 200, {token, user}

// 2. Are purchases isolated?
User A purchases → User B sees nothing
GET /api/purchases/my-purchases (as User B)
Expected: [] (empty)

// 3. Are receipts protected?
User A gets receipt → User B cannot
GET /api/receipts/receipt/:txId (as User B, A's txId)
Expected: 403

// 4. Does logout clear data?
After logout → localStorage empty
Expected: all keys null/undefined

// 5. Is API auth required?
No token → 401
GET /api/purchases/my-purchases
Expected: 401 Unauthorized
```

---

## Monitoring & Alerts

### Set up logging

```javascript
// In backend/src/config/database.js
const logger = {
  auth: (user, action, status) => {
    console.log(
      `[${new Date().toISOString()}] AUTH: User ${user} - ${action} - ${status}`,
    );
  },
  error: (endpoint, error) => {
    console.error(`[ERROR] ${endpoint}: ${error.message}`);
  },
};
```

### Monitor for

- 401 spikes (auth failures)
- 403 spikes (authorization failures)
- Error logs mentioning "invalid token"
- Unusual patterns on `/purchases` endpoint

### Alert thresholds

- 401 errors > 10/min → Notify security team
- 403 errors > 5/min → Notify ops (potential attack)
- Database errors → Immediate page

---

## Rollback Plan

If issues occur:

```bash
# 1. Immediate: Revert frontend
git revert <commit-hash>  # Revert to previous version
npm run build
# Deploy old version to CDN

# 2. Immediate: Revert backend
git revert <commit-hash>
# CI/CD redeploys previous version
# Users see error briefly, then old version works

# 3. Restore database (if needed)
psql projectnova < backup-20240115.sql

# 4. Notify users
Send email: "Brief service maintenance. All purchases are safe and restored."

# 5. Post-mortem
Identify what failed
Fix and re-test
Update deployment checklist
```

---

## Post-Deployment Verification (Day 1)

### Check logs

```bash
# SSH to server
tail -f /var/log/projectnova-api.log

# Look for:
✅ No "invalid token" errors
✅ No "user isolation" errors
✅ No database constraint violations
```

### Check metrics

```sql
-- How many unique users logged in today?
SELECT COUNT(DISTINCT user_id) FROM audit_logs
WHERE action = 'login' AND created_at > NOW() - INTERVAL '1 day';

-- Any failed auth attempts?
SELECT COUNT(*) FROM audit_logs
WHERE action = 'login_failed' AND created_at > NOW() - INTERVAL '1 day';

-- Purchase isolation working?
SELECT user_id, COUNT(*) FROM Transaction
GROUP BY user_id HAVING COUNT(*) > 1;  -- Verify each user owns their purchases
```

### User feedback

- Email support: "Any issues with purchases/access?"
- Monitor GitHub issues
- Check Twitter/support tickets

---

## Sign-Off Checklist

- [ ] Pre-deployment checklist complete
- [ ] Local testing passed (all 8 tests)
- [ ] Staging testing passed (all 8 tests)
- [ ] Smoke tests passed (5 critical tests)
- [ ] Security review complete
- [ ] Backup created
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured
- [ ] Post-deployment verification done

---

## Support Contacts

| Role         | Contact         | Responsibility           |
| ------------ | --------------- | ------------------------ |
| Backend Lead | dev-backend     | Code review, deployment  |
| DevOps       | devops-team     | Infrastructure, rollback |
| Security     | security-team   | Auth review, compliance  |
| QA Lead      | qa-lead         | Test execution, sign-off |
| Product      | product-manager | User communication       |

---

## Timeline

| Phase             | Duration  | Status      |
| ----------------- | --------- | ----------- |
| Code Review       | Immediate | ✅ Complete |
| Local Testing     | 30 min    | Ready       |
| Staging Deploy    | 1 hour    | Ready       |
| Staging Testing   | 1 hour    | Ready       |
| Production Deploy | 30 min    | Ready       |
| Prod Smoke Tests  | 30 min    | Ready       |
| Prod Monitoring   | 1-7 days  | Ready       |

**Total deployment time: ~4-5 hours from start to full production deployment**

---

## Success Criteria

🎯 **Fix is successful when:**

1. ✅ No user can access another user's purchases
2. ✅ No user can access another user's receipts
3. ✅ Logout completely clears all localStorage
4. ✅ Frontend fetches purchases from API (not localStorage)
5. ✅ All API endpoints require valid JWT
6. ✅ All queries filter by authenticated user_id
7. ✅ Admin endpoints check admin role
8. ✅ Zero data leakage in production logs

**If all criteria met → Fix is APPROVED for release ✅**

---

## Questions?

Refer to:

- **Technical details:** `SECURITY_FIXES.md`
- **Code changes:** `CODE_CHANGES_DETAILED.md`
- **Testing steps:** `TESTING_PLAYBOOK.md`
- **Quick reference:** `DATA_ISOLATION_FIX_SUMMARY.md`

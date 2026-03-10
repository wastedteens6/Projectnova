# ProjectNova Documentation

This folder contains all project documentation and planning artifacts.

## Files

### 📋 `task.md`
Task breakdown and checklist tracking progress across all project phases. Shows completed phases (1-2) and current work on Phase 3 (Project Catalog with RBAC).

### 📝 `implementation_plan.md`
Detailed technical implementation plan for Phase 3, including database schema changes, API routes, UI components, and verification steps.

### ✅ `walkthrough.md`
Implementation walkthrough documenting what has been completed:
- Phase 2: Authentication system with feature flags
- Phase 3: RBAC database implementation with seed data
- Lists all test credentials and seeded data

### 🚩 `FEATURE_FLAGS.md`
Complete guide to feature flags for toggling email functionality:
- `ENABLE_EMAIL`: Controls real email sending vs console logging
- `REQUIRE_EMAIL_VERIFICATION`: Controls mandatory email verification
- `ENABLE_PASSWORD_RESET`: Controls password reset feature visibility

Includes usage scenarios and migration guide.

## Quick Reference

**Test Credentials** (password: `password123`):
- Admin: `admin@projectnova.internal`
- Web Manager: `manager.web@projectnova.internal`
- Test Customer: `customer@example.com`

See `walkthrough.md` for complete list of all seeded users and projects.

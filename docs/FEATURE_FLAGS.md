# ProjectNova Feature Flags Guide

This document explains all configurable feature flags for email and authentication features.

---

## 🎯 Quick Overview

ProjectNova has **3 main feature flags** that control email-dependent features:

| Flag | Default | Purpose |
|------|---------|---------|
| `ENABLE_EMAIL` | `false` | Controls if real emails are sent |
| `REQUIRE_EMAIL_VERIFICATION` | `false` | Controls if users must verify email before login |
| `ENABLE_PASSWORD_RESET` | `false` | Controls if password reset feature is available |

---

## 📧 ENABLE_EMAIL

**Controls**: Whether to send real emails or log to console

**Default**: `false` (console logging mode)

### When `false`:
- Emails are logged to terminal console
- No SMTP server needed
- Perfect for development/testing
- All email content visible in logs

### When `true`:
- Real emails sent via SMTP
- Requires valid SMTP credentials
- Production-ready

**Environment Variables**:
```env
ENABLE_EMAIL="false"  # or "true"

# Required only if ENABLE_EMAIL=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="ProjectNova <noreply@projectnova.com>"
```

---

## ✉️ REQUIRE_EMAIL_VERIFICATION

**Controls**: Whether users must verify their email before logging in

**Default**: `false` (no verification required)

### When `false`:
- Users can login immediately after registration
- Email is auto-verified in database
- No verification email sent (even if ENABLE_EMAIL=true)
- Faster onboarding

### When `true`:
- Users must verify email before login
- Verification token generated and saved
- Verification email sent
- Login blocked until email verified

**Environment Variables**:
```env
# Server-side
REQUIRE_EMAIL_VERIFICATION="false"  # or "true"

# Client-side (for UI changes)
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"  # or "true"
```

**Impact**:
- **Registration**: Success message changes based on this flag
- **Login**: Checks verification status only if `true`
- **Database**: Sets `emailVerified=true` automatically if `false`

---

## 🔑 ENABLE_PASSWORD_RESET

**Controls**: Whether password reset feature is available

**Default**: `false` (feature disabled)

### When `false`:
- "Forgot Password" link hidden on login page
- Password reset endpoints still work (but not accessible via UI)
- Simplifies UI for development

### When `true`:
- "Forgot Password" link visible on login page
- Users can request password reset
- Reset emails sent (if ENABLE_EMAIL=true)
- Full password reset flow available

**Environment Variables**:
```env
# Server-side
ENABLE_PASSWORD_RESET="false"  # or "true"

# Client-side (for UI changes)
NEXT_PUBLIC_ENABLE_PASSWORD_RESET="false"  # or "true"
```

**Impact**:
- **Login Page**: Shows/hides "Forgot Password" link
- **API Routes**: Still functional regardless of flag
- **User Experience**: Cleaner UI when disabled

---

## 🚀 Usage Scenarios

### Scenario 1: Pure Development (Current Default)
**No email setup needed, fastest development**

```env
ENABLE_EMAIL="false"
REQUIRE_EMAIL_VERIFICATION="false"
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"
ENABLE_PASSWORD_RESET="false"
NEXT_PUBLIC_ENABLE_PASSWORD_RESET="false"
```

**Result**:
- ✅ Register instantly without email verification
- ✅ Login immediately after registration
- ✅ No "Forgot Password" distractions
- ✅ All emails logged to console
- ✅ Zero SMTP configuration needed

---

### Scenario 2: Development with Email Testing
**Test email flows without requiring verification**

```env
ENABLE_EMAIL="false"  # Console logging
REQUIRE_EMAIL_VERIFICATION="false"  # Skip verification
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"
ENABLE_PASSWORD_RESET="true"  # Enable password reset
NEXT_PUBLIC_ENABLE_PASSWORD_RESET="true"
```

**Result**:
- ✅ Test password reset flow
- ✅ See email content in console
- ✅ No verification required
- ✅ Faster testing cycles

---

### Scenario 3: Staging/Pre-Production
**Test with real emails but optional verification**

```env
ENABLE_EMAIL="true"  # Real emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-staging-email@gmail.com"
SMTP_PASSWORD="your-app-password"
REQUIRE_EMAIL_VERIFICATION="false"  # Still optional
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"
ENABLE_PASSWORD_RESET="true"
NEXT_PUBLIC_ENABLE_PASSWORD_RESET="true"
```

**Result**:
- ✅ Receive real emails
- ✅ Test email delivery
- ✅ No verification blocking
- ✅ Full password reset testing

---

### Scenario 4: Production
**Full email verification required**

```env
ENABLE_EMAIL="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@projectnova.com"
SMTP_PASSWORD="production-app-password"
REQUIRE_EMAIL_VERIFICATION="true"  # Required!
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"
ENABLE_PASSWORD_RESET="true"
NEXT_PUBLIC_ENABLE_PASSWORD_RESET="true"
```

**Result**:
- ✅ Real emails sent
- ✅ Email verification enforced
- ✅ Secure user onboarding
- ✅ Full password reset available

---

## 🔄 Migration Path

### Phase 1: Development (Now)
```env
All flags = "false"
```
Build features, test quickly, no email setup needed.

### Phase 2: Email Setup
```env
ENABLE_EMAIL="true"
SMTP credentials configured
Others still "false"
```
Start sending real emails but keep verification optional.

### Phase 3: Enable Features Gradually
```env
ENABLE_EMAIL="true"
ENABLE_PASSWORD_RESET="true"  # First
REQUIRE_EMAIL_VERIFICATION="false"  # Later
```
Enable password reset first, then verification when ready.

### Phase 4: Production
```env
All flags = "true"
```
Full security and email verification enforced.

---

## 🛠️ How to Change Flags

1. **Update `.env` file**:
   ```env
   REQUIRE_EMAIL_VERIFICATION="true"
   NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"
   ```

2. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Test the changes** - Features will behave differently based on flags

---

## 💡 Tips

- **Always set both versions** (with and without `NEXT_PUBLIC_`) for client-side flags
- **Start with all `false`** for fastest development
- **Enable one at a time** to test each feature
- **Use console logging** (`ENABLE_EMAIL=false`) during development
- **Document your configuration** in your deployment guide

---

## ❓ FAQ

**Q: Can I enable password reset without email verification?**  
A: Yes! They're independent flags.

**Q: What if I set REQUIRE_EMAIL_VERIFICATION=true but ENABLE_EMAIL=false?**  
A: Verification emails will be logged to console. Users can copy the link from console logs.

**Q: Do I need SMTP credentials if all flags are false?**  
A: No! You can develop without any email setup.

**Q: How do I test email flow without sending real emails?**  
A: Set `ENABLE_EMAIL=false`, emails will appear in your terminal with clickable links.

---

**Current Configuration**: All features disabled by default for easy development! 🎉

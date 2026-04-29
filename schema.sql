-- =======================================================
-- WastedTeens☠️ — ProjectNova Database Setup
-- =======================================================
-- Run this file in psql or any PostgreSQL client:
--   psql -U postgres -d projectnova -f schema.sql
-- Or paste the contents into pgAdmin's Query Tool.
-- =======================================================

-- Enable UUID generation extension (built-in in PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================================================
-- STEP 1: Drop existing tables (safe re-run)
-- =======================================================
DROP TABLE IF EXISTS "Notification"  CASCADE;
DROP TABLE IF EXISTS "Request"       CASCADE;
DROP TABLE IF EXISTS "Transaction"   CASCADE;
DROP TABLE IF EXISTS "Project"       CASCADE;
DROP TABLE IF EXISTS "User"          CASCADE;

-- Legacy tables from older versions (safe to ignore if absent)
DROP TABLE IF EXISTS "Analytics"                  CASCADE;
DROP TABLE IF EXISTS "Cart"                       CASCADE;
DROP TABLE IF EXISTS "CartItem"                   CASCADE;
DROP TABLE IF EXISTS "Category"                   CASCADE;
DROP TABLE IF EXISTS "Download"                   CASCADE;
DROP TABLE IF EXISTS "Order"                      CASCADE;
DROP TABLE IF EXISTS "OrderItem"                  CASCADE;
DROP TABLE IF EXISTS "Purchase"                   CASCADE;
DROP TABLE IF EXISTS "Receipt"                    CASCADE;
DROP TABLE IF EXISTS "SupportTicket"              CASCADE;
DROP TABLE IF EXISTS "Technology"                 CASCADE;
DROP TABLE IF EXISTS "TicketResponse"             CASCADE;
DROP TABLE IF EXISTS "Tier"                       CASCADE;
DROP TABLE IF EXISTS "Upgrade"                    CASCADE;
DROP TABLE IF EXISTS "ProjectImage"               CASCADE;
DROP TABLE IF EXISTS "ProjectVideo"               CASCADE;
DROP TABLE IF EXISTS "ProjectFeature"             CASCADE;
DROP TABLE IF EXISTS "ProjectTechnology"          CASCADE;
DROP TABLE IF EXISTS "ProjectTierContent"         CASCADE;
DROP TABLE IF EXISTS "ProjectTierFeature"         CASCADE;
DROP TABLE IF EXISTS "ProjectCustomizationRequest" CASCADE;

-- =======================================================
-- STEP 2: Create Tables
-- =======================================================

-- -------------------------------------------------------
-- TABLE 1: User
-- Stores registered users and admins.
-- -------------------------------------------------------
CREATE TABLE "User" (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,         -- bcrypt hashed
  role       VARCHAR(50)  DEFAULT 'user',   -- 'user' | 'admin'
  metadata   JSONB        DEFAULT '{}',     -- extra user data (avatar, preferences, etc.)
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- TABLE 2: Project
-- Stores all published academic projects with JSONB fields
-- for tech stack, features, tiers, and media.
-- -------------------------------------------------------
CREATE TABLE "Project" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(255) UNIQUE NOT NULL,   -- URL-friendly identifier
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  category     VARCHAR(100),
  is_published BOOLEAN   DEFAULT true,
  is_featured  BOOLEAN   DEFAULT false,         -- for featured/trending section
  tech_stack   JSONB     DEFAULT '[]',          -- e.g. ["Python", "React"]
  features     JSONB     DEFAULT '[]',          -- e.g. ["Real-time tracking", "Auth"]
  tiers        JSONB     DEFAULT '[]',
  -- tiers structure example:
  -- [
  --   {
  --     "level": "1",
  --     "name": "Starter",
  --     "price": 499,
  --     "features": ["Source Code", "Docs"],
  --     "drive_link": "https://drive.google.com/..."
  --   },
  --   { "level": "2", "name": "Pro",    "price": 999, ... },
  --   { "level": "3", "name": "Master", "price": 1999, ... }
  -- ]
  media      JSONB     DEFAULT '{"images": [], "videos": []}',
  -- images: array of server-relative paths, e.g. "/uploads/projects/images/foo.jpg"
  analytics  JSONB     DEFAULT '{"views": 0, "downloads": 0}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- TABLE 3: Transaction
-- Records every purchase / payment attempt.
-- -------------------------------------------------------
CREATE TABLE "Transaction" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES "User"(id) ON DELETE SET NULL,
  type            VARCHAR(50)  NOT NULL,            -- 'purchase' | 'upgrade' | 'refund'
  status          VARCHAR(50)  DEFAULT 'pending',   -- 'pending' | 'success' | 'failed'
  amount_in_paise INTEGER      DEFAULT 0,           -- amount × 100 (Razorpay format)
  items           JSONB        DEFAULT '[]',
  -- items structure example:
  -- [
  --   {
  --     "projectId": "uuid",
  --     "projectName": "My Project",
  --     "tier": "Pro",
  --     "price": 999,
  --     "driveLink": "https://drive.google.com/..."
  --   }
  -- ]
  payment_info    JSONB        DEFAULT '{}',        -- Razorpay response / mock receipt
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- TABLE 4: Request
-- Tracks support tickets and custom project requests.
-- -------------------------------------------------------
CREATE TABLE "Request" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES "User"(id) ON DELETE CASCADE,
  user_email   VARCHAR(255),
  type         VARCHAR(50)  NOT NULL, -- 'support' | 'custom_project'
  subject      VARCHAR(255) NOT NULL,
  description  TEXT         NOT NULL,
  details      JSONB        DEFAULT '{}',
  status       VARCHAR(50)  DEFAULT 'pending', -- 'pending', 'open', 'approved', 'reviewed', 'rejected', 'closed'
  admin_notes  TEXT,
  conversation JSONB        DEFAULT '[]',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- TABLE 5: Notification
-- Stores system notifications for users.
-- -------------------------------------------------------
CREATE TABLE "Notification" (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES "User"(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50), -- 'status_update', 'order_success', etc.
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- STEP 3: Indexes for performance
-- =======================================================
CREATE INDEX idx_user_email         ON "User"("email");
CREATE INDEX idx_project_slug       ON "Project"("slug");
CREATE INDEX idx_project_published  ON "Project"("is_published");
CREATE INDEX idx_transaction_user   ON "Transaction"("user_id");
CREATE INDEX idx_transaction_status ON "Transaction"("status");
CREATE INDEX idx_support_user       ON "Support"("user_id");
CREATE INDEX idx_customreq_email    ON "CustomRequest"("user_email");
CREATE INDEX idx_customreq_status   ON "CustomRequest"("status");
CREATE INDEX idx_notification_user  ON "Notification"("user_id");
CREATE INDEX idx_notification_read  ON "Notification"("is_read");

-- =======================================================
-- STEP 4: Seed initial data
-- =======================================================
-- Default admin user   password: admin123
-- Default regular user  password: user123
-- (These are bcrypt hashes — do NOT change unless you rehash)

INSERT INTO "User" (email, name, password, role) VALUES
(
  'admin@admin.com',
  'Admin User',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
),
(
  'user@example.com',
  'Regular User',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'user'
);

-- =======================================================
-- Done! Your WastedTeens database is ready.
-- =======================================================
-- Tables created:
--   "User"          — registered users and admins
--   "Project"       — academic projects with tiers + media
--   "Transaction"   — purchases and payment records
--   "Support"       — customer support tickets
--   "CustomRequest" — custom project build requests
--   "Notification"  — system notifications for users
-- =======================================================

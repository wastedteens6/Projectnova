-- Initialize PostgreSQL Database Schema in 3NF (Third Normal Form)
-- This file contains all table definitions normalized properly

-- ============================================================================
-- USERS TABLE (3NF Compliant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CATEGORY TABLE (Avoiding repeating groups - 1NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Category" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TECHNOLOGY TABLE (Separate atomic values - 1NF/2NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Technology" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================================================
-- TIER TABLE (Normalize tier information - 2NF/3NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Tier" (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL CHECK (level IN (1, 2, 3)),
  name VARCHAR(100) NOT NULL CHECK (name IN ('Code Only', 'Code + Videos', 'Premium Support')),
  price_in_paise INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROJECT TABLE (Core project info - 3NF Normalized)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Project" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES "Category"(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROJECT_FEATURE TABLE (Normalize key features - 1NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectFeature" (
  id SERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROJECT_TECHNOLOGY TABLE (Join table - normalize many-to-many - 2NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectTechnology" (
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  technology_id INTEGER NOT NULL REFERENCES "Technology"(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- ============================================================================
-- PROJECT_TIER_CONTENT TABLE (Normalize tier-specific content - 2NF/3NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectTierContent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  tier_id INTEGER NOT NULL REFERENCES "Tier"(id) ON DELETE CASCADE,
  google_drive_link VARCHAR(500),
  UNIQUE(project_id, tier_id)
);

-- ============================================================================
-- PROJECT_TIER_FEATURE TABLE (Normalize tier-specific features - 1NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectTierFeature" (
  id SERIAL PRIMARY KEY,
  project_tier_content_id UUID NOT NULL REFERENCES "ProjectTierContent"(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL
);

-- ============================================================================
-- PROJECT_IMAGE TABLE (Normalize images - 1NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectImage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROJECT_VIDEO TABLE (Normalize videos - 1NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ProjectVideo" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  video_type VARCHAR(50) DEFAULT 'preview',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PURCHASE TABLE (3NF - no redundant data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Purchase" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  tier_id INTEGER NOT NULL REFERENCES "Tier"(id) ON DELETE RESTRICT,
  amount_in_paise INTEGER NOT NULL,
  payment_order_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id, tier_id)
);

-- ============================================================================
-- UPGRADE TABLE (Track tier upgrades - 3NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Upgrade" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES "Purchase"(id) ON DELETE CASCADE,
  from_tier_id INTEGER NOT NULL REFERENCES "Tier"(id),
  to_tier_id INTEGER NOT NULL REFERENCES "Tier"(id),
  additional_amount_in_paise INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RECEIPT TABLE (3NF - normalized)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Receipt" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL UNIQUE REFERENCES "Purchase"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CUSTOM_PROJECT_REQUEST TABLE (Store user custom project requests - 3NF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "CustomProjectRequest" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT NOT NULL,
  domain VARCHAR(100) NOT NULL,
  input_output TEXT NOT NULL,
  deliverables JSONB,
  expected_deadline VARCHAR(100),
  phone VARCHAR(20),
  budget VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_project_slug ON "Project"(slug);
CREATE INDEX IF NOT EXISTS idx_project_category ON "Project"(category_id);
CREATE INDEX IF NOT EXISTS idx_project_published ON "Project"(is_published);
CREATE INDEX IF NOT EXISTS idx_purchase_user ON "Purchase"(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_project ON "Purchase"(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_tier ON "Purchase"(tier_id);
CREATE INDEX IF NOT EXISTS idx_receipt_transaction ON "Receipt"(transaction_id);
CREATE INDEX IF NOT EXISTS idx_project_technology ON "ProjectTechnology"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tier_content ON "ProjectTierContent"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_image ON "ProjectImage"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_video ON "ProjectVideo"(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_project_email ON "CustomProjectRequest"(user_email);
CREATE INDEX IF NOT EXISTS idx_custom_project_status ON "CustomProjectRequest"(status);
CREATE INDEX IF NOT EXISTS idx_custom_project_created ON "CustomProjectRequest"(created_at DESC);

-- ============================================================================
-- INSERT DEFAULT TIERS
-- ============================================================================
INSERT INTO "Tier" (level, name, price_in_paise) VALUES 
  (1, 'Code Only', 49900),
  (2, 'Code + Videos', 99900),
  (3, 'Premium Support', 199900)
ON CONFLICT (level) DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT CATEGORIES
-- ============================================================================
INSERT INTO "Category" (name, description) VALUES 
  ('Web', 'Web Development Projects'),
  ('AI', 'Artificial Intelligence Projects'),
  ('ML', 'Machine Learning Projects'),
  ('IoT', 'Internet of Things Projects'),
  ('DBMS', 'Database Management System Projects'),
  ('Mobile', 'Mobile App Projects'),
  ('Blockchain', 'Blockchain Projects'),
  ('Cybersecurity', 'Cybersecurity Projects'),
  ('Data', 'Data Science Projects')
ON CONFLICT (name) DO NOTHING;

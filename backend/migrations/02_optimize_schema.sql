-- Optimized Schema Migration (25 -> 5 Tables)
-- Consolidating deep hierarchies into JSONB fields for performance and simplicity.

-- 1. Optimized "User" Table
CREATE TABLE IF NOT EXISTS "User_New" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Optimized "Project" Table
CREATE TABLE IF NOT EXISTS "Project_New" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT true,
  tech_stack JSONB DEFAULT '[]', -- Array of strings
  features JSONB DEFAULT '[]',   -- Array of strings
  tiers JSONB DEFAULT '[]',      -- Array of tier objects
  media JSONB DEFAULT '{"images": [], "videos": []}',
  analytics JSONB DEFAULT '{"views": 0, "downloads": 0}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Optimized "Transaction" Table (Includes Orders and Cart)
CREATE TABLE IF NOT EXISTS "Transaction_New" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User_New"(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'order', 'purchase', 'upgrade', 'cart'
  status VARCHAR(50) DEFAULT 'pending',
  amount_in_paise INTEGER DEFAULT 0,
  items JSONB DEFAULT '[]', -- List of items in order/cart
  payment_info JSONB DEFAULT '{}', -- Razorpay details, receipt info
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Optimized "Support" Table
CREATE TABLE IF NOT EXISTS "Support_New" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User_New"(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  conversation JSONB DEFAULT '[]', -- Array of messages
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Optimized "CustomRequest" Table
CREATE TABLE IF NOT EXISTS "CustomRequest_New" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}', -- Technologies, domain, deliverables, etc.
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

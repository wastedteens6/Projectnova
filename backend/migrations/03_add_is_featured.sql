-- Migration: Add is_featured column to Project table
-- Description: Adds a column to track featured/trending projects

ALTER TABLE "Project" 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for faster featured project queries
CREATE INDEX IF NOT EXISTS idx_project_featured_published 
ON "Project" (is_featured DESC, created_at DESC) 
WHERE is_published = true;

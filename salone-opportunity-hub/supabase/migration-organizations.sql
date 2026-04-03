-- ============================================================
-- Migration: Organization System
-- Adds organizations table, updates opportunities with slug & org FK
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Organizations table (linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization-related columns to opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'onsite' CHECK (location_type IN ('remote', 'onsite', 'hybrid'));

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_slug ON opportunities(slug);
-- Index for organization's opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_organization_id ON opportunities(organization_id);

-- ============================================================
-- RLS for organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Anyone can view organizations (public info)
CREATE POLICY "Anyone can view organizations"
  ON organizations FOR SELECT USING (true);

-- Organization users can insert their own record
CREATE POLICY "Users can insert their own organization"
  ON organizations FOR INSERT WITH CHECK (auth.uid() = id);

-- Organization users can update their own record
CREATE POLICY "Users can update their own organization"
  ON organizations FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- RLS: Allow organizations to manage their own opportunities
-- ============================================================

-- Organizations can insert opportunities they own
CREATE POLICY "Organizations can insert opportunities"
  ON opportunities FOR INSERT WITH CHECK (auth.uid() = organization_id);

-- Organizations can update their own opportunities
CREATE POLICY "Organizations can update their own opportunities"
  ON opportunities FOR UPDATE USING (auth.uid() = organization_id);

-- Organizations can delete their own opportunities
CREATE POLICY "Organizations can delete their own opportunities"
  ON opportunities FOR DELETE USING (auth.uid() = organization_id);

-- ============================================================
-- Function: Generate unique slug from title
-- ============================================================
CREATE OR REPLACE FUNCTION generate_opportunity_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Convert title to slug: lowercase, replace spaces/special chars with hyphens
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    new_slug := base_slug;

    -- Ensure uniqueness by appending random suffix if needed
    WHILE EXISTS (SELECT 1 FROM opportunities WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || substr(md5(random()::text), 1, 6);
    END LOOP;

    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: auto-generate slug on insert/update
DROP TRIGGER IF EXISTS trigger_generate_opportunity_slug ON opportunities;
CREATE TRIGGER trigger_generate_opportunity_slug
  BEFORE INSERT OR UPDATE OF title ON opportunities
  FOR EACH ROW EXECUTE FUNCTION generate_opportunity_slug();

-- ============================================================
-- Backfill slugs for existing opportunities
-- ============================================================
UPDATE opportunities SET slug = NULL WHERE slug IS NULL;
-- The trigger will fire on update and generate slugs

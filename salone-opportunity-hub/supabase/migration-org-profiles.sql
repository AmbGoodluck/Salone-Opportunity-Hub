-- ============================================================
-- Migration: Organization Profile System
-- Adds profile fields (slug, logo, tagline, about, website, location)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add profile columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Index for slug lookups (public profile pages)
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ============================================================
-- Function: Generate unique slug from organization name
-- ============================================================
CREATE OR REPLACE FUNCTION generate_organization_slug()
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
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    new_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || substr(md5(random()::text), 1, 6);
    END LOOP;

    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: auto-generate slug on insert/update of name
DROP TRIGGER IF EXISTS trigger_generate_organization_slug ON organizations;
CREATE TRIGGER trigger_generate_organization_slug
  BEFORE INSERT OR UPDATE OF name ON organizations
  FOR EACH ROW EXECUTE FUNCTION generate_organization_slug();

-- Backfill slugs for existing organizations that don't have one
UPDATE organizations SET slug = NULL WHERE slug IS NULL;
-- The trigger will auto-generate slugs on the next update.
-- Force a name update to trigger slug generation:
UPDATE organizations SET name = name WHERE slug IS NULL;

-- ============================================================
-- Storage bucket for organization logos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own logo
CREATE POLICY "Org users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'org-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update/replace their own logo
CREATE POLICY "Org users can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'org-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all logos
CREATE POLICY "Public can view org logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'org-logos');

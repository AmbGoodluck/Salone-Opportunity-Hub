-- ============================================================
-- Salone Opportunity Hub — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  location TEXT,
  education_level TEXT,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table (extends Supabase auth.users — 1:1 with user)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  tagline TEXT,
  about TEXT,
  website TEXT,
  location TEXT,
  phone TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  organization TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  how_to_apply TEXT,
  type TEXT NOT NULL CHECK (type IN ('job', 'internship', 'scholarship', 'event', 'grant')),
  category TEXT NOT NULL,
  location TEXT,
  location_type TEXT DEFAULT 'onsite' CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  is_remote BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  funding_amount TEXT,
  study_level TEXT,
  application_link TEXT NOT NULL,
  image_url TEXT,
  source_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  required_skills JSONB DEFAULT '[]',
  education_level TEXT,
  experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved/bookmarked opportunities
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities ON DELETE CASCADE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- CV data storage
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'professional',
  personal_info JSONB NOT NULL DEFAULT '{}',
  education JSONB[] DEFAULT '{}',
  experience JSONB[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  languages JSONB[] DEFAULT '{}',
  certifications JSONB[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Indexes for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_remote ON opportunities(is_remote);
CREATE INDEX IF NOT EXISTS idx_opportunities_study_level ON opportunities(study_level);

CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_opportunity ON saved_opportunities(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_cvs_user ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_opportunities_slug ON opportunities(slug);
CREATE INDEX IF NOT EXISTS idx_opportunities_organization_id ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_opportunities_fts ON opportunities
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(organization, '')));

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Opportunities are public
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Opportunities (public read)
CREATE POLICY "Anyone can view opportunities"
  ON opportunities FOR SELECT USING (true);

-- Organizations can manage their own opportunities
CREATE POLICY "Organizations can insert opportunities"
  ON opportunities FOR INSERT WITH CHECK (auth.uid() = organization_id);

CREATE POLICY "Organizations can update their own opportunities"
  ON opportunities FOR UPDATE USING (auth.uid() = organization_id);

CREATE POLICY "Organizations can delete their own opportunities"
  ON opportunities FOR DELETE USING (auth.uid() = organization_id);

-- Organizations (public read, self-manage)
CREATE POLICY "Anyone can view organizations"
  ON organizations FOR SELECT USING (true);

CREATE POLICY "Users can insert their own organization"
  ON organizations FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own organization"
  ON organizations FOR UPDATE USING (auth.uid() = id);

-- Saved opportunities
CREATE POLICY "Users can view their saved opportunities"
  ON saved_opportunities FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities"
  ON saved_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved opportunities"
  ON saved_opportunities FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved opportunities"
  ON saved_opportunities FOR DELETE USING (auth.uid() = user_id);

-- CVs
CREATE POLICY "Users can view their own CVs"
  ON cvs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs"
  ON cvs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs"
  ON cvs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs"
  ON cvs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Auto-generate unique slug for opportunities
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
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    new_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM opportunities WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || substr(md5(random()::text), 1, 6);
    END LOOP;
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_opportunity_slug ON opportunities;
CREATE TRIGGER trigger_generate_opportunity_slug
  BEFORE INSERT OR UPDATE OF title ON opportunities
  FOR EACH ROW EXECUTE FUNCTION generate_opportunity_slug();

-- ============================================================
-- Auto-generate unique slug for organizations
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

DROP TRIGGER IF EXISTS trigger_generate_organization_slug ON organizations;
CREATE TRIGGER trigger_generate_organization_slug
  BEFORE INSERT OR UPDATE OF name ON organizations
  FOR EACH ROW EXECUTE FUNCTION generate_organization_slug();

-- ============================================================
-- Storage buckets (run these separately in Supabase Storage UI
-- or via the API)
-- ============================================================
-- Bucket: cv-photos (public)
-- Bucket: opportunity-images (public)
-- Bucket: org-logos (public)

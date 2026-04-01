-- ============================================================
-- Salone Opportunity Hub — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  location TEXT,
  education_level TEXT,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  how_to_apply TEXT,
  type TEXT NOT NULL CHECK (type IN ('job', 'internship', 'scholarship', 'event')),
  category TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  funding_amount TEXT,
  study_level TEXT,
  application_link TEXT NOT NULL,
  image_url TEXT,
  source_url TEXT,
  is_verified BOOLEAN DEFAULT false,
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

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_opportunities_fts ON opportunities
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(organization, '')));

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

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
-- Storage buckets (run these separately in Supabase Storage UI
-- or via the API)
-- ============================================================
-- Bucket: cv-photos (public)
-- Bucket: opportunity-images (public)

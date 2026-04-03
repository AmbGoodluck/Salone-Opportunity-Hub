-- Migration: Add skills and preferred location to profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_opportunity_location TEXT DEFAULT 'Remote';

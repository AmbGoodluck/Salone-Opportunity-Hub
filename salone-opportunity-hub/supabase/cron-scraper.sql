-- ============================================================
-- Salone Opportunity Hub - Automated Scraper Cron Job
-- ============================================================
-- This uses Supabase's built-in pg_cron + pg_net to call your
-- /api/scrape endpoint every 15 minutes automatically.
-- Runs inside Supabase - no laptop or external server needed.
--
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Enable the required extensions (may already be enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Remove old cron job if it exists (safe to run)
SELECT cron.unschedule('scrape-opportunities')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'scrape-opportunities'
);

-- Step 3: Create the cron job that calls your API every 15 minutes
-- IMPORTANT: Replace the URL with your actual deployed app URL
-- and the Bearer token with your SCRAPER_SECRET from .env.local
SELECT cron.schedule(
  'scrape-opportunities',     -- job name
  '*/15 * * * *',             -- every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://saloneopportunities.org/api/scrape',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer 7bcda469efcfb6dde7830db5796f5a10'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Step 4: Verify the cron job was created
SELECT jobid, schedule, command, jobname
FROM cron.job
WHERE jobname = 'scrape-opportunities';

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Check recent cron job runs:
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'scrape-opportunities')
-- ORDER BY start_time DESC LIMIT 20;

-- Manually trigger a test run:
-- SELECT net.http_post(
--   url := 'https://saloneopportunities.org/api/scrape',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer 7bcda469efcfb6dde7830db5796f5a10'
--   ),
--   body := '{}'::jsonb
-- );

-- Pause/disable the cron:
-- SELECT cron.unschedule('scrape-opportunities');

-- Check how many opportunities are in the database:
-- SELECT COUNT(*) as total, type, COUNT(*) as count
-- FROM opportunities GROUP BY type ORDER BY count DESC;

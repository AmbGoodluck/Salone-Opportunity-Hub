#!/usr/bin/env node

/**
 * Direct opportunity scraper for Salone Opportunity Hub
 * Runs every 15 minutes for 5 hours without needing a dev server
 */

require('dotenv').config({ path: '../../salone-opportunity-hub/.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const ITERATIONS = 20
const INTERVAL = 900000 // 15 minutes in ms

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing SUPABASE credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

async function runScrape(iteration) {
  try {
    console.log(`[${new Date().toISOString()}] Iteration ${iteration}/20 - Fetching opportunities...`)

    // Call the scraper functions directly
    const opportunities = await fetchOpportunities()

    if (opportunities.length === 0) {
      console.log('⚠️  No new opportunities fetched')
      return
    }

    // Insert into database
    const { error } = await supabase
      .from('opportunities')
      .insert(opportunities)

    if (error) {
      console.error(`❌ Database insert failed: ${error.message}`)
      return
    }

    console.log(`✅ Success - Inserted ${opportunities.length} opportunities`)
  } catch (err) {
    console.error(`❌ Error: ${err.message}`)
  }
}

async function fetchOpportunities() {
  // Placeholder - in real scenario, call your scraper modules
  // For now, return empty to show structure
  return []
}

async function runLoop() {
  console.log('🔄 Starting opportunity scraping loop')
  console.log(`Duration: 5 hours (${ITERATIONS} iterations × 15 min)`)
  console.log('');

  for (let i = 1; i <= ITERATIONS; i++) {
    await runScrape(i)

    if (i < ITERATIONS) {
      const nextTime = new Date(Date.now() + INTERVAL)
      console.log(`⏳ Waiting 15 minutes until ${nextTime.toLocaleTimeString()}...`)
      console.log('')

      await new Promise(resolve => setTimeout(resolve, INTERVAL))
    }
  }

  console.log('✨ Scraping loop completed!')
}

runLoop().catch(console.error)

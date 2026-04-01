import { createAdminClient } from '@/lib/supabase/admin'
import { OpportunityScraper } from '@/lib/scraper'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const maxDuration = 60 // 60 seconds for scraping

export async function POST(request: NextRequest) {
  // Validate scraper secret
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SCRAPER_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const scraper = new OpportunityScraper()

  try {
    const opportunities = await scraper.scrapeOpportunityDesk()
    let inserted = 0
    let skipped = 0

    for (const opp of opportunities) {
      // Check for duplicates by application_link
      const { data: existing } = await supabase
        .from('opportunities')
        .select('id')
        .eq('application_link', opp.application_link)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const { error } = await supabase.from('opportunities').insert(opp)
      if (!error) inserted++
    }

    return NextResponse.json({
      success: true,
      total: opportunities.length,
      inserted,
      skipped,
    })
  } catch (err) {
    console.error('Scraping error:', err)
    return NextResponse.json({ error: 'Scraping failed', details: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST with Bearer token to trigger scraping' })
}

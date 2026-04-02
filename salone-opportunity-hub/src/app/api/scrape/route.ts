import { createAdminClient } from '@/lib/supabase/admin'
import { OpportunityScraper } from '@/lib/scraper'
import { matchAndNotify } from '@/lib/notifications'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SCRAPER_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const scraper = new OpportunityScraper()

  const summary: { source: string; inserted: number; skipped: number; errors: string[] }[] = []
  const allInserted: { id: string; title: string; type: string; category: string; description: string }[] = []

  const sources = [
    { name: 'opportunity_desk', fn: () => scraper.scrapeOpportunityDesk() },
    { name: 'adzuna_api', fn: () => scraper.fetchAdzunaJobs() },
    { name: 'rss_devex', fn: () => scraper.scrapeRSSFeed('https://www.devex.com/jobs.rss') },
  ]

  for (const source of sources) {
    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    try {
      const opportunities = await source.fn()

      for (const opp of opportunities) {
        const { data: existing } = await supabase
          .from('opportunities')
          .select('id')
          .eq('application_link', opp.application_link)
          .single()

        if (existing) { skipped++; continue }

        const { data, error } = await supabase.from('opportunities').insert(opp).select('id, title, type, category, description').single()
        if (error) errors.push(error.message)
        else {
          inserted++
          if (data) allInserted.push(data)
        }
      }
    } catch (err) {
      errors.push(String(err))
    }

    summary.push({ source: source.name, inserted, skipped, errors })
  }

  // Send notifications for newly inserted opportunities
  if (allInserted.length > 0) {
    try {
      await matchAndNotify(allInserted)
    } catch (err) {
      console.error('Notification error:', err)
    }
  }

  const totalInserted = summary.reduce((s, r) => s + r.inserted, 0)
  const totalSkipped = summary.reduce((s, r) => s + r.skipped, 0)

  return NextResponse.json({ success: true, totalInserted, totalSkipped, sources: summary })
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST with Bearer token to trigger scraping' })
}

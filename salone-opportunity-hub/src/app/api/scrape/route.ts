import { createAdminClient } from '@/lib/supabase/admin'
import { OpportunityScraper } from '@/lib/scraper'
import { matchAndNotify } from '@/lib/notifications'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const maxDuration = 60

// Helper to chunk arrays to prevent "Failed to fetch" (URI Too Long) errors
const chunkArray = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Opportunity scraping is temporarily disabled.' }, { status: 200 });
        const { data } = await supabase
          .from('opportunities')
          .select('application_link')
          .in('application_link', chunk)
        if (data) existingDocsByLink.push(...data)
      }

      const existingDocsByTitle: any[] = []
      for (const chunk of chunkArray(titles, 25)) {
        const { data } = await supabase
          .from('opportunities')
          .select('title, organization')
          .in('title', chunk)
        if (data) existingDocsByTitle.push(...data)
      }

      const existingLinks = new Set(existingDocsByLink?.map(d => d.application_link) || [])
      const existingTitlesOrgs = new Set(existingDocsByTitle?.map(d => `${d.title}|${d.organization || ''}`) || [])

      // 2. Filter out duplicates
      const newOpps = opportunities.filter((opp: any) => {
        const hasSameLink = existingLinks.has(opp.application_link)
        const hasSameTitleOrg = existingTitlesOrgs.has(`${opp.title}|${opp.organization || ''}`)
        return !hasSameLink && !hasSameTitleOrg
      })
      skipped += opportunities.length - newOpps.length

      // 3. Bulk insert only the new opportunities
      if (newOpps.length > 0) {
        const { data, error } = await supabase.from('opportunities').insert(newOpps).select('id, title, type, category, description')
        if (error) errors.push(error.message)
        else if (data) {
          inserted += data.length
          allInserted.push(...data)
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

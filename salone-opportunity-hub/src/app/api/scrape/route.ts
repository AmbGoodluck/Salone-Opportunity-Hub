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
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST with Bearer token to trigger scraping' })
}

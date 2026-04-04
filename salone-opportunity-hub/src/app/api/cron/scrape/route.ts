import { NextResponse } from 'next/server'

export const runtime = 'edge'

// This endpoint is called by Cloudflare Cron Triggers every 15 minutes.
// It calls the /api/scrape POST endpoint internally.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = process.env.SCRAPER_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'SCRAPER_SECRET not configured' }, { status: 500 })
  }

  // Verify this is from the cron trigger or has the right secret
  const authHeader = request.headers.get('authorization')
  const cronHeader = request.headers.get('x-cloudflare-cron')

  if (!cronHeader && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Call the scrape endpoint internally
    const scrapeUrl = `${url.origin}/api/scrape`
    const response = await fetch(scrapeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json({ triggered: true, timestamp: new Date().toISOString(), ...data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

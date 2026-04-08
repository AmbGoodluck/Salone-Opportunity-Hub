import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Scraping disabled - sufficient data collected
export async function GET() {
  return NextResponse.json({ disabled: true, message: 'Scraping is currently disabled' })
}

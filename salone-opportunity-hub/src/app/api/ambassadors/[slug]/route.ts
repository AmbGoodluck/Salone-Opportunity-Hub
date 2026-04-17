import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/ambassadors/[slug] - get ambassador profile by slug
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, context: { params: any }) {
  const supabase = await createClient()
  // Workaround for Next.js/adapter bug: params may be a Promise
  let slug = context.params?.slug
  if (typeof slug === 'undefined' && typeof context.params?.then === 'function') {
    // If params is a Promise, await it
    const awaited = await context.params
    slug = awaited?.slug
  }
  const { data, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ambassador: data })
}

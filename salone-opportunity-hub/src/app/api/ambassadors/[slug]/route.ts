import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/ambassadors/[slug] - get ambassador profile by slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { slug } = params
  const { data, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ambassador: data })
}

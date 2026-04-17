import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/ambassadors - public directory with optional search
export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  let query = supabase
    .from('ambassadors')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ambassadors: data })
}

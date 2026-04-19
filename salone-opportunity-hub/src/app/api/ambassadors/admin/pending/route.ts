import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/ambassadors/admin/pending - list all pending applications
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ambassadors: data })
}

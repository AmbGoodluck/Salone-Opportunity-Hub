import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/ambassadors/admin/approve - approve an ambassador
export async function POST(request: Request) {
  const supabase = await createClient()
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await supabase
    .from('ambassadors')
    .update({ status: 'approved' })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

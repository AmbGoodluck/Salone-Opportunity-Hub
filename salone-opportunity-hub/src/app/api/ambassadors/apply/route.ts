import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/ambassadors/apply - submit application
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { name, profile_picture, city, region, phone, email, bio, user_id } = body
  // Basic validation
  if (!name || !city || !phone || !email || !user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  // Prevent duplicate by user, email, or phone
  const { data: existing, error: dupError } = await supabase
    .from('ambassadors')
    .select('id')
    .or(`user_id.eq.${user_id},email.eq.${email},phone.eq.${phone}`)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'You have already applied or this email/phone is in use.' }, { status: 409 })
  }
  // Insert
  const { data, error } = await supabase.from('ambassadors').insert([
    {
      name,
      profile_picture,
      city,
      region,
      phone,
      email,
      bio,
      user_id,
      status: 'pending',
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 7)
    }
  ]).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ambassador: data[0] })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is an organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Not an organization' }, { status: 403 })
    }

    const body = await request.json()
    const { name, tagline, about, website, email, location } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const updateData: Record<string, string | null> = {
      name: name.trim(),
      tagline: tagline?.trim() || null,
      about: about?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || org.id, // keep existing if not changed
      location: location?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, organization: updated })
  } catch (err) {
    console.error('Org profile update error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

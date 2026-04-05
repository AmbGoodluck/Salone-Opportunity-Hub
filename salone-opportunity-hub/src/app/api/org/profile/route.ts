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
    const { name, tagline, about, website, email, location, phone, is_public } = body

    // Allow toggling is_public without requiring name
    if (is_public !== undefined && Object.keys(body).length === 1) {
      const { error: toggleError } = await supabase
        .from('organizations')
        .update({ is_public, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (toggleError) {
        return NextResponse.json({ error: toggleError.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const updateData: Record<string, string | boolean | null> = {
      name: name.trim(),
      tagline: tagline?.trim() || null,
      about: about?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || org.id,
      location: location?.trim() || null,
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    if (is_public !== undefined) {
      updateData.is_public = is_public
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

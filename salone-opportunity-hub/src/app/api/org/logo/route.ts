import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Not an organization' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or SVG.' }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 2MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const filePath = `${user.id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('org-logos')
      .upload(filePath, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      const msg = uploadError.message.includes('Bucket not found')
        ? 'Storage bucket "org-logos" not found. Please create it in the Supabase dashboard.'
        : uploadError.message
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('org-logos')
      .getPublicUrl(filePath)

    // Update organization logo_url
    await supabase
      .from('organizations')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ success: true, logo_url: publicUrl })
  } catch (err) {
    console.error('Logo upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

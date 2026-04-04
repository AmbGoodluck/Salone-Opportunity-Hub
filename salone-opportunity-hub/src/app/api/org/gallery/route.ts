import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_GALLERY_PHOTOS = 10
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id, gallery_urls')
      .eq('id', user.id)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Not an organization' }, { status: 403 })
    }

    const currentPhotos = (org.gallery_urls as string[]) || []
    if (currentPhotos.length >= MAX_GALLERY_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_GALLERY_PHOTOS} gallery photos allowed` },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 2MB per photo.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const filePath = `${user.id}/gallery/${photoId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('org-logos')
      .upload(filePath, file, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('org-logos')
      .getPublicUrl(filePath)

    const updatedPhotos = [...currentPhotos, publicUrl]

    await supabase
      .from('organizations')
      .update({ gallery_urls: updatedPhotos, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ success: true, gallery_urls: updatedPhotos })
  } catch (err) {
    console.error('Gallery upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id, gallery_urls')
      .eq('id', user.id)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Not an organization' }, { status: 403 })
    }

    const body = await request.json()
    const { photo_url } = body

    if (!photo_url) {
      return NextResponse.json({ error: 'photo_url is required' }, { status: 400 })
    }

    const currentPhotos = (org.gallery_urls as string[]) || []
    const updatedPhotos = currentPhotos.filter((url: string) => url !== photo_url)

    // Remove from storage
    try {
      const urlObj = new URL(photo_url)
      const storagePath = urlObj.pathname.split('/object/public/org-logos/')[1]
      if (storagePath) {
        await supabase.storage.from('org-logos').remove([decodeURIComponent(storagePath)])
      }
    } catch {
      // Continue even if storage delete fails
    }

    await supabase
      .from('organizations')
      .update({ gallery_urls: updatedPhotos, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ success: true, gallery_urls: updatedPhotos })
  } catch (err) {
    console.error('Gallery delete error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

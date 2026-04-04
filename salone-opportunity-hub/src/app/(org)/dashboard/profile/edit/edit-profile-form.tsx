'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, ImageIcon } from 'lucide-react'
import type { Organization } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const MAX_GALLERY = 10

export function EditProfileForm({ organization }: { organization: Organization }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    (organization.gallery_urls as string[]) || []
  )

  const [form, setForm] = useState({
    name: organization.name || '',
    tagline: organization.tagline || '',
    about: organization.about || '',
    website: organization.website || '',
    email: organization.email || '',
    location: organization.location || '',
    phone: organization.phone || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('logo', file)
    try {
      const res = await fetch('/api/org/logo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLogoUrl(data.logo_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logo upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (galleryUrls.length >= MAX_GALLERY) {
      setError(`Maximum ${MAX_GALLERY} gallery photos allowed`)
      return
    }
    setIsGalleryUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await fetch('/api/org/gallery', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGalleryUrls(data.gallery_urls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed')
    } finally {
      setIsGalleryUploading(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  async function handleGalleryRemove(photoUrl: string) {
    setError(null)
    try {
      const res = await fetch('/api/org/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGalleryUrls(data.gallery_urls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/org/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Logo Upload */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-semibold">Logo</Label>
          <div className="flex items-center gap-4 mt-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold border border-gray-200">
                {form.name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, or SVG. Max 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sierra Tech Initiative" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline *</Label>
            <Input id="tagline" name="tagline" value={form.tagline} onChange={handleChange} placeholder="e.g. Empowering youth through technology" maxLength={120} />
            <p className="text-xs text-gray-500">{form.tagline.length}/120 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">About *</Label>
            <textarea id="about" name="about" value={form.about} onChange={handleChange} rows={5} placeholder="Tell people about your organization, mission, and what you do..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-base font-semibold">Photo Gallery</Label>
              <p className="text-xs text-gray-500 mt-0.5">Showcase your work, events, and team. Up to {MAX_GALLERY} photos, 2MB each.</p>
            </div>
            <span className="text-xs text-gray-400 font-medium">{galleryUrls.length}/{MAX_GALLERY}</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
            {galleryUrls.map((url) => (
              <div key={url} className="relative flex-shrink-0 group">
                <img src={url} alt="Gallery photo" className="w-28 h-28 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => handleGalleryRemove(url)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {galleryUrls.length < MAX_GALLERY && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isGalleryUploading}
                className="w-28 h-28 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
              >
                {isGalleryUploading ? (
                  <span className="text-xs">Uploading...</span>
                ) : (
                  <>
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-xs">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleGalleryUpload} className="hidden" />

          {galleryUrls.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
              <ImageIcon className="h-4 w-4" />
              No photos yet. Add photos to bring your profile to life.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Label className="text-base font-semibold">Contact Information</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. +232 76 123456" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://www.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Freetown, Sierra Leone" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Organization } from '@/types'

/**
 * Server-side guard: requires the current user to be an organization.
 * Redirects to org-login if not authenticated, home if not an org.
 * Returns the organization record and supabase client.
 */
export async function requireOrganization() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/org-login')
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!organization) {
    redirect('/')
  }

  return { supabase, user, organization: organization as Organization }
}

/**
 * Check if the current user is an organization (non-redirecting version).
 * Returns null if user is not an organization.
 */
export async function getOrganization() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.id)
    .single()

  return organization as Organization | null
}

/**
 * Check if an organization has completed the required profile fields.
 * Required: name, tagline, about, location
 */
export function isProfileComplete(org: Organization): boolean {
  return Boolean(org.name && org.tagline && org.about && org.location)
}

/**
 * Get the list of missing profile fields.
 */
export function getMissingProfileFields(org: Organization): string[] {
  const required: { key: keyof Organization; label: string }[] = [
    { key: 'name', label: 'Organization Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'about', label: 'About' },
    { key: 'location', label: 'Location' },
  ]
  return required.filter((f) => !org[f.key]).map((f) => f.label)
}

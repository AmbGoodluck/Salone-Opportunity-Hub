import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Organization } from '@/types'

/**
 * Server-side guard: requires the current user to be an organization.
 * Equivalent to Django's @organization_required decorator.
 * Redirects to home if the user is not authenticated or not an organization.
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
    // User exists but is not an organization — redirect to home
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

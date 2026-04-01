import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SavedOpportunitiesClient } from './saved-client'

export const metadata: Metadata = {
  title: 'Saved Opportunities | Salone Opportunity Hub',
}

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/saved')

  const { data: saved } = await supabase
    .from('saved_opportunities')
    .select(`
      *,
      opportunities (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved Opportunities</h1>
        <p className="text-gray-500 text-sm">Track your applications and bookmarked opportunities</p>
      </div>
      <SavedOpportunitiesClient initialSaved={saved ?? []} />
    </div>
  )
}

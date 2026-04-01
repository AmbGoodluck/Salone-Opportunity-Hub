import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'My Profile | Salone Opportunity Hub',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-500 text-sm">Keep your profile up to date for personalized opportunities</p>
      </div>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        initialProfile={profile}
      />
    </div>
  )
}

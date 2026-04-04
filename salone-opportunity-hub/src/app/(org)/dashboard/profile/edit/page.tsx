import type { Metadata } from 'next'
import { requireOrganization } from '@/lib/organization'
import { EditProfileForm } from './edit-profile-form'

export const metadata: Metadata = {
  title: 'Edit Profile | Organization Dashboard',
}

export default async function EditProfilePage() {
  const { organization } = await requireOrganization()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Organization Profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        Complete your profile to make your public page live and discoverable.
      </p>
      <EditProfileForm organization={organization} />
    </div>
  )
}

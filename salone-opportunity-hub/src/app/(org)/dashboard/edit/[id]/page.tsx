import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { requireOrganization } from '@/lib/organization'
import { EditOpportunityForm } from './edit-form'

export const metadata: Metadata = {
  title: 'Edit Opportunity | Salone Opportunity Hub',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditOpportunityPage({ params }: Props) {
  const { id } = await params
  const { supabase, organization } = await requireOrganization()

  // Fetch opportunity - only if owned by this organization
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organization.id)
    .single()

  if (!opportunity) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Opportunity</h1>
      <EditOpportunityForm opportunity={opportunity} />
    </div>
  )
}

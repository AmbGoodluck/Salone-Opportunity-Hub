import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { requireOrganization } from '@/lib/organization'
import { DeleteOpportunityConfirm } from './delete-confirm'

export const metadata: Metadata = {
  title: 'Delete Opportunity | Salone Opportunity Hub',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function DeleteOpportunityPage({ params }: Props) {
  const { id } = await params
  const { supabase, organization } = await requireOrganization()

  // Fetch opportunity - only if owned by this organization
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('id, title, organization_id')
    .eq('id', id)
    .eq('organization_id', organization.id)
    .single()

  if (!opportunity) {
    notFound()
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <DeleteOpportunityConfirm
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
      />
    </div>
  )
}

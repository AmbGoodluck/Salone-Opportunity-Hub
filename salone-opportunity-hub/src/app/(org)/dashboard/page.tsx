import Link from 'next/link'
import type { Metadata } from 'next'
import { requireOrganization } from '@/lib/organization'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'

export const metadata: Metadata = {
  title: 'Organization Dashboard | Salone Opportunity Hub',
}

export default async function DashboardPage() {
  const { supabase, organization } = await requireOrganization()

  // Retrieve opportunities created by this organization
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, slug, deadline, created_at')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  const now = new Date()

  // Attach status and share_url to each opportunity
  const enrichedOpportunities = (opportunities ?? []).map((opp) => {
    const isExpired = opp.deadline ? new Date(opp.deadline) < now : false
    return {
      ...opp,
      status: isExpired ? 'Expired' : 'Active',
      share_url: opp.slug ? `/opportunity/${opp.slug}` : `/opportunities/${opp.id}`,
    }
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Opportunities</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {organization.name}
          </p>
        </div>
        <Link href="/dashboard/post">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Post New Opportunity</Button>
        </Link>
      </div>

      {enrichedOpportunities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-3xl mb-3">📋</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No opportunities yet</h2>
          <p className="text-sm text-gray-500 mb-4">Post your first opportunity to get started.</p>
          <Link href="/dashboard/post">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Post Opportunity</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Deadline</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Share Link</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrichedOpportunities.map((opp) => (
                <tr key={opp.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{opp.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {opp.deadline
                      ? new Date(opp.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        opp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {opp.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <CopyLinkButton path={opp.share_url} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/dashboard/edit/${opp.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/delete/${opp.id}`}
                      className="text-red-600 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

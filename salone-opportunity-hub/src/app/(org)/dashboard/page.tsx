import Link from 'next/link'
import type { Metadata } from 'next'
import { requireOrganization, isProfileComplete, getMissingProfileFields } from '@/lib/organization'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'

export const metadata: Metadata = {
  title: 'Organization Dashboard | Salone Opportunity Hub',
}

export default async function DashboardPage() {
  const { supabase, organization } = await requireOrganization()

  const profileComplete = isProfileComplete(organization)
  const missingFields = getMissingProfileFields(organization)
  const orgSlug = organization.slug

  // Retrieve opportunities created by this organization
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, slug, deadline, created_at')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  const now = new Date()

  const enrichedOpportunities = (opportunities ?? []).map((opp) => {
    const isExpired = opp.deadline ? new Date(opp.deadline) < now : false
    return {
      ...opp,
      status: isExpired ? 'Expired' : 'Active',
      share_url: opp.slug ? `/opportunity/${opp.slug}` : `/opportunities/${opp.id}`,
    }
  })

  const activeCount = enrichedOpportunities.filter((o) => o.status === 'Active').length
  const expiredCount = enrichedOpportunities.filter((o) => o.status === 'Expired').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            {organization.tagline && (
              <p className="text-sm text-gray-500 mt-0.5">{organization.tagline}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {orgSlug && (
            <>
              <Link href={`/org/${orgSlug}`}>
                <Button variant="outline" size="sm" className="text-sm">
                  View Public Page
                </Button>
              </Link>
              <CopyLinkButton path={`/org/${orgSlug}`} />
            </>
          )}
        </div>
      </div>

      {/* ── Profile Status Card ── */}
      <div className={`rounded-xl border p-5 ${profileComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{profileComplete ? '✅' : '⚠️'}</span>
            <div>
              <h2 className="font-semibold text-gray-900">
                {profileComplete ? 'Profile Complete' : 'Complete your profile to go live'}
              </h2>
              {!profileComplete && (
                <p className="text-sm text-gray-600 mt-0.5">
                  Missing: {missingFields.join(', ')}
                </p>
              )}
              {profileComplete && (
                <p className="text-sm text-gray-600 mt-0.5">
                  Your public page is live and discoverable.
                </p>
              )}
            </div>
          </div>
          <Link href="/dashboard/profile/edit">
            <Button variant={profileComplete ? 'outline' : 'default'} size="sm" className={!profileComplete ? 'bg-amber-600 hover:bg-amber-700' : ''}>
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Opportunities</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{enrichedOpportunities.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{expiredCount}</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/post">
          <Button className="bg-blue-700 hover:bg-blue-800">+ Post Opportunity</Button>
        </Link>
        <Link href="/dashboard/profile/edit">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      {/* ── Opportunities Table ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Opportunities</h2>

        {enrichedOpportunities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              You haven&apos;t posted any opportunities yet
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Post your first opportunity to attract talent and grow your reach.
            </p>
            <Link href="/dashboard/post">
              <Button className="bg-blue-700 hover:bg-blue-800">Post Opportunity</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Deadline</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Share</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedOpportunities.map((opp) => (
                    <tr key={opp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{opp.title}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {opp.deadline
                          ? new Date(opp.deadline).toLocaleDateString()
                          : 'No deadline'}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={
                            opp.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-600 border-red-200'
                          }
                        >
                          {opp.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <CopyLinkButton path={opp.share_url} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-3">
                        <Link
                          href={`/dashboard/edit/${opp.id}`}
                          className="text-blue-700 hover:text-blue-800 text-xs font-medium"
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

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {enrichedOpportunities.map((opp) => (
                <div key={opp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">{opp.title}</h3>
                    <Badge
                      variant="outline"
                      className={
                        opp.status === 'Active'
                          ? 'bg-green-50 text-green-700 border-green-200 ml-2 flex-shrink-0'
                          : 'bg-red-50 text-red-600 border-red-200 ml-2 flex-shrink-0'
                      }
                    >
                      {opp.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'None'}
                  </p>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton path={opp.share_url} />
                    <Link
                      href={`/dashboard/edit/${opp.id}`}
                      className="text-blue-700 hover:text-blue-800 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/delete/${opp.id}`}
                      className="text-red-600 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Globe, Mail, Calendar, ArrowLeft, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TYPE_COLORS, formatDeadline } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  if (!org) return { title: 'Organization Not Found' }

  return {
    title: `${org.name} Opportunities | SOH`,
    description: `Explore opportunities by ${org.name} in Sierra Leone`,
  }
}

export default async function PublicOrgProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  // If profile is not public, return 404
  if (org.is_public === false) notFound()

  // Fetch open opportunities (not expired)
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, slug, type, category, location, location_type, deadline, description, created_at')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  const openOpportunities = (opportunities ?? []).filter(
    (opp) => !opp.deadline || new Date(opp.deadline) >= now
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Organizations
          </Link>

          <div className="flex items-start gap-5">
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl flex-shrink-0">
                {org.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
              {org.tagline && (
                <p className="text-lg text-gray-600 mt-1">{org.tagline}</p>
              )}
              {org.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  {org.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* About Section */}
        {org.about && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{org.about}</p>
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {org.gallery_urls && org.gallery_urls.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Gallery</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {org.gallery_urls.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${org.name} photo ${i + 1}`}
                    className="w-48 h-36 sm:w-56 sm:h-40 flex-shrink-0 rounded-lg object-cover snap-start border border-gray-100 hover:shadow-md transition-shadow"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Open Opportunities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Open Opportunities
              {openOpportunities.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({openOpportunities.length})
                </span>
              )}
            </h2>
          </div>

          {openOpportunities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">No open opportunities at the moment.</p>
              <p className="text-gray-400 text-xs mt-1">Check back later!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {openOpportunities.map((opp) => {
                const deadline = formatDeadline(opp.deadline)
                const typeColor = TYPE_COLORS[opp.type] || TYPE_COLORS.job
                const detailUrl = opp.slug ? `/opportunity/${opp.slug}` : `/opportunities/${opp.id}`

                return (
                  <Link key={opp.id} href={detailUrl} className="block group">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <Badge
                              variant="outline"
                              className={`${typeColor} text-xs capitalize`}
                            >
                              {opp.type}
                            </Badge>
                            {opp.category && (
                              <span className="text-xs text-gray-400">{opp.category}</span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {opp.title}
                          </h3>
                          {opp.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {opp.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {opp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {opp.location}
                              </span>
                            )}
                            {opp.location_type && opp.location_type !== 'onsite' && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {opp.location_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {deadline.label !== 'No deadline' && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {deadline.label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Contact Info */}
        {(org.website || org.email || org.location || org.phone) && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    <Mail className="h-4 w-4" />
                    {org.email}
                  </a>
                )}
                {org.phone && (
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    <Phone className="h-4 w-4" />
                    {org.phone}
                  </a>
                )}
                {org.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {org.location}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-blue-700 hover:text-blue-800 font-medium">
              Salone Opportunity Hub
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

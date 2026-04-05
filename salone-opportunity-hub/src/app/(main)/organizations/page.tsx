import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { OrgDirectorySearch } from './search'

export const metadata: Metadata = {
  title: 'Organizations | Salone Opportunity Hub',
  description: 'Discover organizations posting opportunities in Sierra Leone',
}

export default async function OrganizationsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('organizations')
    .select('id, name, slug, logo_url, tagline, location')
    .neq('is_public', false)
    .order('name', { ascending: true })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: organizations } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-500 mt-1">
          Discover organizations posting opportunities in Sierra Leone
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <OrgDirectorySearch initialQuery={q || ''} />
      </div>

      {/* Grid */}
      {!organizations || organizations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🏢</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {q ? 'No organizations found' : 'No organizations yet'}
          </h2>
          <p className="text-sm text-gray-500">
            {q ? `No results for "${q}". Try a different search.` : 'Organizations will appear here once they sign up.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={org.slug ? `/org/${org.slug}` : '#'}
              className="block group"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                      {org.name}
                    </h3>
                    {org.tagline && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {org.tagline}
                      </p>
                    )}
                    {org.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {org.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="w-full text-sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

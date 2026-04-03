import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { OpportunityFilters } from '@/components/opportunities/opportunity-filters'
import { OpportunitySearch } from '@/components/opportunities/opportunity-search'
import { OpportunitySort } from '@/components/opportunities/opportunity-sort'
import { LocalFilter } from '@/components/opportunities/local-filter'
import { Pagination } from '@/components/opportunities/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { Opportunity } from '@/types'
import type { Profile } from '@/types'
import { getMatchData, calculateMatch, isProfileComplete } from '@/lib/match'
import { addDays, addMonths } from 'date-fns'

export const metadata: Metadata = {
  title: 'Opportunities | Salone Opportunity Hub',
  description: 'Browse scholarships, jobs, internships, and events for Sierra Leone youth.',
}

const PAGE_SIZE = 20

interface SearchParams {
  search?: string
  type?: string | string[]
  category?: string | string[]
  deadline?: string
  study_level?: string | string[]
  sort?: string
  page?: string
  local?: string
}

async function OpportunitiesGrid({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const page = parseInt(searchParams.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('sl_eligible', true)

  // Search
  if (searchParams.search) {
    query = query.or(
      `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%,organization.ilike.%${searchParams.search}%`
    )
  }

  // Type filter
  const types = Array.isArray(searchParams.type)
    ? searchParams.type
    : searchParams.type
    ? [searchParams.type]
    : []
  if (types.length > 0) {
    query = query.in('type', types as ('job' | 'internship' | 'scholarship' | 'event' | 'grant')[])
  }

  // Category filter
  const categories = Array.isArray(searchParams.category)
    ? searchParams.category
    : searchParams.category
    ? [searchParams.category]
    : []
  if (categories.length > 0) {
    query = query.in('category', categories)
  }

  // Study level filter
  const studyLevels = Array.isArray(searchParams.study_level)
    ? searchParams.study_level
    : searchParams.study_level
    ? [searchParams.study_level]
    : []
  if (studyLevels.length > 0) {
    query = query.in('study_level', studyLevels)
  }

  // Deadline filter
  if (searchParams.deadline) {
    const now = new Date()
    let cutoff: Date
    if (searchParams.deadline === 'week') cutoff = addDays(now, 7)
    else if (searchParams.deadline === 'month') cutoff = addDays(now, 30)
    else cutoff = addMonths(now, 3)

    query = query
      .gte('deadline', now.toISOString())
      .lte('deadline', cutoff.toISOString())
  }

  // Local Sierra Leone filter - match org-posted opportunities with SL location
  if (searchParams.local === '1') {
    query = query.or(
      'location.ilike.%sierra leone%,location.ilike.%freetown%,location.ilike.%bo %,location.ilike.%kenema%,location.ilike.%makeni%'
    )
  }

  // Sort
  const sort = searchParams.sort ?? 'newest'
  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true, nullsFirst: false })
  } else if (sort === 'alphabetical') {
    query = query.order('title', { ascending: true })
  } else if ((sort === 'recommended' || sort === 'best_match') && user) {
    // For recommended/best_match, fetch more and re-sort server-side
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false }).order('type', { ascending: true })
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: opportunities, count } = await query

  // Get saved opportunity IDs and full profile for match scoring
  let savedIds: Set<string> = new Set()
  let userProfile: Profile | null = null
  if (user) {
    const [{ data: saved }, { data: profile }] = await Promise.all([
      supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
    ])
    savedIds = new Set(saved?.map((s) => s.opportunity_id) ?? [])
    userProfile = profile as Profile | null
  }

  // Re-sort recommended results by profile match score
  let sortedOpportunities = opportunities ?? []
  if (sort === 'best_match' && userProfile && isProfileComplete(userProfile) && sortedOpportunities.length > 0) {
    // Sort by full match score (skills, education, experience, location)
    sortedOpportunities = [...sortedOpportunities].sort((a, b) => {
      const scoreA = calculateMatch(userProfile!, a as Opportunity).match_score
      const scoreB = calculateMatch(userProfile!, b as Opportunity).match_score
      return scoreB - scoreA // descending: best match first
    })
  } else if (sort === 'recommended' && userProfile && sortedOpportunities.length > 0) {
    const prefTypes = new Set(userProfile.preferred_types ?? [])
    const prefCats = new Set(userProfile.preferred_categories ?? [])

    sortedOpportunities = [...sortedOpportunities].sort((a, b) => {
      let scoreA = 0
      let scoreB = 0
      if (prefTypes.size > 0) {
        if (prefTypes.has(a.type)) scoreA += 2
        if (prefTypes.has(b.type)) scoreB += 2
      }
      if (prefCats.size > 0) {
        if (prefCats.has(a.category)) scoreA += 1
        if (prefCats.has(b.category)) scoreB += 1
      }
      return scoreB - scoreA
    })
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const activeFilterCount =
    types.length +
    categories.length +
    studyLevels.length +
    (searchParams.deadline ? 1 : 0)

  if (!sortedOpportunities || sortedOpportunities.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No opportunities found"
        description="Try adjusting your search or filters to find what you're looking for."
        actionLabel="Clear filters"
        actionHref="/opportunities"
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {count} result{count !== 1 ? 's' : ''}
        {page > 1 && ` - Page ${page} of ${totalPages}`}
      </p>

      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">⚠️ Fraud Alert</p>
        <p className="text-amber-700 mt-1">
          Do NOT send money to anyone claiming to offer opportunities. All legitimate opportunities listed here are free to apply. If someone asks you for payment, report it immediately.
        </p>
        <p className="text-amber-600 mt-1 text-xs italic">- Sheku Foryoh, CEO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(sortedOpportunities as Opportunity[]).map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            isSaved={savedIds.has(opp.id)}
            isLoggedIn={!!user}
            matchData={getMatchData(!!user, userProfile, opp)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const activeFilterCount =
    (Array.isArray(params.type) ? params.type.length : params.type ? 1 : 0) +
    (Array.isArray(params.category) ? params.category.length : params.category ? 1 : 0) +
    (Array.isArray(params.study_level) ? params.study_level.length : params.study_level ? 1 : 0) +
    (params.deadline ? 1 : 0)

  // Fetch opportunity counts for stats
  const supabase = await createClient()
  const [{count: totalCount}, {count: jobCount}, {count: internshipCount}, {count: scholarshipCount}, {count: eventCount}, {count: grantCount}] = await Promise.all([
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('sl_eligible', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'job').eq('sl_eligible', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'internship').eq('sl_eligible', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'scholarship').eq('sl_eligible', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'event').eq('sl_eligible', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'grant').eq('sl_eligible', true),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities</h1>
        <p className="text-gray-600">Scholarships, jobs, internships, grants &amp; events for Sierra Leone youth</p>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-emerald-600">{totalCount ?? 0}</div>
          <div className="text-xs text-gray-600 mt-1">Total</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-700">{jobCount ?? 0}</div>
          <div className="text-xs text-blue-700 mt-1">Jobs</div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-700">{internshipCount ?? 0}</div>
          <div className="text-xs text-purple-700 mt-1">Internships</div>
        </div>
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-emerald-700">{scholarshipCount ?? 0}</div>
          <div className="text-xs text-emerald-700 mt-1">Scholarships</div>
        </div>
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-amber-700">{eventCount ?? 0}</div>
          <div className="text-xs text-amber-700 mt-1">Events</div>
        </div>
        <div className="bg-rose-50 rounded-lg border border-rose-200 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-rose-700">{grantCount ?? 0}</div>
          <div className="text-xs text-rose-700 mt-1">Grants</div>
        </div>
      </div>

      {/* Search + Filter + Sort bar */}
      <div className="flex items-center gap-3 mb-6">
        <OpportunitySearch defaultValue={params.search} />
        <OpportunityFilters activeFilterCount={activeFilterCount} />
        <LocalFilter />
        <OpportunitySort currentSort={params.sort ?? 'newest'} />
      </div>

      {/* Opportunities grid */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        }
      >
        <OpportunitiesGrid searchParams={params} />
      </Suspense>
    </div>
  )
}

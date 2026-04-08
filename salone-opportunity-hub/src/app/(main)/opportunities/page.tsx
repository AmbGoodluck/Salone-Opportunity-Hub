import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
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
  region?: string | string[]
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

  // Region / continent filter
  const regions = Array.isArray(searchParams.region)
    ? searchParams.region
    : searchParams.region
    ? [searchParams.region]
    : []
  if (regions.length > 0) {
    const regionCountries: Record<string, string[]> = {
      africa: ['sierra leone', 'nigeria', 'ghana', 'kenya', 'south africa', 'ethiopia', 'tanzania', 'uganda', 'rwanda', 'senegal', 'cameroon', 'egypt', 'morocco', 'liberia', 'gambia', 'guinea', 'mali', 'niger', 'togo', 'benin', 'africa'],
      asia: ['china', 'japan', 'india', 'korea', 'singapore', 'malaysia', 'thailand', 'vietnam', 'indonesia', 'philippines', 'pakistan', 'bangladesh', 'sri lanka', 'taiwan', 'hong kong', 'asia'],
      europe: ['united kingdom', 'uk', 'germany', 'france', 'netherlands', 'sweden', 'norway', 'denmark', 'finland', 'switzerland', 'belgium', 'austria', 'spain', 'italy', 'portugal', 'ireland', 'poland', 'europe'],
      americas: ['united states', 'usa', 'canada', 'brazil', 'mexico', 'colombia', 'argentina', 'chile', 'peru', 'america', 'americas'],
      oceania: ['australia', 'new zealand', 'fiji', 'oceania'],
    }
    const patterns = regions.flatMap((r) => regionCountries[r] ?? []).map((c) => `location.ilike.%${c}%`)
    if (patterns.length > 0) {
      query = query.or(patterns.join(','))
    }
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
    regions.length +
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
  // Disable all opportunity API calls for now
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities</h1>
        <p className="text-gray-600">Opportunity listings are temporarily unavailable.</p>
      </div>
      <EmptyState
        icon="⏸️"
        title="Temporarily Disabled"
        description="Opportunity data is currently disabled. Please check back later."
      />
    </div>
  )
}

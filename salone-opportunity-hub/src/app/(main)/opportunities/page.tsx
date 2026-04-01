import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { OpportunityFilters } from '@/components/opportunities/opportunity-filters'
import { OpportunitySearch } from '@/components/opportunities/opportunity-search'
import { OpportunitySort } from '@/components/opportunities/opportunity-sort'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { Opportunity } from '@/types'
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
    query = query.in('type', types as ('job' | 'internship' | 'scholarship' | 'event')[])
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

  // Sort
  const sort = searchParams.sort ?? 'newest'
  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true, nullsFirst: false })
  } else if (sort === 'alphabetical') {
    query = query.order('title', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: opportunities, count } = await query

  // Get saved opportunity IDs for current user
  let savedIds: Set<string> = new Set()
  if (user) {
    const { data: saved } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('user_id', user.id)
    savedIds = new Set(saved?.map((s) => s.opportunity_id) ?? [])
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const activeFilterCount =
    types.length +
    categories.length +
    studyLevels.length +
    (searchParams.deadline ? 1 : 0)

  if (!opportunities || opportunities.length === 0) {
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {count} result{count !== 1 ? 's' : ''}
          {page > 1 && ` — Page ${page} of ${totalPages}`}
        </p>
        <OpportunitySort currentSort={sort} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {(opportunities as Opportunity[]).map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            isSaved={savedIds.has(opp.id)}
            isLoggedIn={!!user}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar currentPage={page} totalPages={totalPages} searchParams={searchParams} />
      )}
    </div>
  )
}

function PaginationBar({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  searchParams: SearchParams
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key === 'page') return
      if (Array.isArray(val)) val.forEach((v) => params.append(key, v))
      else if (val) params.set(key, val)
    })
    params.set('page', String(page))
    return `/opportunities?${params.toString()}`
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {currentPage > 1 && (
        <a href={buildUrl(currentPage - 1)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
          Previous
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={buildUrl(p)}
          className={`px-3 py-1.5 text-sm border rounded-lg ${
            p === currentPage
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'hover:bg-gray-50'
          }`}
        >
          {p}
        </a>
      ))}
      {currentPage < totalPages && (
        <a href={buildUrl(currentPage + 1)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
          Next
        </a>
      )}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Opportunities</h1>
        <p className="text-gray-500 text-sm">Scholarships, jobs, internships &amp; events for Sierra Leone youth</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <OpportunitySearch defaultValue={params.search} />
        <OpportunityFilters activeFilterCount={activeFilterCount} />
      </div>

      <div className="flex gap-6">
        <OpportunityFilters activeFilterCount={activeFilterCount} />
        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            }
          >
            <OpportunitiesGrid searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

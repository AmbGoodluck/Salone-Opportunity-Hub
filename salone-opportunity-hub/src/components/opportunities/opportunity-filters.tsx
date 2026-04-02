'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, STUDY_LEVELS, LOCATIONS, OPPORTUNITY_TYPES } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  job: 'Jobs',
  internship: 'Internships',
  scholarship: 'Scholarships',
  event: 'Events',
  grant: 'Grants',
}

const DEADLINE_OPTIONS = [
  { value: 'week', label: 'Next 7 days' },
  { value: 'month', label: 'Next 30 days' },
  { value: 'quarter', label: 'Next 3 months' },
]

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      {children}
    </div>
  )
}

function FilterContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll(key)

    if (checked) {
      if (!current.includes(value)) {
        params.append(key, value)
      }
    } else {
      const newValues = current.filter((v) => v !== value)
      params.delete(key)
      newValues.forEach((v) => params.append(key, v))
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const clearFilters = () => {
    router.push(pathname)
  }

  const activeTypes = searchParams.getAll('type')
  const activeCategories = searchParams.getAll('category')
  const activeDeadline = searchParams.get('deadline')
  const activeStudyLevels = searchParams.getAll('study_level')
  const hasFilters = activeTypes.length > 0 || activeCategories.length > 0 || activeDeadline || activeStudyLevels.length > 0

  return (
    <div className="space-y-6">
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 -ml-1">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear all filters
        </Button>
      )}

      <FilterGroup title="Type">
        {OPPORTUNITY_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <Checkbox
              id={`type-${type}`}
              checked={activeTypes.includes(type)}
              onCheckedChange={(checked) => updateParam('type', type, !!checked)}
            />
            <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
              {TYPE_LABELS[type]}
            </Label>
          </div>
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Deadline">
        {DEADLINE_OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`deadline-${opt.value}`}
              checked={activeDeadline === opt.value}
              onCheckedChange={(checked) => {
                if (checked) setParam('deadline', opt.value)
                else {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('deadline')
                  router.push(`${pathname}?${params.toString()}`)
                }
              }}
            />
            <Label htmlFor={`deadline-${opt.value}`} className="text-sm font-normal cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Category">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <Checkbox
              id={`cat-${cat}`}
              checked={activeCategories.includes(cat)}
              onCheckedChange={(checked) => updateParam('category', cat, !!checked)}
            />
            <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer">
              {cat}
            </Label>
          </div>
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup title="Study Level (Scholarships)">
        {STUDY_LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <Checkbox
              id={`level-${level}`}
              checked={activeStudyLevels.includes(level)}
              onCheckedChange={(checked) => updateParam('study_level', level, !!checked)}
            />
            <Label htmlFor={`level-${level}`} className="text-sm font-normal cursor-pointer">
              {level}
            </Label>
          </div>
        ))}
      </FilterGroup>
    </div>
  )
}

export function OpportunityFilters({ activeFilterCount = 0 }: { activeFilterCount?: number }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </h3>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter sheet */}
      <Sheet>
        <SheetTrigger className="lg:hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="h-4 w-4 p-0 text-xs flex items-center justify-center bg-emerald-600">
                {activeFilterCount}
              </Badge>
            )}
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Filter Opportunities</SheetTitle>
          </SheetHeader>
          <FilterContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

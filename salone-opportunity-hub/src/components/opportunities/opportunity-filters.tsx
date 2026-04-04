'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CATEGORIES, STUDY_LEVELS, OPPORTUNITY_TYPES } from '@/lib/utils'

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

const REGION_OPTIONS = [
  { value: 'africa', label: 'Africa' },
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'americas', label: 'Americas' },
  { value: 'oceania', label: 'Oceania' },
]

export function OpportunityFilters({ activeFilterCount = 0 }: { activeFilterCount?: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const updateParam = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll(key)
    if (checked) {
      if (!current.includes(value)) params.append(key, value)
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
    setOpen(false)
  }

  const activeTypes = searchParams.getAll('type')
  const activeCategories = searchParams.getAll('category')
  const activeDeadline = searchParams.get('deadline')
  const activeStudyLevels = searchParams.getAll('study_level')
  const activeRegions = searchParams.getAll('region')
  const hasFilters = activeTypes.length > 0 || activeCategories.length > 0 || activeDeadline || activeStudyLevels.length > 0 || activeRegions.length > 0

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
          open
            ? 'bg-blue-50 border-blue-300 text-blue-800'
            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 h-5 w-5 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-medium">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Dropdown modal */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">Filter Opportunities</span>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[60vh] p-4 space-y-5">
            {/* Type */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Type</h4>
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
            </div>

            <Separator />

            {/* Deadline */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Deadline</h4>
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
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Category</h4>
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
            </div>

            <Separator />

            {/* Study Level */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Study Level</h4>
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
            </div>

            <Separator />

            {/* Region / Continent */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Region</h4>
              {REGION_OPTIONS.map((region) => (
                <div key={region.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`region-${region.value}`}
                    checked={activeRegions.includes(region.value)}
                    onCheckedChange={(checked) => updateParam('region', region.value, !!checked)}
                  />
                  <Label htmlFor={`region-${region.value}`} className="text-sm font-normal cursor-pointer">
                    {region.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

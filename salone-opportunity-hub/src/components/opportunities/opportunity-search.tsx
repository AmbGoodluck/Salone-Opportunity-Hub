'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useEffect } from 'react'

interface OpportunitySearchProps {
  defaultValue?: string
}

export function OpportunitySearch({ defaultValue = '' }: OpportunitySearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set('search', debouncedValue)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [debouncedValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search opportunities, organizations…"
        className="pl-9 pr-8 h-9"
        aria-label="Search opportunities"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
      )}
    </div>
  )
}

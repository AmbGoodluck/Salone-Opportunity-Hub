'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'

export function OrgDirectorySearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      const params = new URLSearchParams()
      if (value.trim()) params.set('q', value.trim())
      router.push(`/organizations${params.toString() ? `?${params}` : ''}`)
    },
    [router]
  )

  return (
    <Input
      type="search"
      placeholder="Search organizations by name..."
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      className="max-w-md"
    />
  )
}

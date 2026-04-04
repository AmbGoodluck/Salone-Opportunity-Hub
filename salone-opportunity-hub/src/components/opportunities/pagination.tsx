'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/opportunities?${params.toString()}`)
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-3 pt-4 text-sm">
      {currentPage > 1 && (
        <button onClick={() => goToPage(currentPage - 1)} className="text-gray-500 hover:text-blue-700">
          Previous
        </button>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={
            p === currentPage
              ? 'text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-blue-700'
          }
        >
          {p}
        </button>
      ))}
      {currentPage < totalPages && (
        <button onClick={() => goToPage(currentPage + 1)} className="text-gray-500 hover:text-blue-700">
          Next
        </button>
      )}
    </div>
  )
}

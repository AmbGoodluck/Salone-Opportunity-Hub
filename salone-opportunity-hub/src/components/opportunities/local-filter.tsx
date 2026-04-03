'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function LocalFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isActive = searchParams.get('local') === '1'

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (isActive) {
      params.delete('local')
    } else {
      params.set('local', '1')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
      }`}
    >
      <span>🇸🇱</span>
      Local SL
    </button>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/opportunities', label: 'Search', icon: Search },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg min-w-[60px] min-h-[44px] transition-colors',
                isActive
                  ? 'text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

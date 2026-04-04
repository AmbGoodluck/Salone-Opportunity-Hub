'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Search, Bookmark, User, LogOut, ChevronDown, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/layout/notification-bell'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/saved', label: 'Saved', authRequired: true },
  { href: '/cv-builder', label: 'CV Builder', authRequired: true },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Salone Opportunity Hub"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="hidden sm:block leading-tight">
              <span className="font-bold text-blue-800 text-sm block">SALONE</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide">OPPORTUNITY HUB</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              if (link.authRequired && !user) return null
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/opportunities"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Search className="h-5 w-5" />
            </Link>

            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-500 hidden sm:block" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/saved')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Opportunities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Org Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/opportunities">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold">Browse Opportunities</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-3 px-4 space-y-1">
          {NAV_LINKS.map((link) => {
            if (link.authRequired && !user) return null
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-2 rounded-lg text-sm font-medium',
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600'
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {!user && (
            <div className="pt-2 flex gap-2 border-t border-gray-100 mt-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link href="/opportunities" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800">Browse Opportunities</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

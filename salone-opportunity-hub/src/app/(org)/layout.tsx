import Link from 'next/link'
import Image from 'next/image'
import { requireOrganization } from '@/lib/organization'
import { OrgLogoutButton } from '@/components/dashboard/org-logout-button'

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireOrganization()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Salone Opportunity Hub"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-gray-900 hidden sm:block">Org Dashboard</span>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/post" className="text-sm text-gray-600 hover:text-gray-900">
                Post New
              </Link>
              <Link href="/dashboard/profile/edit" className="text-sm text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              {organization.slug && (
                <Link
                  href={`/org/${organization.slug}`}
                  className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                  target="_blank"
                >
                  Public Page ↗
                </Link>
              )}
              <span className="text-sm text-gray-400 hidden sm:inline">|</span>
              <span className="text-sm text-gray-500 hidden sm:block">{organization.name}</span>
              <OrgLogoutButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

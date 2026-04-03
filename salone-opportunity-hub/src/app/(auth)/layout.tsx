import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Auth - Salone Opportunity Hub',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
      <div className="flex items-center justify-center p-4 pt-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Salone Opportunity Hub"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-bold text-gray-900 text-lg">Salone Opportunity Hub</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
      <p className="text-center text-sm text-gray-500 p-4">
        Empowering Sierra Leone youth with opportunities
      </p>
    </div>
  )
}

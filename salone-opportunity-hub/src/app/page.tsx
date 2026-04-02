import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get quick stats
  const [{ count: scholarshipCount }, { count: jobCount }, { count: internshipCount }, { count: grantCount }] =
    await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'scholarship').eq('sl_eligible', true),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'job').eq('sl_eligible', true),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'internship').eq('sl_eligible', true),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'grant').eq('sl_eligible', true),
    ])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>🇸🇱</span>
              <span>Built for Sierra Leone Youth</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Your Gateway to <br className="hidden sm:block" />
              Opportunities
            </h1>

            <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover scholarships, jobs, internships, grants, and events — all in one place.
              Build your CV and track applications for free.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/opportunities">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8">
                  Browse Opportunities
                </Button>
              </Link>
              {!user && (
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4 mt-12 max-w-xl mx-auto">
              {[
                { label: 'Scholarships', count: scholarshipCount ?? 0, emoji: '🎓' },
                { label: 'Jobs', count: jobCount ?? 0, emoji: '💼' },
                { label: 'Internships', count: internshipCount ?? 0, emoji: '🚀' },
                { label: 'Grants', count: grantCount ?? 0, emoji: '💰' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold">{stat.count}</div>
                  <div className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                    <span className="mr-1">{stat.emoji}</span>{stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Everything you need to succeed
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '🔍',
                title: 'Discover Opportunities',
                desc: 'Filter by type, deadline, category, and more to find opportunities matching your goals.',
                href: '/opportunities',
              },
              {
                emoji: '🔖',
                title: 'Save & Track',
                desc: 'Bookmark opportunities, update application status, and add personal notes.',
                href: user ? '/saved' : '/signup',
              },
              {
                emoji: '📄',
                title: 'Build Your CV',
                desc: 'Create a professional CV using our templates and download as PDF or Word.',
                href: user ? '/cv-builder' : '/signup',
              },
              {
                emoji: '📱',
                title: 'Mobile Friendly',
                desc: 'Optimized for low-bandwidth mobile use — fast, lightweight, and accessible.',
                href: '/opportunities',
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow h-full">
                  <div className="text-3xl mb-3">{feature.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="bg-gray-900 py-12">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Ready to find your opportunity?</h2>
              <p className="text-gray-400 mb-6">
                Join thousands of Sierra Leonean youth accessing the best opportunities
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 px-8">
                  Get Started — It&apos;s Free
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

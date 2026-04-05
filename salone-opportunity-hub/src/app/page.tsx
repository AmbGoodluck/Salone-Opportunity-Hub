import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Button } from '@/components/ui/button'
import { Globe, Award, BookOpen } from 'lucide-react'

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
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-white overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-10" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left: Text content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Connecting{' '}
                  <span className="text-blue-700">Sierra Leone</span>{' '}
                  to Global Opportunities
                </h1>

                <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Discover scholarships, jobs, internships, grants, and events - all in one place.
                  Build your CV and track applications for free.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/opportunities">
                    <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 shadow-lg shadow-blue-700/25">
                      Browse Opportunities
                    </Button>
                  </Link>
                  {!user && (
                    <Link href="/signup">
                      <Button size="lg" variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50 px-8">
                        Create Free Account
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-3 mt-10 max-w-md mx-auto lg:mx-0">
                  {[
                    { label: 'Scholarships', count: scholarshipCount ?? 0, emoji: '🎓' },
                    { label: 'Jobs', count: jobCount ?? 0, emoji: '💼' },
                    { label: 'Internships', count: internshipCount ?? 0, emoji: '🚀' },
                    { label: 'Grants', count: grantCount ?? 0, emoji: '💰' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stat.count}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Logo */}
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Salone Opportunity Hub"
                  width={380}
                  height={380}
                  className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Everything you need to succeed
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Discover Opportunities',
                desc: 'Filter by type, deadline, category, and more to find scholarships, jobs, internships, and grants matching your goals.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                href: '/opportunities',
              },
              {
                icon: BookOpen,
                title: 'Save & Track',
                desc: 'Bookmark opportunities you love, update your application status, and add personal notes to stay organized.',
                color: 'text-blue-700',
                bg: 'bg-blue-50',
                href: user ? '/saved' : '/signup',
              },
              {
                icon: Award,
                title: 'Build Your CV / Resume',
                desc: 'Create a professional CV using our templates and download as PDF or Word - ready to submit with your applications.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                href: user ? '/cv-builder' : '/signup',
              },
            ].map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-center h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${card.bg} mb-4`}>
                    <card.icon className={`w-7 h-7 ${card.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Registered under the National Youth Commission of Sierra Leone
          </p>
        </section>

        {/* CTA */}
        {!user && (
          <section className="bg-blue-700 py-12">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Ready to find your opportunity?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of Sierra Leonean youth accessing the best opportunities
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8">
                  Get Started - It&apos;s Free
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

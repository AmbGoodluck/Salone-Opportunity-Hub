import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeadlineBadge } from '@/components/ui/deadline-badge'
import { ShareButtons } from '@/components/opportunities/share-buttons'
import { ChevronLeft, MapPin, Building2, GraduationCap, DollarSign, ExternalLink } from 'lucide-react'
import { TYPE_COLORS } from '@/lib/utils'
import { cn, formatDeadline } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { Opportunity } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: opp } = await supabase
    .from('opportunities')
    .select('title, description, organization')
    .eq('slug', slug)
    .single()

  if (!opp) return { title: 'Opportunity Not Found' }

  return {
    title: `${opp.title} | Salone Opportunity Hub`,
    description: opp.description.slice(0, 155),
    openGraph: {
      title: opp.title,
      description: opp.description.slice(0, 155),
      type: 'article',
    },
  }
}

export default async function OpportunityBySlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch opportunity by slug - no login required
  const { data: opp } = await supabase
    .from('opportunities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!opp) notFound()

  const opportunity = opp as Opportunity
  const deadlineInfo = formatDeadline(opportunity.deadline)

  // Parse required_skills for display
  const skills = Array.isArray(opportunity.required_skills)
    ? (opportunity.required_skills as string[])
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/opportunities" className="hover:text-gray-900 flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Opportunities
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{opportunity.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn('capitalize text-sm', TYPE_COLORS[opportunity.type])}>
                    {opportunity.type}
                  </Badge>
                  <DeadlineBadge deadline={opportunity.deadline} />
                  {opportunity.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                  {opportunity.title}
                </h1>
                <p className="text-lg text-gray-600 font-medium">{opportunity.organization}</p>
              </div>

              {/* Description */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this opportunity</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {opportunity.description}
                </div>
              </section>

              {/* Required Skills */}
              {skills.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-gray-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {opportunity.requirements && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.requirements}
                  </div>
                </section>
              )}

              {/* How to Apply */}
              {opportunity.how_to_apply && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Apply</h2>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.how_to_apply}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
                {/* Apply button */}
                <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-blue-700 hover:bg-blue-800 gap-2 text-base h-11">
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {opportunity.deadline && (
                    <InfoRow icon={<span className="text-base">📅</span>} label="Deadline">
                      <span className={deadlineInfo.urgency === 'urgent' ? 'text-red-600 font-medium' : ''}>
                        {format(parseISO(opportunity.deadline), 'MMMM d, yyyy')}
                      </span>
                    </InfoRow>
                  )}

                  {opportunity.location && (
                    <InfoRow icon={<MapPin className="h-4 w-4 text-gray-400" />} label="Location">
                      {opportunity.is_remote ? 'Remote / Online' : opportunity.location}
                    </InfoRow>
                  )}

                  {opportunity.funding_amount && (
                    <InfoRow icon={<DollarSign className="h-4 w-4 text-gray-400" />} label="Funding">
                      {opportunity.funding_amount}
                    </InfoRow>
                  )}

                  {opportunity.education_level && (
                    <InfoRow icon={<GraduationCap className="h-4 w-4 text-gray-400" />} label="Education Level">
                      {opportunity.education_level}
                    </InfoRow>
                  )}

                  {opportunity.experience_level && (
                    <InfoRow icon={<span className="text-base">⭐</span>} label="Experience">
                      {opportunity.experience_level}
                    </InfoRow>
                  )}

                  <InfoRow icon={<Building2 className="h-4 w-4 text-gray-400" />} label="Organization">
                    {opportunity.organization}
                  </InfoRow>

                  {opportunity.category && (
                    <InfoRow icon={<span className="text-base">🏷️</span>} label="Category">
                      {opportunity.category}
                    </InfoRow>
                  )}
                </div>

                {/* Share */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Share this opportunity</p>
                  <ShareButtons title={opportunity.title} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{children}</p>
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeadlineBadge } from '@/components/ui/deadline-badge'
import { SaveButton } from '@/components/opportunities/save-button'
import { ShareButtons } from '@/components/opportunities/share-buttons'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { ChevronLeft, MapPin, Building2, GraduationCap, DollarSign, ExternalLink, Globe, FileText, CheckCircle, Send, Calendar, Briefcase } from 'lucide-react'
import { TYPE_COLORS, OPPORTUNITY_TYPES } from '@/lib/utils'
import { cn, formatDeadline } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { Opportunity } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: opp } = await supabase.from('opportunities').select('title, description, organization').eq('id', id).single()

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

export default async function OpportunityDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: opp }, { data: { user } }] = await Promise.all([
    supabase.from('opportunities').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!opp) notFound()

  const opportunity = opp as Opportunity

  // Check if user saved this
  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', id)
      .single()
    isSaved = !!saved
  }

  // Related opportunities (same category, exclude current)
  const { data: related } = await supabase
    .from('opportunities')
    .select('*')
    .eq('category', opportunity.category)
    .neq('id', id)
    .limit(4)
    .order('created_at', { ascending: false })

  const deadlineInfo = formatDeadline(opportunity.deadline)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/opportunities" className="hover:text-gray-900 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Opportunities
        </Link>
        <span>/</span>
        <span className="capitalize">{opportunity.type}s</span>
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
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                <FileText className="h-4 w-4 text-blue-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">About This Opportunity</h2>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap pl-[42px]">
              {opportunity.description}
            </div>
          </section>

          {/* Key Details Summary */}
          {(opportunity.deadline || opportunity.location || opportunity.funding_amount || opportunity.study_level) && (
            <section className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                  <Briefcase className="h-4 w-4 text-blue-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Key Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-[42px]">
                {opportunity.deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Deadline</p>
                      <p className={cn('text-sm font-medium mt-0.5', deadlineInfo.urgency === 'urgent' ? 'text-red-600' : 'text-gray-800')}>
                        {format(parseISO(opportunity.deadline), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {opportunity.is_remote ? 'Remote / Online' : opportunity.location}
                      </p>
                    </div>
                  </div>
                )}
                {opportunity.funding_amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Funding</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{opportunity.funding_amount}</p>
                    </div>
                  </div>
                )}
                {opportunity.study_level && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Study Level</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{opportunity.study_level}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Requirements */}
          {opportunity.requirements && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap pl-[42px]">
                {opportunity.requirements}
              </div>
            </section>
          )}

          {/* How to Apply */}
          {opportunity.how_to_apply && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                  <Send className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">How to Apply</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap pl-[42px]">
                {opportunity.how_to_apply}
              </div>
            </section>
          )}

          {/* Mobile CTA */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3">
            <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full bg-blue-700 hover:bg-blue-800 gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <SaveButton
              opportunityId={opportunity.id}
              isSaved={isSaved}
              isLoggedIn={!!user}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Key info card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
            {/* Apply button (desktop) */}
            <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-blue-700 hover:bg-blue-800 gap-2 text-base h-11">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>

            <SaveButton
              opportunityId={opportunity.id}
              isSaved={isSaved}
              isLoggedIn={!!user}
              variant="outline"
              className="w-full"
            />

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

              {opportunity.study_level && (
                <InfoRow icon={<GraduationCap className="h-4 w-4 text-gray-400" />} label="Study Level">
                  {opportunity.study_level}
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

      {/* Related opportunities */}
      {related && related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            More in {opportunity.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(related as Opportunity[]).map((rel) => (
              <OpportunityCard key={rel.id} opportunity={rel} isLoggedIn={!!user} />
            ))}
          </div>
        </section>
      )}
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

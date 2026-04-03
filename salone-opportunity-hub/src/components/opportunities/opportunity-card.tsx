'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Bookmark, BookmarkCheck, Briefcase, Zap, GraduationCap, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { cn, truncateText, TYPE_COLORS, formatDeadline } from '@/lib/utils'
import type { Opportunity } from '@/types'
import type { MatchData } from '@/lib/match'
import { toast } from 'sonner'

interface OpportunityCardProps {
  opportunity: Opportunity
  isSaved?: boolean
  onSaveToggle?: (id: string, saved: boolean) => void
  isLoggedIn?: boolean
  matchData?: MatchData
}

const TYPE_ICONS: Record<string, typeof Briefcase> = {
  job: Briefcase,
  internship: Zap,
  scholarship: GraduationCap,
  event: Calendar,
  grant: Calendar,
}

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  job: 'Job',
  internship: 'Internship',
  scholarship: 'Scholarship',
  event: 'Event',
  grant: 'Grant',
}

const LOCATION_SCOPE: Record<string, string> = {
  'Sierra Leone': 'Local',
  'West Africa': 'Regional',
  'Africa': 'Africa-wide',
  'Remote': 'Remote',
  'Worldwide': 'Global',
  'United Kingdom': 'Global',
  'United States': 'Global',
  'Europe': 'Global',
}

export function OpportunityCard({
  opportunity,
  isSaved = false,
  onSaveToggle,
  isLoggedIn = false,
  matchData,
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [isToggling, setIsToggling] = useState(false)

  const TypeIcon = TYPE_ICONS[opportunity.type] || Briefcase
  const displayName = TYPE_DISPLAY_NAMES[opportunity.type]
  const deadline = formatDeadline(opportunity.deadline)
  const locationScope = LOCATION_SCOPE[opportunity.location || ''] || 'Global'

  async function handleSaveToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      toast.error('Please sign in to save opportunities')
      return
    }

    setIsToggling(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to save opportunities')
      setIsToggling(false)
      return
    }

    if (saved) {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)

      if (!error) {
        setSaved(false)
        onSaveToggle?.(opportunity.id, false)
        toast.success('Removed from saved')
      }
    } else {
      const { error } = await supabase
        .from('saved_opportunities')
        .insert({ user_id: user.id, opportunity_id: opportunity.id })

      if (!error) {
        setSaved(true)
        onSaveToggle?.(opportunity.id, true)
        toast.success('Saved!')
      }
    }

    setIsToggling(false)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 h-full flex flex-col overflow-hidden">
      <CardContent className="p-6 flex flex-col gap-4 h-full">
        {/* Header: Type icon/badge + Deadline */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg w-fit',
              TYPE_COLORS[opportunity.type]
            )}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="capitalize text-xs font-semibold bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
            >
              {displayName}
            </Badge>
          </div>
          {/* Deadline badge */}
          {opportunity.deadline ? (
            <div className={cn(
              'text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1',
              deadline.urgency === 'urgent'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}>
              <Calendar className="h-3 w-3" />
              {deadline.label}
            </div>
          ) : (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Open
            </div>
          )}
        </div>

        {/* SL Eligible tag + Match Score */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
            🇸🇱 Sierra Leoneans Can Apply
          </span>
          {matchData && (
            <span className={cn(
              'inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-0.5 border',
              matchData.match_score !== null && matchData.match_score >= 75
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : matchData.match_score !== null && matchData.match_score >= 55
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : matchData.match_score !== null && matchData.match_score >= 35
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : matchData.match_score !== null
                ? 'bg-gray-50 text-gray-600 border-gray-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            )}>
              {matchData.display_text}
            </span>
          )}
        </div>

        {/* Title - larger and more prominent */}
        <div className="flex-1">
          <Link href={`/opportunities/${opportunity.id}`}>
            <h3 className="font-bold text-lg leading-tight line-clamp-3 text-gray-900 group-hover:text-emerald-700 transition-colors mb-2">
              {opportunity.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 font-medium mb-1">{opportunity.organization}</p>
        </div>

        {/* Location with scope */}
        {opportunity.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">{opportunity.is_remote ? 'Remote' : opportunity.location}</span>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
              {locationScope}
            </Badge>
          </div>
        )}

        {/* Description - more prominent */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {opportunity.description}
        </p>

        {/* CTA Area */}
        <div className="flex gap-2 pt-2 mt-auto">
          <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 rounded-lg transition-colors"
            >
              View &amp; Apply
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-10 w-10 p-0 flex-shrink-0 rounded-lg',
              saved
                ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
            onClick={handleSaveToggle}
            disabled={isToggling}
            aria-label={saved ? 'Remove bookmark' : 'Save opportunity'}
            title={saved ? 'Saved' : 'Save'}
          >
            {saved ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

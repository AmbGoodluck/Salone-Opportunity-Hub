'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, DollarSign, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeadlineBadge } from '@/components/ui/deadline-badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { cn, truncateText, TYPE_COLORS } from '@/lib/utils'
import type { Opportunity } from '@/types'
import { toast } from 'sonner'

interface OpportunityCardProps {
  opportunity: Opportunity
  isSaved?: boolean
  onSaveToggle?: (id: string, saved: boolean) => void
  isLoggedIn?: boolean
}

export function OpportunityCard({
  opportunity,
  isSaved = false,
  onSaveToggle,
  isLoggedIn = false,
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [isToggling, setIsToggling] = useState(false)

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
    <Card className="group hover:shadow-md transition-shadow border-gray-200 h-full flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        {/* Top row: type badge + deadline */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={cn('capitalize text-xs font-medium', TYPE_COLORS[opportunity.type])}
          >
            {opportunity.type}
          </Badge>
          <DeadlineBadge deadline={opportunity.deadline} />
        </div>

        {/* Title & org */}
        <div className="flex-1">
          <Link href={`/opportunities/${opportunity.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mb-1">
              {opportunity.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 font-medium">{opportunity.organization}</p>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
          {truncateText(opportunity.description, 180)}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {opportunity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {opportunity.is_remote ? 'Remote' : opportunity.location}
            </span>
          )}
          {opportunity.funding_amount && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {opportunity.funding_amount}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              View Details
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0 flex-shrink-0',
              saved ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'
            )}
            onClick={handleSaveToggle}
            disabled={isToggling}
            aria-label={saved ? 'Remove bookmark' : 'Save opportunity'}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

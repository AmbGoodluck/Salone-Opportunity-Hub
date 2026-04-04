'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, ExternalLink, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { DeadlineBadge } from '@/components/ui/deadline-badge'
import { createClient } from '@/lib/supabase/client'
import { TYPE_COLORS, STATUS_LABELS, cn, formatDeadline } from '@/lib/utils'
import { toast } from 'sonner'
import type { Opportunity, SavedStatus } from '@/types'

interface SavedWithOpportunity {
  id: string
  opportunity_id: string
  notes: string | null
  status: SavedStatus
  created_at: string
  opportunities: Opportunity
}

export function SavedOpportunitiesClient({ initialSaved }: { initialSaved: SavedWithOpportunity[] }) {
  const [items, setItems] = useState(initialSaved)
  const [activeTab, setActiveTab] = useState<string>('all')

  const filtered = activeTab === 'all'
    ? items
    : items.filter((item) => item.status === activeTab)

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🔖"
        title="No saved opportunities yet"
        description="Browse opportunities and click the bookmark icon to save them here."
        actionLabel="Browse Opportunities"
        actionHref="/opportunities"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">
            All <span className="ml-1 text-xs bg-gray-200 rounded-full px-1.5">{items.length}</span>
          </TabsTrigger>
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = items.filter((i) => i.status === status).length
            if (count === 0) return null
            return (
              <TabsTrigger key={status} value={status}>
                {label}
                <span className="ml-1 text-xs bg-gray-200 rounded-full px-1.5">{count}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={`No ${STATUS_LABELS[activeTab as SavedStatus] ?? ''} opportunities`}
          description="Switch to a different tab to see other saved opportunities."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <SavedItem
              key={item.id}
              item={item}
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
              onUpdate={(id, updates) =>
                setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SavedItem({
  item,
  onDelete,
  onUpdate,
}: {
  item: SavedWithOpportunity
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<SavedWithOpportunity>) => void
}) {
  const [notes, setNotes] = useState(item.notes ?? '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const opp = item.opportunities
  const { label: deadlineLabel, urgency } = formatDeadline(opp.deadline)

  async function updateStatus(status: SavedStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('saved_opportunities')
      .update({ status })
      .eq('id', item.id)

    if (!error) {
      onUpdate(item.id, { status })
      toast.success('Status updated')
    }
  }

  async function saveNotes() {
    setIsSavingNotes(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('saved_opportunities')
      .update({ notes })
      .eq('id', item.id)

    if (!error) {
      onUpdate(item.id, { notes })
      toast.success('Notes saved')
    }
    setIsSavingNotes(false)
  }

  async function deleteItem() {
    const supabase = createClient()
    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('id', item.id)

    if (!error) {
      onDelete(item.id)
      toast.success('Removed from saved')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('capitalize text-xs', TYPE_COLORS[opp.type])}>
              {opp.type}
            </Badge>
            <DeadlineBadge deadline={opp.deadline} />
          </div>
          <Link href={`/opportunities/${opp.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-800 transition-colors line-clamp-2">
              {opp.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{opp.organization}</p>
          {opp.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {opp.location}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={opp.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-blue-700 transition-colors"
            aria-label="Open application"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={deleteItem}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove from saved"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status dropdown */}
        <div className="flex-shrink-0">
          <Select value={item.status} onValueChange={(val) => val && updateStatus(val as SavedStatus)}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="flex-1 flex gap-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this opportunity…"
            className="text-xs min-h-[36px] h-8 resize-none py-1.5"
            rows={1}
          />
          {notes !== (item.notes ?? '') && (
            <Button
              size="sm"
              onClick={saveNotes}
              disabled={isSavingNotes}
              className="h-8 px-3 text-xs bg-blue-700 hover:bg-blue-800 flex-shrink-0"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

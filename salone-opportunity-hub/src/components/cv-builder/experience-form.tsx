'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { ExperienceEntry } from '@/types'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface ExperienceFormProps {
  data: ExperienceEntry[]
  onChange: (data: ExperienceEntry[]) => void
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  function addEntry() {
    onChange([
      ...data,
      {
        id: generateId(),
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: null,
        is_current: false,
        description: '',
      },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500">Add jobs, internships, and volunteer work</p>
        </div>
        <Button size="sm" onClick={addEntry} variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          No experience entries yet.{' '}
          <button onClick={addEntry} className="text-emerald-600 underline">Add one</button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((entry) => (
            <ExperienceCard
              key={entry.id}
              entry={entry}
              onUpdate={(updates) =>
                onChange(data.map((e) => (e.id === entry.id ? { ...e, ...updates } : e)))
              }
              onRemove={() => onChange(data.filter((e) => e.id !== entry.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ExperienceCard({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: ExperienceEntry
  onUpdate: (u: Partial<ExperienceEntry>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {entry.title || 'New Experience'}
          </p>
          {entry.company && (
            <p className="text-xs text-gray-500 truncate">{entry.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Job Title *</Label>
            <Input
              value={entry.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Software Developer"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Company / Organization *</Label>
            <Input
              value={entry.company}
              onChange={(e) => onUpdate({ company: e.target.value })}
              placeholder="Tech Sierra Leone"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={entry.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="Freetown, SL or Remote"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input
              type="month"
              value={entry.start_date}
              onChange={(e) => onUpdate({ start_date: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>End Date</Label>
            <Input
              type="month"
              value={entry.end_date ?? ''}
              onChange={(e) => onUpdate({ end_date: e.target.value })}
              disabled={entry.is_current}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id={`current-exp-${entry.id}`}
                checked={entry.is_current}
                onCheckedChange={(checked) => onUpdate({ is_current: !!checked, end_date: checked ? null : '' })}
              />
              <Label htmlFor={`current-exp-${entry.id}`} className="text-xs font-normal text-gray-500 cursor-pointer">
                I currently work here
              </Label>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description *</Label>
            <Textarea
              value={entry.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for readability&#10;• Start with action verbs (Built, Led, Managed…)"
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

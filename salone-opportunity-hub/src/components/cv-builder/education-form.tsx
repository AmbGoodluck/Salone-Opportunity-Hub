'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { EducationEntry } from '@/types'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface EducationFormProps {
  data: EducationEntry[]
  onChange: (data: EducationEntry[]) => void
}

const EMPTY_ENTRY: Omit<EducationEntry, 'id'> = {
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  function addEntry() {
    onChange([...data, { id: generateId(), ...EMPTY_ENTRY }])
  }

  function removeEntry(id: string) {
    onChange(data.filter((e) => e.id !== id))
  }

  function updateEntry(id: string, updates: Partial<EducationEntry>) {
    onChange(data.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <p className="text-sm text-gray-500">Add your educational background</p>
        </div>
        <Button size="sm" onClick={addEntry} variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          No education entries yet.{' '}
          <button type="button" onClick={addEntry} className="text-emerald-600 underline">Add one</button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((entry) => (
            <EducationEntryCard
              key={entry.id}
              entry={entry}
              onUpdate={(updates) => updateEntry(entry.id, updates)}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EducationEntryCard({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: EducationEntry
  onUpdate: (updates: Partial<EducationEntry>) => void
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
            {entry.institution || 'New Education Entry'}
          </p>
          {entry.degree && (
            <p className="text-xs text-gray-500 truncate">{entry.degree} - {entry.field}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Institution *</Label>
            <Input
              value={entry.institution}
              onChange={(e) => onUpdate({ institution: e.target.value })}
              placeholder="Fourah Bay College"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Degree *</Label>
            <Input
              value={entry.degree}
              onChange={(e) => onUpdate({ degree: e.target.value })}
              placeholder="Bachelor of Science"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Field of Study *</Label>
            <Input
              value={entry.field}
              onChange={(e) => onUpdate({ field: e.target.value })}
              placeholder="Computer Science"
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

          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input
              type="month"
              value={entry.end_date ?? ''}
              onChange={(e) => onUpdate({ end_date: e.target.value })}
              disabled={entry.is_current}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id={`current-${entry.id}`}
                checked={entry.is_current}
                onCheckedChange={(checked) => onUpdate({ is_current: !!checked, end_date: checked ? null : entry.end_date })}
              />
              <Label htmlFor={`current-${entry.id}`} className="text-xs font-normal text-gray-500 cursor-pointer">
                Currently studying here
              </Label>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={entry.description ?? ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Relevant coursework, achievements, GPA…"
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Python', 'Java', 'SQL',
  'Microsoft Office', 'Communication', 'Leadership', 'Project Management',
  'Data Analysis', 'Marketing', 'Accounting', 'Research', 'Teaching',
  'Customer Service', 'Photography', 'Video Editing', 'Graphic Design',
  'Public Speaking', 'French', 'Arabic', 'Teamwork',
]

interface SkillsInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
}

export function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [input, setInput] = useState('')

  const suggestions = SKILL_SUGGESTIONS.filter(
    (s) =>
      input.length > 0 &&
      s.toLowerCase().includes(input.toLowerCase()) &&
      !skills.includes(s)
  )

  function addSkill(skill: string) {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setInput('')
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
        <p className="text-sm text-gray-500">Add your technical and soft skills</p>
      </div>

      <div className="space-y-1.5">
        <Label>Add a skill</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter…"
        />
        <p className="text-xs text-gray-400">Press Enter or comma to add. Backspace to remove last.</p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full border border-gray-200 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skill tags */}
      {skills.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">{skills.length} skill{skills.length !== 1 ? 's' : ''} added:</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full border border-emerald-200"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-emerald-900 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-sm text-gray-400 italic">No skills added yet</p>
      )}
    </div>
  )
}

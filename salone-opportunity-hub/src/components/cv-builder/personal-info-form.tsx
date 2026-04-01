'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PersonalInfo } from '@/types'

interface PersonalInfoFormProps {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  function update(field: keyof PersonalInfo, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h2>
        <p className="text-sm text-gray-500">This will appear at the top of your CV</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full name *</Label>
          <Input
            value={data.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            placeholder="Aminata Kamara"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="aminata@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+232 76 000 000"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Freetown, Sierra Leone"
          />
        </div>

        <div className="space-y-1.5">
          <Label>LinkedIn URL</Label>
          <Input
            value={data.linkedin ?? ''}
            onChange={(e) => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/aminata"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Website / Portfolio</Label>
          <Input
            value={data.website ?? ''}
            onChange={(e) => update('website', e.target.value)}
            placeholder="aminata.dev"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Professional Summary</Label>
        <Textarea
          value={data.summary ?? ''}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="A brief 2-3 sentence summary of your professional background and goals…"
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-gray-400">{(data.summary?.length ?? 0)}/500 characters</p>
      </div>
    </div>
  )
}

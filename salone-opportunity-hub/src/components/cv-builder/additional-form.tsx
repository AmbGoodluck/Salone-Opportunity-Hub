'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { LanguageEntry, CertificationEntry } from '@/types'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional' },
  { value: 'native', label: 'Native / Bilingual' },
]

interface AdditionalFormProps {
  languages: LanguageEntry[]
  certifications: CertificationEntry[]
  onLanguagesChange: (data: LanguageEntry[]) => void
  onCertificationsChange: (data: CertificationEntry[]) => void
}

export function AdditionalForm({
  languages,
  certifications,
  onLanguagesChange,
  onCertificationsChange,
}: AdditionalFormProps) {
  return (
    <div className="space-y-8">
      {/* Languages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
            <p className="text-sm text-gray-500">Languages you speak</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onLanguagesChange([
                ...languages,
                { id: generateId(), language: '', proficiency: 'conversational' },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {languages.map((lang) => (
          <div key={lang.id} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Language</Label>
              <Input
                value={lang.language}
                onChange={(e) =>
                  onLanguagesChange(
                    languages.map((l) => (l.id === lang.id ? { ...l, language: e.target.value } : l))
                  )
                }
                placeholder="English, Krio, Mende…"
              />
            </div>
            <div className="w-48 space-y-1.5">
              <Label>Proficiency</Label>
              <Select
                value={lang.proficiency}
                onValueChange={(val) =>
                  onLanguagesChange(
                    languages.map((l) =>
                      l.id === lang.id ? { ...l, proficiency: val as LanguageEntry['proficiency'] } : l
                    )
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={() => onLanguagesChange(languages.filter((l) => l.id !== lang.id))}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors mb-0.5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
            <p className="text-sm text-gray-500">Professional certificates and awards</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onCertificationsChange([
                ...certifications,
                { id: generateId(), name: '', issuer: '', date: '', credential_url: '' },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {certifications.map((cert) => (
          <div key={cert.id} className="border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Certificate Name *</Label>
              <Input
                value={cert.name}
                onChange={(e) =>
                  onCertificationsChange(
                    certifications.map((c) => (c.id === cert.id ? { ...c, name: e.target.value } : c))
                  )
                }
                placeholder="AWS Certified Solutions Architect"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Issuing Organization *</Label>
              <Input
                value={cert.issuer}
                onChange={(e) =>
                  onCertificationsChange(
                    certifications.map((c) => (c.id === cert.id ? { ...c, issuer: e.target.value } : c))
                  )
                }
                placeholder="Amazon Web Services"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="month"
                value={cert.date}
                onChange={(e) =>
                  onCertificationsChange(
                    certifications.map((c) => (c.id === cert.id ? { ...c, date: e.target.value } : c))
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Credential URL</Label>
              <Input
                value={cert.credential_url ?? ''}
                onChange={(e) =>
                  onCertificationsChange(
                    certifications.map((c) =>
                      c.id === cert.id ? { ...c, credential_url: e.target.value } : c
                    )
                  )
                }
                placeholder="https://credly.com/badges/…"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={() => onCertificationsChange(certifications.filter((c) => c.id !== cert.id))}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

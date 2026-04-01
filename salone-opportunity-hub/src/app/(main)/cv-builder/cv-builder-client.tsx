'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { TemplateSelectorSection } from '@/components/cv-builder/template-selector'
import { PersonalInfoForm } from '@/components/cv-builder/personal-info-form'
import { EducationForm } from '@/components/cv-builder/education-form'
import { ExperienceForm } from '@/components/cv-builder/experience-form'
import { SkillsInput } from '@/components/cv-builder/skills-input'
import { AdditionalForm } from '@/components/cv-builder/additional-form'
import { CVPreview } from '@/components/cv-builder/cv-preview'
import dynamic from 'next/dynamic'
const DownloadButtons = dynamic(
  () => import('@/components/cv-builder/download-buttons').then((m) => m.DownloadButtons),
  { ssr: false, loading: () => <div className="h-10 animate-pulse bg-gray-100 rounded-lg" /> }
)
import type { CVData } from '@/types'

const STEPS = [
  { id: 'template', label: 'Template' },
  { id: 'personal', label: 'Personal' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'additional', label: 'More' },
  { id: 'preview', label: 'Preview' },
]

interface CVBuilderClientProps {
  userId: string
  cvId: string | null
  initialData: CVData
}

export function CVBuilderClient({ userId, cvId, initialData }: CVBuilderClientProps) {
  const [activeStep, setActiveStep] = useState('template')
  const [cvData, setCvData] = useState<CVData>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [savedCvId, setSavedCvId] = useState<string | null>(cvId)

  const debouncedData = useDebounce(cvData, 2000)

  const updateCvData = useCallback((updates: Partial<CVData>) => {
    setCvData((prev) => ({ ...prev, ...updates }))
  }, [])

  // Auto-save on debounced change
  useEffect(() => {
    if (debouncedData === initialData) return
    autoSave(debouncedData)
  }, [debouncedData]) // eslint-disable-line react-hooks/exhaustive-deps

  async function autoSave(data: CVData) {
    const supabase = createClient()

    // Cast rich CV types to Json for Supabase storage
    const payload = {
      user_id: userId,
      template_id: data.template_id,
      personal_info: data.personal_info as unknown as import('@/types/supabase').Json,
      education: data.education as unknown as import('@/types/supabase').Json[],
      experience: data.experience as unknown as import('@/types/supabase').Json[],
      skills: data.skills,
      languages: data.languages as unknown as import('@/types/supabase').Json[],
      certifications: data.certifications as unknown as import('@/types/supabase').Json[],
      updated_at: new Date().toISOString(),
    }

    if (savedCvId) {
      const { error } = await supabase.from('cvs').update(payload).eq('id', savedCvId)
      if (!error) {
        toast.success('Auto-saved', { duration: 1500 })
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('cvs')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single()

      if (!error && inserted) {
        setSavedCvId(inserted.id)
        toast.success('CV saved', { duration: 1500 })
      }
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep)

  function goNext() {
    if (currentStepIndex < STEPS.length - 1) {
      setActiveStep(STEPS[currentStepIndex + 1].id)
    }
  }

  function goPrev() {
    if (currentStepIndex > 0) {
      setActiveStep(STEPS[currentStepIndex - 1].id)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Left: form */}
      <div className="xl:col-span-3">
        {/* Step tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                step.id === activeStep
                  ? 'bg-emerald-600 text-white'
                  : idx < currentStepIndex
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {idx < currentStepIndex ? '✓ ' : ''}{step.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeStep === 'template' && (
            <TemplateSelectorSection
              selected={cvData.template_id}
              onSelect={(id) => updateCvData({ template_id: id })}
            />
          )}
          {activeStep === 'personal' && (
            <PersonalInfoForm
              data={cvData.personal_info}
              onChange={(personal_info) => updateCvData({ personal_info })}
            />
          )}
          {activeStep === 'education' && (
            <EducationForm
              data={cvData.education}
              onChange={(education) => updateCvData({ education })}
            />
          )}
          {activeStep === 'experience' && (
            <ExperienceForm
              data={cvData.experience}
              onChange={(experience) => updateCvData({ experience })}
            />
          )}
          {activeStep === 'skills' && (
            <SkillsInput
              skills={cvData.skills}
              onChange={(skills) => updateCvData({ skills })}
            />
          )}
          {activeStep === 'additional' && (
            <AdditionalForm
              languages={cvData.languages}
              certifications={cvData.certifications}
              onLanguagesChange={(languages) => updateCvData({ languages })}
              onCertificationsChange={(certifications) => updateCvData({ certifications })}
            />
          )}
          {activeStep === 'preview' && (
            <div className="space-y-4">
              <CVPreview data={cvData} />
              <DownloadButtons data={cvData} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            {activeStep !== 'preview' ? (
              <Button
                onClick={goNext}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Next
              </Button>
            ) : (
              <DownloadButtons data={cvData} compact />
            )}
          </div>
        </div>
      </div>

      {/* Right: preview */}
      <div className="xl:col-span-2 hidden xl:block">
        <div className="sticky top-24">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Live Preview</p>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="transform scale-75 origin-top-left w-[133%]">
              <CVPreview data={cvData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

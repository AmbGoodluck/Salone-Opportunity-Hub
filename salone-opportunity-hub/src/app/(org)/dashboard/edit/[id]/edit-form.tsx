'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Opportunity } from '@/types'

const opportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['job', 'internship', 'scholarship', 'event', 'grant']),
  location: z.string().optional(),
  location_type: z.enum(['remote', 'onsite', 'hybrid']),
  deadline: z.string().optional(),
  application_link: z.string().url('Please enter a valid URL'),
  required_skills: z.string().optional(),
  education_level: z.string().optional(),
  experience_level: z.string().optional(),
  requirements: z.string().optional(),
  how_to_apply: z.string().optional(),
  funding_amount: z.string().optional(),
  study_level: z.string().optional(),
})

type OpportunityForm = z.infer<typeof opportunitySchema>

const CATEGORIES = [
  'Technology', 'Business', 'Arts & Culture', 'Science', 'Engineering',
  'Medicine & Health', 'Law', 'Education', 'Agriculture', 'Finance',
  'Media & Communications', 'Social Work', 'Environment', 'Sports',
  'Government & Public Service', 'Other',
]

export function EditOpportunityForm({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Parse existing required_skills back to comma-separated string
  const existingSkills = Array.isArray(opportunity.required_skills)
    ? (opportunity.required_skills as string[]).join(', ')
    : ''

  // Format deadline for datetime-local input
  const formattedDeadline = opportunity.deadline
    ? new Date(opportunity.deadline).toISOString().slice(0, 16)
    : ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityForm>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: opportunity.title,
      description: opportunity.description,
      category: opportunity.category,
      type: opportunity.type,
      location: opportunity.location ?? '',
      location_type: opportunity.location_type ?? 'onsite',
      deadline: formattedDeadline,
      application_link: opportunity.application_link,
      required_skills: existingSkills,
      education_level: opportunity.education_level ?? '',
      experience_level: opportunity.experience_level ?? '',
      requirements: opportunity.requirements ?? '',
      how_to_apply: opportunity.how_to_apply ?? '',
      funding_amount: opportunity.funding_amount ?? '',
      study_level: opportunity.study_level ?? '',
    },
  })

  async function onSubmit(data: OpportunityForm) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setIsLoading(false)
      return
    }

    const skillsArray = data.required_skills
      ? data.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        location: data.location || null,
        location_type: data.location_type,
        deadline: data.deadline || null,
        application_link: data.application_link,
        required_skills: skillsArray,
        education_level: data.education_level || null,
        experience_level: data.experience_level || null,
        requirements: data.requirements || null,
        how_to_apply: data.how_to_apply || null,
        funding_amount: data.funding_amount || null,
        study_level: data.study_level || null,
        is_remote: data.location_type === 'remote',
        updated_at: new Date().toISOString(),
      })
      .eq('id', opportunity.id)
      .eq('organization_id', user.id) // Ensure ownership

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Opportunity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} className={errors.title ? 'border-red-400' : ''} />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select id="type" {...register('type')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="event">Event</option>
                <option value="grant">Grant</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select id="category" {...register('category')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              rows={5}
              {...register('description')}
              className={`w-full rounded-md border px-3 py-2 text-sm ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type</Label>
              <select id="location_type" {...register('location_type')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="datetime-local" {...register('deadline')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_link">Application Link *</Label>
              <Input id="application_link" type="url" {...register('application_link')} className={errors.application_link ? 'border-red-400' : ''} />
              {errors.application_link && <p className="text-red-500 text-xs">{errors.application_link.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="required_skills">Required Skills (comma-separated)</Label>
            <Input id="required_skills" {...register('required_skills')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="education_level">Education Level</Label>
              <select id="education_level" {...register('education_level')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Any</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <select id="experience_level" {...register('experience_level')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Any</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <textarea
              id="requirements"
              rows={3}
              {...register('requirements')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="how_to_apply">How to Apply</Label>
            <textarea
              id="how_to_apply"
              rows={3}
              {...register('how_to_apply')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funding_amount">Funding Amount</Label>
              <Input id="funding_amount" {...register('funding_amount')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="study_level">Study Level</Label>
              <select id="study_level" {...register('study_level')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">N/A</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

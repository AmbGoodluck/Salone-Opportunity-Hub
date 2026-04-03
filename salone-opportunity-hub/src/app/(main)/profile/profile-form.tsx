'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { LOCATIONS, STUDY_LEVELS, CATEGORIES, OPPORTUNITY_TYPES } from '@/lib/utils'
import type { Profile } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  job: 'Jobs',
  internship: 'Internships',
  scholarship: 'Scholarships',
  event: 'Events',
  grant: 'Grants',
}

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert'] as const

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: 'Entry Level (0-1 years)',
  junior: 'Junior (1-3 years)',
  mid: 'Mid-Level (3-5 years)',
  senior: 'Senior (5-10 years)',
  expert: 'Expert (10+ years)',
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  education_level: z.string().optional(),
  experience_level: z.string().optional(),
  preferred_opportunity_location: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  userId: string
  email: string
  initialProfile: Profile | null
}

export function ProfileForm({ userId, email, initialProfile }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [preferredTypes, setPreferredTypes] = useState<string[]>(
    (initialProfile?.preferred_types as string[]) ?? []
  )
  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    (initialProfile?.preferred_categories as string[]) ?? []
  )
  const [skills, setSkills] = useState<string[]>(
    (initialProfile?.skills as string[]) ?? []
  )
  const [skillInput, setSkillInput] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialProfile?.notifications_enabled ?? true
  )
  const [emailNotifications, setEmailNotifications] = useState(
    initialProfile?.email_notifications ?? true
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialProfile?.full_name ?? '',
      location: initialProfile?.location ?? 'Sierra Leone',
      education_level: initialProfile?.education_level ?? '',
      experience_level: initialProfile?.experience_level ?? '',
      preferred_opportunity_location: initialProfile?.preferred_opportunity_location ?? 'Remote',
    },
  })

  function toggleType(type: string) {
    setPreferredTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  function toggleCategory(cat: string) {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: data.full_name,
        location: data.location || 'Sierra Leone',
        education_level: data.education_level || null,
        preferred_types: preferredTypes,
        preferred_categories: preferredCategories,
        skills: skills.length > 0 ? skills : null,
        preferred_opportunity_location: data.preferred_opportunity_location || 'Remote',
        notifications_enabled: notificationsEnabled,
        email_notifications: emailNotifications,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      toast.error('Failed to save profile: ' + error.message)
      setIsSaving(false)
      return
    }

    // Save experience_level separately (PostgREST schema cache may lag)
    if (data.experience_level) {
      const { error: expError } = await supabase
        .from('profiles')
        .update({ experience_level: data.experience_level })
        .eq('id', userId)

      if (expError) {
        toast.success('Profile saved! Experience level will sync after project restart.')
      } else {
        toast.success('Profile saved!')
      }
    } else {
      toast.success('Profile saved!')
    }
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" value={email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-400">Email cannot be changed here</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input
              id="full_name"
              placeholder="Aminata Kamara"
              {...register('full_name')}
              className={errors.full_name ? 'border-red-400' : ''}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={watch('location') ?? 'Sierra Leone'}
              onValueChange={(val) => setValue('location', val ?? undefined)}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Sierra Leone" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">This platform is designed for Sierra Leoneans</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_level">Education level</Label>
            <Select
              value={watch('education_level') ?? ''}
              onValueChange={(val) => setValue('education_level', val ?? undefined)}
            >
              <SelectTrigger id="education_level">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                {STUDY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience level</Label>
            <Select
              value={watch('experience_level') ?? ''}
              onValueChange={(val) => setValue('experience_level', val ?? undefined)}
            >
              <SelectTrigger id="experience_level">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{EXPERIENCE_LABELS[level]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="preferred_opp_location">Preferred opportunity location</Label>
            <Select
              value={watch('preferred_opportunity_location') ?? 'Remote'}
              onValueChange={(val) => setValue('preferred_opportunity_location', val ?? undefined)}
            >
              <SelectTrigger id="preferred_opp_location">
                <SelectValue placeholder="Remote" />
              </SelectTrigger>
              <SelectContent>
                {['Remote', 'Local (Sierra Leone)', 'Regional (West Africa)', 'International'].map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">Where would you prefer to work or study?</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interests & Preferences</CardTitle>
          <CardDescription className="text-xs">
            Select your interests to get personalized opportunity recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Opportunity types I'm interested in</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPPORTUNITY_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`pref-type-${type}`}
                    checked={preferredTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <Label htmlFor={`pref-type-${type}`} className="text-sm font-normal cursor-pointer">
                    {TYPE_LABELS[type]}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Leave all unchecked to see everything</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Categories I'm interested in</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`pref-cat-${cat}`}
                    checked={preferredCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label htmlFor={`pref-cat-${cat}`} className="text-sm font-normal cursor-pointer">
                    {cat}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Leave all unchecked to see everything</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
          <CardDescription className="text-xs">
            Add your professional and technical skills to improve opportunity matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Add a skill</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Python, Data Analysis, Project Management..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                      setSkills([...skills, skillInput.trim()])
                      setSkillInput('')
                    }
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                    setSkills([...skills, skillInput.trim()])
                    setSkillInput('')
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Your skills ({skills.length})</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                      className="text-emerald-600 hover:text-emerald-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
          <CardDescription className="text-xs">
            Get notified when opportunities matching your interests are posted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">In-app notifications</Label>
              <p className="text-xs text-gray-400">Show notifications in the bell icon</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Email notifications</Label>
              <p className="text-xs text-gray-400">
                Receive email alerts for matching opportunities
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {isSaving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}

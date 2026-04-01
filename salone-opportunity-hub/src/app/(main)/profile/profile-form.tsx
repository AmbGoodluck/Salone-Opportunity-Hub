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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { LOCATIONS, STUDY_LEVELS, CATEGORIES } from '@/lib/utils'
import type { Profile } from '@/types'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  education_level: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  userId: string
  email: string
  initialProfile: Profile | null
}

export function ProfileForm({ userId, email, initialProfile }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)

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
      location: initialProfile?.location ?? '',
      education_level: initialProfile?.education_level ?? '',
    },
  })

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: data.full_name,
        location: data.location || null,
        education_level: data.education_level || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      toast.error('Failed to save profile: ' + error.message)
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
              value={watch('location') ?? ''}
              onValueChange={(val) => setValue('location', val ?? undefined)}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {isSaving ? 'Saving…' : 'Save Profile'}
      </Button>
    </form>
  )
}

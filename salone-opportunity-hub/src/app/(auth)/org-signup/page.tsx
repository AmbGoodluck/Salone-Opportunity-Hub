'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const orgSignupSchema = z.object({
  organization_name: z.string().min(2, 'Organization name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type OrgSignupForm = z.infer<typeof orgSignupSchema>

export default function OrgSignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgSignupForm>({
    resolver: zodResolver(orgSignupSchema),
  })

  async function onSubmit(data: OrgSignupForm) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // 1. Create user + org via server API (bypasses rate limits & email confirmation)
    const res = await fetch('/api/org/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.organization_name,
        email: data.email,
        password: data.password,
      }),
    })

    if (!res.ok) {
      let message = 'Failed to create organization. Please try again.'
      try {
        const body = await res.json()
        message = body.error || message
      } catch {
        // non-JSON response
      }
      setError(message)
      setIsLoading(false)
      return
    }

    // 2. Sign in with the credentials (user is now confirmed)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Register your organization</CardTitle>
        <CardDescription>Post opportunities and reach Sierra Leone youth</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization name</Label>
            <Input
              id="organization_name"
              placeholder="e.g. Innovate Sierra Leone"
              autoComplete="organization"
              {...register('organization_name')}
              className={errors.organization_name ? 'border-red-400' : ''}
            />
            {errors.organization_name && (
              <p className="text-red-500 text-xs">{errors.organization_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="org@example.com"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register('password')}
              className={errors.password ? 'border-red-400' : ''}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register('confirm_password')}
              className={errors.confirm_password ? 'border-red-400' : ''}
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs">{errors.confirm_password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account…' : 'Register organization'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an organization account?{' '}
          <Link href="/org-login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Looking for opportunities?{' '}
          <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign up as a user
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

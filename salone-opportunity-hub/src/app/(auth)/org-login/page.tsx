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

const orgLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type OrgLoginForm = z.infer<typeof orgLoginSchema>

export default function OrgLoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgLoginForm>({
    resolver: zodResolver(orgLoginSchema),
  })

  async function onSubmit(data: OrgLoginForm) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // 1. Sign in with credentials
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (loginError) {
      setError(
        loginError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : loginError.message
      )
      setIsLoading(false)
      return
    }

    // 2. Verify that this user is an organization
    if (authData.user) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!org) {
        // Not an organization account - sign out and show error
        await supabase.auth.signOut()
        setError('This account is not registered as an organization. Please use the regular login page.')
        setIsLoading(false)
        return
      }
    }

    // 3. Redirect to organization dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Organization Sign In</CardTitle>
        <CardDescription>Manage your opportunities and reach youth</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className={errors.password ? 'border-red-400' : ''}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an organization account?{' '}
          <Link href="/org-signup" className="text-blue-700 hover:text-blue-800 font-medium">
            Register your organization
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Looking for opportunities?{' '}
          <Link href="/login" className="text-blue-700 hover:text-blue-800 font-medium">
            Sign in as a user
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

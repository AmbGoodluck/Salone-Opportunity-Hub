'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(urlError)
  }, [searchParams])

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      console.error('Login error:', error.message, error.status)
      if (error.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again.')
      } else if (error.message === 'Email not confirmed') {
        setError('Your email is not confirmed. Please check your inbox for a confirmation link.')
      } else {
        setError(error.message)
      }
      setIsLoading(false)
      return
    }

    router.push('/opportunities')
    router.refresh()
  }

  const [resetSent, setResetSent] = useState(false)

  async function handleForgotPassword() {
    const email = getValues('email')
    if (!email || !email.includes('@')) {
      setError('Please enter your email address first')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  if (resetSent) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-600 text-sm">
            We&apos;ve sent a password reset link to your email address. Click the link to set a new password.
          </p>
          <button
            type="button"
            onClick={() => setResetSent(false)}
            className="text-blue-700 hover:text-blue-800 text-sm font-medium underline"
          >
            Back to login
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
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
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-700 hover:text-blue-800 underline"
              >
                Forgot password?
              </button>
            </div>
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
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-700 hover:text-blue-800 font-medium">
            Create one free
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

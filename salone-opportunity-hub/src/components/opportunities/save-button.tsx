'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  opportunityId: string
  isSaved: boolean
  isLoggedIn: boolean
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function SaveButton({ opportunityId, isSaved: initialSaved, isLoggedIn, variant = 'ghost', className }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  async function toggle() {
    if (!isLoggedIn) {
      toast.error('Please sign in to save opportunities', {
        action: { label: 'Sign in', onClick: () => window.location.href = '/login' },
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    if (saved) {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (!error) {
        setSaved(false)
        toast.success('Removed from saved')
      } else {
        toast.error('Failed to unsave')
      }
    } else {
      const { error } = await supabase
        .from('saved_opportunities')
        .insert({ user_id: user.id, opportunity_id: opportunityId })

      if (!error) {
        setSaved(true)
        toast.success('Saved to your list!')
      } else {
        toast.error('Failed to save')
      }
    }
    setIsLoading(false)
  }

  return (
    <Button
      variant={variant}
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'gap-2',
        saved && 'text-emerald-600 border-emerald-200 hover:bg-emerald-50',
        className
      )}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? 'Saved' : 'Save'}
    </Button>
  )
}

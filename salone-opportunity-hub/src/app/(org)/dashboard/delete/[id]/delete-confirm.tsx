'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  opportunityId: string
  opportunityTitle: string
}

export function DeleteOpportunityConfirm({ opportunityId, opportunityTitle }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setIsLoading(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', opportunityId)
      .eq('organization_id', user.id) // Ensure ownership

    if (deleteError) {
      setError(deleteError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-red-700">Delete Opportunity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>&quot;{opportunityTitle}&quot;</strong>?
          This action cannot be undone.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting…' : 'Yes, delete it'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Globe, Lock } from 'lucide-react'

export function VisibilityToggle({ initialValue }: { initialValue: boolean }) {
  const [isPublic, setIsPublic] = useState(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggle(checked: boolean) {
    setIsUpdating(true)
    setIsPublic(checked)
    try {
      const res = await fetch('/api/org/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: checked }),
      })
      if (!res.ok) {
        setIsPublic(!checked) // revert on failure
      }
    } catch {
      setIsPublic(!checked)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {isPublic ? (
        <Globe className="h-4 w-4 text-green-600" />
      ) : (
        <Lock className="h-4 w-4 text-gray-400" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">
          {isPublic ? 'Profile is public' : 'Profile is hidden'}
        </p>
        <p className="text-xs text-gray-400">
          {isPublic ? 'Visible in directory and search' : 'Only you can see your profile'}
        </p>
      </div>
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
    </div>
  )
}

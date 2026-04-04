import { ReactNode } from 'react'
import { Button } from './button'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon = '🔍', title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="bg-blue-700 hover:bg-blue-800">{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction} className="bg-blue-700 hover:bg-blue-800">{actionLabel}</Button>
        )
      )}
    </div>
  )
}

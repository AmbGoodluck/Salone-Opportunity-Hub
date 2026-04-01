import { Clock } from 'lucide-react'
import { formatDeadline } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DeadlineBadgeProps {
  deadline: string | null
  className?: string
}

export function DeadlineBadge({ deadline, className }: DeadlineBadgeProps) {
  const { label, urgency } = formatDeadline(deadline)

  const urgencyClasses = {
    urgent: 'bg-red-50 text-red-600 border-red-200',
    soon: 'bg-amber-50 text-amber-600 border-amber-200',
    normal: 'bg-green-50 text-green-600 border-green-200',
    none: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
        urgencyClasses[urgency],
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  )
}

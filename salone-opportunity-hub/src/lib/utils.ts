import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, differenceInDays, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDeadline(deadline: string | null): {
  label: string
  urgency: 'urgent' | 'soon' | 'normal' | 'none'
} {
  if (!deadline) return { label: 'Ongoing', urgency: 'none' }

  const days = differenceInDays(parseISO(deadline), new Date())

  if (days < 0) return { label: 'Closed', urgency: 'urgent' }
  if (days === 0) return { label: 'Today!', urgency: 'urgent' }
  if (days <= 7) return { label: `${days} day${days === 1 ? '' : 's'} left`, urgency: 'urgent' }
  if (days <= 30) return { label: `${days} days left`, urgency: 'soon' }

  return {
    label: formatDistanceToNow(parseISO(deadline), { addSuffix: false }) + ' left',
    urgency: 'normal',
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

export const OPPORTUNITY_TYPES = ['job', 'internship', 'scholarship', 'event'] as const

export const CATEGORIES = [
  'Technology',
  'Business',
  'Arts & Culture',
  'Science',
  'Engineering',
  'Medicine & Health',
  'Law',
  'Education',
  'Agriculture',
  'Finance',
  'Media & Communications',
  'Social Work',
  'Environment',
  'Sports',
  'Government & Public Service',
  'Other',
] as const

export const STUDY_LEVELS = [
  'High School',
  'Undergraduate',
  'Postgraduate',
  'PhD',
  'Professional',
  'Any',
] as const

export const LOCATIONS = [
  'Sierra Leone',
  'West Africa',
  'Africa',
  'United Kingdom',
  'United States',
  'Europe',
  'Remote',
  'Worldwide',
] as const

export const TYPE_COLORS: Record<string, string> = {
  job: 'bg-blue-100 text-blue-700 border-blue-200',
  internship: 'bg-purple-100 text-purple-700 border-purple-200',
  scholarship: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  event: 'bg-amber-100 text-amber-700 border-amber-200',
}

export const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  in_progress: 'In Progress',
  closed: 'Closed',
}

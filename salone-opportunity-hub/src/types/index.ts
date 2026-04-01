import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Opportunity = Database['public']['Tables']['opportunities']['Row']
export type SavedOpportunity = Database['public']['Tables']['saved_opportunities']['Row']
export type CV = Database['public']['Tables']['cvs']['Row']

export type OpportunityType = 'job' | 'internship' | 'scholarship' | 'event'
export type SavedStatus = 'saved' | 'applied' | 'in_progress' | 'closed'

export interface OpportunityFilters {
  search?: string
  type?: OpportunityType[]
  category?: string[]
  location?: string
  deadline?: 'week' | 'month' | 'quarter' | 'none'
  study_level?: string[]
  is_remote?: boolean
  sort?: 'newest' | 'deadline' | 'alphabetical'
  page?: number
}

export interface PersonalInfo {
  full_name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  photo_url?: string
  summary?: string
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description?: string
}

export interface ExperienceEntry {
  id: string
  title: string
  company: string
  location: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string
}

export interface LanguageEntry {
  id: string
  language: string
  proficiency: 'basic' | 'conversational' | 'professional' | 'native'
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  date: string
  credential_url?: string
}

export interface CVData {
  template_id: string
  personal_info: PersonalInfo
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: string[]
  languages: LanguageEntry[]
  certifications: CertificationEntry[]
}

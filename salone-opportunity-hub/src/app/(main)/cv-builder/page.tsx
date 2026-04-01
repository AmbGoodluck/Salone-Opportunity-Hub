import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CVBuilderClient } from './cv-builder-client'
import type { CVData } from '@/types'

export const metadata: Metadata = {
  title: 'CV Builder | Salone Opportunity Hub',
  description: 'Build a professional CV and download it as PDF or Word document.',
}

const DEFAULT_CV: CVData = {
  template_id: 'professional',
  personal_info: {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    photo_url: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: [],
  languages: [],
  certifications: [],
}

export default async function CVBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/cv-builder')

  // Load existing CV if any
  const { data: cv } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  let initialData: CVData = DEFAULT_CV

  if (cv) {
    initialData = {
      template_id: cv.template_id,
      personal_info: cv.personal_info as unknown as CVData['personal_info'],
      education: (cv.education as unknown as CVData['education']) ?? [],
      experience: (cv.experience as unknown as CVData['experience']) ?? [],
      skills: cv.skills ?? [],
      languages: (cv.languages as unknown as CVData['languages']) ?? [],
      certifications: (cv.certifications as unknown as CVData['certifications']) ?? [],
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">CV Builder</h1>
        <p className="text-gray-500 text-sm">Create a professional CV and download as PDF or Word</p>
      </div>
      <CVBuilderClient userId={user.id} cvId={cv?.id ?? null} initialData={initialData} />
    </div>
  )
}

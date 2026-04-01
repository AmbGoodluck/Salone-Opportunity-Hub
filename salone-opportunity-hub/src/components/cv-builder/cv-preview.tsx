import type { CVData } from '@/types'
import { format } from 'date-fns'

interface CVPreviewProps {
  data: CVData
}

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr + '-01'), 'MMM yyyy')
  } catch {
    return dateStr
  }
}

function ProfessionalTemplate({ data }: { data: CVData }) {
  const { personal_info: p, education, experience, skills, languages, certifications } = data

  return (
    <div className="bg-white p-8 font-sans text-sm text-gray-800 min-h-[1000px] max-w-[800px] mx-auto">
      {/* Header */}
      <div className="border-b-2 border-emerald-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{p.full_name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
        {p.summary && <p className="mt-3 text-xs text-gray-600 leading-relaxed">{p.summary}</p>}
      </div>

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{e.institution}</p>
                  <p className="text-xs text-gray-600">{e.degree}{e.field && ` — ${e.field}`}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatMonth(e.start_date)}{e.is_current ? ' — Present' : e.end_date ? ` — ${formatMonth(e.end_date)}` : ''}
                </p>
              </div>
              {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Work Experience">
          {experience.map((e) => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-600">{e.company}{e.location && `, ${e.location}`}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatMonth(e.start_date)}{e.is_current ? ' — Present' : e.end_date ? ` — ${formatMonth(e.end_date)}` : ''}
                </p>
              </div>
              {e.description && (
                <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{e.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="Languages">
          <div className="grid grid-cols-2 gap-1">
            {languages.map((l) => (
              <div key={l.id} className="text-xs">
                <span className="font-medium">{l.language}</span>
                <span className="text-gray-400"> — {l.proficiency}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((c) => (
            <div key={c.id} className="mb-2">
              <p className="font-semibold text-xs">{c.name}</p>
              <p className="text-xs text-gray-500">{c.issuer}{c.date && ` — ${formatMonth(c.date)}`}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function ModernTemplate({ data }: { data: CVData }) {
  const { personal_info: p, education, experience, skills, languages, certifications } = data

  return (
    <div className="bg-white font-sans text-sm text-gray-800 min-h-[1000px] max-w-[800px] mx-auto flex">
      {/* Left column */}
      <div className="w-72 bg-gray-800 text-white p-6 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold leading-tight">{p.full_name || 'Your Name'}</h1>
          <div className="mt-3 space-y-1 text-xs text-gray-300">
            {p.email && <p>{p.email}</p>}
            {p.phone && <p>{p.phone}</p>}
            {p.location && <p>{p.location}</p>}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-gray-700 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Languages</h3>
            {languages.map((l) => (
              <div key={l.id} className="text-xs text-gray-300 mb-1">
                {l.language} <span className="text-gray-500">— {l.proficiency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex-1 p-6">
        {p.summary && (
          <p className="text-xs text-gray-600 mb-5 leading-relaxed border-l-2 border-emerald-500 pl-3 italic">
            {p.summary}
          </p>
        )}

        {experience.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              Experience
            </h3>
            {experience.map((e) => (
              <div key={e.id} className="mb-3">
                <p className="font-semibold text-gray-900">{e.title}</p>
                <p className="text-xs text-emerald-600">{e.company}</p>
                <p className="text-xs text-gray-400">
                  {formatMonth(e.start_date)}
                  {e.is_current ? ' — Present' : e.end_date ? ` — ${formatMonth(e.end_date)}` : ''}
                </p>
                {e.description && <p className="text-xs text-gray-600 mt-1">{e.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              Education
            </h3>
            {education.map((e) => (
              <div key={e.id} className="mb-2">
                <p className="font-semibold">{e.institution}</p>
                <p className="text-xs text-gray-600">{e.degree}{e.field && ` — ${e.field}`}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CreativeTemplate({ data }: { data: CVData }) {
  const { personal_info: p, education, experience, skills, languages } = data

  return (
    <div className="bg-white font-sans text-sm min-h-[1000px] max-w-[800px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-8">
        <h1 className="text-3xl font-bold">{p.full_name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-emerald-100">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
        {p.summary && (
          <p className="mt-4 text-sm text-emerald-50 leading-relaxed max-w-xl">{p.summary}</p>
        )}
      </div>

      <div className="p-8 grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          {experience.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-emerald-700 mb-3">Experience</h3>
              {experience.map((e) => (
                <div key={e.id} className="mb-4 pl-3 border-l-2 border-emerald-200">
                  <p className="font-semibold text-gray-900">{e.title}</p>
                  <p className="text-xs text-emerald-600 font-medium">{e.company}</p>
                  <p className="text-xs text-gray-400">
                    {formatMonth(e.start_date)} — {e.is_current ? 'Present' : formatMonth(e.end_date)}
                  </p>
                  {e.description && <p className="text-xs text-gray-600 mt-1">{e.description}</p>}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-emerald-700 mb-3">Education</h3>
              {education.map((e) => (
                <div key={e.id} className="mb-3 pl-3 border-l-2 border-emerald-200">
                  <p className="font-semibold">{e.institution}</p>
                  <p className="text-xs text-gray-600">{e.degree} — {e.field}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-5">
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-emerald-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-emerald-700 mb-2">Languages</h3>
              {languages.map((l) => (
                <div key={l.id} className="text-xs text-gray-700 mb-1">
                  <span className="font-medium">{l.language}</span> — {l.proficiency}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

export function CVPreview({ data }: CVPreviewProps) {
  switch (data.template_id) {
    case 'modern':
      return <ModernTemplate data={data} />
    case 'creative':
      return <CreativeTemplate data={data} />
    default:
      return <ProfessionalTemplate data={data} />
  }
}

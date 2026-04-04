import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, ATS-friendly, single column',
    preview: 'bg-white border-l-4 border-blue-700',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with color accent',
    preview: 'bg-gradient-to-r from-gray-800 to-gray-700',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Visual design, great for creative fields',
    preview: 'bg-gradient-to-br from-blue-700 to-blue-600',
  },
]

interface TemplateSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function TemplateSelectorSection({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose a Template</h2>
        <p className="text-sm text-gray-500">Select the style that best fits your field</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
              selected === template.id
                ? 'border-blue-700 ring-2 ring-blue-100'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            {/* Template preview thumbnail */}
            <div className={cn('h-24 rounded-lg mb-3', template.preview)} />

            <p className="font-semibold text-sm text-gray-900">{template.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>

            {selected === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

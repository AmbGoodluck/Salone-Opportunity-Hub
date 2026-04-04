'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CVData } from '@/types'

// Dynamically import react-pdf to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

// Lazy import the PDF document
const CVPdfDocument = dynamic(
  () => import('./cv-pdf-document').then((mod) => mod.CVPdfDocument),
  { ssr: false }
)

interface DownloadButtonsProps {
  data: CVData
  compact?: boolean
}

export function DownloadButtons({ data, compact = false }: DownloadButtonsProps) {
  const [isGeneratingWord, setIsGeneratingWord] = useState(false)
  const fileName = `${data.personal_info.full_name || 'CV'}_CV`.replace(/\s+/g, '_')

  async function downloadWord() {
    setIsGeneratingWord(true)
    try {
      const { generateWordCV } = await import('@/lib/docx-generator')
      await generateWordCV(data, fileName)
    } catch (err) {
      console.error('Word generation failed:', err)
      alert('Failed to generate Word document. Please try PDF instead.')
    }
    setIsGeneratingWord(false)
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadWord}
          disabled={isGeneratingWord}
          className="gap-1.5 text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          {isGeneratingWord ? 'Generating…' : 'Word'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <PDFDownloadLink
          document={<CVPdfDocument data={data} />}
          fileName={`${fileName}.pdf`}
        >
          {({ loading }) => (
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800 gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              {loading ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={downloadWord}
        disabled={isGeneratingWord}
      >
        <FileText className="h-4 w-4" />
        {isGeneratingWord ? 'Generating…' : 'Download Word (.docx)'}
      </Button>
    </div>
  )
}

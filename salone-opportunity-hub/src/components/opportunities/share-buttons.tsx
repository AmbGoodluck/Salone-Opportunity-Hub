'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
  title: string
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-9 h-9 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-bold"
        aria-label="Share on WhatsApp"
      >
        W
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
        aria-label="Share on Facebook"
      >
        f
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold"
        aria-label="Share on X"
      >
        X
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="flex items-center justify-center w-9 h-9 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-blue-700" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

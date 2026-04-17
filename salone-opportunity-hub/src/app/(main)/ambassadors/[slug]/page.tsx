import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function AmbassadorDetailPage() {
  const { slug } = useParams()
  const [ambassador, setAmbassador] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ambassadors/${slug}`)
      .then(res => res.json())
      .then(data => {
        setAmbassador(data.ambassador)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="text-center mt-10">Loading...</div>
  if (!ambassador) return <div className="text-center mt-10 text-red-600">Ambassador not found.</div>

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded shadow p-8">
      <div className="flex flex-col items-center">
        {ambassador.profile_picture ? (
          <img src={ambassador.profile_picture} alt={ambassador.name} className="w-32 h-32 rounded-full object-cover mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-4xl">👤</div>
        )}
        <h2 className="text-2xl font-bold mb-2">{ambassador.name}</h2>
        <div className="text-gray-600 mb-2">{ambassador.city}{ambassador.region ? `, ${ambassador.region}` : ''}</div>
        {ambassador.bio && <div className="mb-4 text-center">{ambassador.bio}</div>}
        <div className="w-full border-t my-4"></div>
        <div className="w-full flex flex-col items-center space-y-2">
          <a href={`https://wa.me/${encodeURIComponent(ambassador.phone)}`} target="_blank" rel="noopener noreferrer"
             className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Contact via WhatsApp
          </a>
          <a href={`mailto:${encodeURIComponent(ambassador.email)}`} className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Contact via Email
          </a>
        </div>
      </div>
    </div>
  )
}

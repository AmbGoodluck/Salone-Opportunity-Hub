"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AmbassadorDirectoryPage() {
  const [ambassadors, setAmbassadors] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ambassadors?q=${encodeURIComponent(query)}`)
      .then(async res => {
        if (!res.ok) throw new Error('Network response was not ok');
        const text = await res.text();
        if (!text) return { ambassadors: [] };
        return JSON.parse(text);
      })
      .then(data => {
        setAmbassadors(data.ambassadors || []);
        setLoading(false);
      })
      .catch(() => {
        setAmbassadors([]);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold mb-4 sm:mb-0">SOH Ambassadors</h2>
        <Link href="/ambassadors/apply" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Apply to be an Ambassador</Link>
      </div>
      <form onSubmit={e => { e.preventDefault(); }} className="mb-6 flex">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or city"
          className="flex-1 border rounded-l px-4 py-2 focus:outline-none" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">Search</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? <div>Loading...</div> : ambassadors.length === 0 ? <div className="col-span-3 text-center text-gray-500">No ambassadors found.</div> : ambassadors.map(ambassador => (
          <div key={ambassador.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            {ambassador.profile_picture ? (
              <img src={ambassador.profile_picture} alt={ambassador.name} className="w-24 h-24 rounded-full object-cover mb-2" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-2xl">👤</div>
            )}
            <div className="font-bold text-lg">{ambassador.name}</div>
            <div className="text-gray-600">{ambassador.city}</div>
            <Link href={`/ambassadors/${ambassador.slug}`} className="mt-2 text-blue-600 hover:underline">View Profile</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

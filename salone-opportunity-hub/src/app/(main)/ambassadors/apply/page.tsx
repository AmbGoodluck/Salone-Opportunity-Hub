"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from './useUser'

export default function AmbassadorApplyPage() {
  const user = useUser()
  const [form, setForm] = useState({ name: '', profile_picture: '', city: '', region: '', phone: '', email: '', bio: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!user) {
      setError('You must be signed in to apply.')
      setLoading(false)
      return
    }
    const user_id = user.id
    const res = await fetch('/api/ambassadors/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Submission failed')
    } else {
      router.push('/ambassadors/success')
    }
  }

  if (!user) {
    return <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">You must be signed in to apply as an ambassador.</div>
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Become an SOH Ambassador</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required className="w-full border rounded px-3 py-2" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="w-full border rounded px-3 py-2" placeholder="Profile Picture URL" value={form.profile_picture} onChange={e => setForm(f => ({ ...f, profile_picture: e.target.value }))} />
        <input required className="w-full border rounded px-3 py-2" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        <input className="w-full border rounded px-3 py-2" placeholder="Region (optional)" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
        <input required className="w-full border rounded px-3 py-2" placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <input required type="email" className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Short Bio (optional)" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
      </form>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AmbassadorAdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchPending() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ambassadors/admin/pending");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setPending(data.ambassadors);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setError("");
    try {
      const res = await fetch(`/api/ambassadors/admin/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      fetchPending();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Ambassador Applications Review</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : pending.length === 0 ? (
        <div className="text-gray-500">No pending applications.</div>
      ) : (
        <div className="space-y-4">
          {pending.map((amb: any) => (
            <div key={amb.id} className="bg-white rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold text-lg">{amb.name}</div>
                <div className="text-gray-600">{amb.city}{amb.region ? ` (${amb.region})` : ""}</div>
                <div className="text-gray-500 text-sm">{amb.email} | {amb.phone}</div>
                <div className="mt-2 text-gray-700">{amb.bio}</div>
              </div>
              <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:ml-6">
                <button onClick={() => handleAction(amb.id, "approve")}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
                <button onClick={() => handleAction(amb.id, "reject")}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                <Link href={`/ambassadors/${amb.slug}`} className="text-blue-600 hover:underline text-center">View Profile</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

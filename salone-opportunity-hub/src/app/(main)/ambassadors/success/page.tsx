export default function AmbassadorSuccessPage() {
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
      <p className="mb-4">Your application has been submitted and is under review.</p>
      <a href="/ambassadors" className="text-blue-600 hover:underline">Back to Ambassador Directory</a>
    </div>
  )
}

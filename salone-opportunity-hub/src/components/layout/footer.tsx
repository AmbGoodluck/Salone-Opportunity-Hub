import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="font-bold text-white">Salone Opportunity Hub</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting Sierra Leone youth with scholarships, jobs, internships and events that shape futures.
            </p>
          </div>

          {/* Opportunities */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Opportunities</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/opportunities?type=scholarship" className="hover:text-white transition-colors">Scholarships</Link></li>
              <li><Link href="/opportunities?type=job" className="hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/opportunities?type=internship" className="hover:text-white transition-colors">Internships</Link></li>
              <li><Link href="/opportunities?type=event" className="hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cv-builder" className="hover:text-white transition-colors">CV Builder</Link></li>
              <li><Link href="/saved" className="hover:text-white transition-colors">Saved Opportunities</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Salone Opportunity Hub. Made with love for Sierra Leone.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🇸🇱 Sierra Leone</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

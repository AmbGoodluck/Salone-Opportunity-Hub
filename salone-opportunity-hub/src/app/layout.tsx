import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Salone Opportunity Hub",
    template: "%s | Salone Opportunity Hub",
  },
  description:
    "Discover scholarships, jobs, internships, and events for Sierra Leone youth. Build your CV and track your applications.",
  keywords: [
    "Sierra Leone",
    "scholarships",
    "jobs",
    "internships",
    "opportunities",
    "youth",
    "Freetown",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://salone-opportunity-hub.pages.dev"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Salone Opportunity Hub",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

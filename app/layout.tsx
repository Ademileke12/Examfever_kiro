import type { Metadata, Viewport } from 'next'
import { Inter, Outfit, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ReferralTracker } from '@/components/affiliate/ReferralTracker'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ExamFever | AI Exam Simulator',
  description: 'AI-powered mock exam generator that creates high-pressure, timed practice tests from uploaded student PDFs',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <ClientProviders>
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ClientProviders>
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

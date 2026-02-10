'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="main-container p-8 md:p-12"
        >
          {/* Branding */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <Link href="/" className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground">ExamFever</span>
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  )
}

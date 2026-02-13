'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

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
            <Link href="/" className="block hover:opacity-90 transition-opacity">
              <Logo className="scale-125" showText={true} />
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  )
}

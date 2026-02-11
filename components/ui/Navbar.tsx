'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD', requireAuth: true },
    { href: '/browse', label: 'MY EXAMS', requireAuth: false },
    { href: '/questions', label: 'QUESTIONS', requireAuth: false },
    { href: '/upload', label: 'UPLOAD PDF', requireAuth: false },
    { href: '/analytics', label: 'ANALYTICS', requireAuth: true },
    { href: '/store', label: 'STORE', requireAuth: true },
    { href: '/subscription', label: 'PLAN', requireAuth: true }
  ]

  const visibleNavItems = navItems.filter(item => !item.requireAuth || user)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-[#0A0A0C]/80 backdrop-blur-md border-b dark:border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">ExamFever</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-bold tracking-widest transition-colors hover:text-[#7C3AED] ${pathname === item.href ? 'text-[#7C3AED]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => signOut()}
                className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {!user && (
            <Link
              href="/register"
              className="hidden md:flex bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#7C3AED]/20"
            >
              Get Started
            </Link>
          )}

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-white dark:bg-[#111114] border-b dark:border-white/5 p-6 space-y-4"
          >
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-bold tracking-widest text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED]"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t dark:border-white/5 flex items-center justify-between">
              <ThemeToggle />
              {!user && (
                <Link
                  href="/login"
                  className="text-sm font-bold text-[#6B7280]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LOG IN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
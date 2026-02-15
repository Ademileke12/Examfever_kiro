'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Lock } from 'lucide-react'
import { useSubscription } from '@/components/providers/SubscriptionProvider'
import { Logo } from './Logo'
import { useExam } from '@/components/providers/ExamProvider'
import { ExamExitModal } from '@/components/exam/ExamExitModal'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { subscription } = useSubscription()
  const { isExamActive, setIsExamActive } = useExam()

  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isExamActive && pathname === '/exam') {
      e.preventDefault()
      setPendingHref(href)
      setIsExitModalOpen(true)
    }
  }

  const confirmExit = () => {
    setIsExamActive(false)
    setIsExitModalOpen(false)
    if (pendingHref) {
      router.push(pendingHref)
      setPendingHref(null)
    }
  }

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
    { href: '/games', label: 'GAMES', requireAuth: true },
    { href: '/analytics', label: 'ANALYTICS', requireAuth: true },
    { href: '/affiliate', label: 'EARN', requireAuth: true },
    { href: '/store', label: 'STORE', requireAuth: true },
    { href: '/subscription', label: 'PLAN', requireAuth: true }
  ]

  const visibleNavItems = navItems.filter(item => !item.requireAuth || user)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-[#0A0A0C]/80 backdrop-blur-md border-b dark:border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={(e) => handleNavClick(e, '/')} className="block">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center gap-6">
          {visibleNavItems.map((item) => {
            const isRestricted = item.href === '/analytics' && (!subscription || subscription.plan_tier === 'free')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`text-[10px] font-bold tracking-widest transition-colors hover:text-[#7C3AED] flex items-center gap-1 ${pathname === item.href ? 'text-[#7C3AED]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`}
              >
                {item.label}
                {isRestricted && <Lock size={10} className="text-amber-500" />}
                {item.label === 'EARN' && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-4 mr-2">
            <ThemeToggle />
            {user ? (
              <button
                onClick={async () => {
                  await signOut()
                  router.push('/login')
                }}
                className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {/* Mobile Toggle */}
          <button
            className="xl:hidden p-2 text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed top-20 left-0 right-0 bg-white dark:bg-[#111114] border-b dark:border-white/5 shadow-2xl z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {visibleNavItems.map((item) => {
                  const isRestricted = item.href === '/analytics' && (!subscription || subscription.plan_tier === 'free')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        handleNavClick(e, item.href)
                        if (!isExamActive || pathname !== '/exam') {
                          setIsMobileMenuOpen(false)
                        }
                      }}
                      className={`flex items-center justify-between text-sm font-bold tracking-widest transition-colors ${pathname === item.href ? 'text-[#7C3AED]' : 'text-[#6B7280] dark:text-[#9CA3AF]'} hover:text-[#7C3AED]`}
                    >
                      {item.label}
                      {isRestricted && <Lock size={14} className="text-amber-500" />}
                    </Link>
                  )
                })}
                <div className="pt-4 border-t dark:border-white/5 flex items-center justify-between">
                  <ThemeToggle />
                  {user ? (
                    <button
                      onClick={async () => {
                        await signOut()
                        setIsMobileMenuOpen(false)
                        router.push('/login')
                      }}
                      className="text-sm font-bold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED]"
                    >
                      LOG OUT
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm font-bold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      LOG IN
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ExamExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={confirmExit}
      />
    </nav>
  )
}
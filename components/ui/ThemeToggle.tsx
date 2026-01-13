'use client'

import { useTheme } from '@/lib/theme/theme-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.button
      onClick={toggleTheme}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-16 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 border border-slate-600 dark:border-slate-700 overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: actualTheme === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: actualTheme === 'dark'
            ? isHovered 
              ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)'
              : '0 0 10px rgba(59, 130, 246, 0.3)'
            : isHovered
              ? '0 0 20px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.1)'
              : '0 0 10px rgba(251, 191, 36, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Toggle circle */}
      <motion.div
        className="absolute top-1 w-6 h-6 rounded-full flex items-center justify-center"
        animate={{
          x: actualTheme === 'dark' ? 4 : 36,
          background: actualTheme === 'dark'
            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        <AnimatePresence mode="wait">
          {actualTheme === 'dark' ? (
            <motion.svg
              key="moon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="white"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <circle cx="12" cy="12" r="5" fill="white"/>
              <line x1="12" y1="1" x2="12" y2="3" stroke="white" strokeWidth="2"/>
              <line x1="12" y1="21" x2="12" y2="23" stroke="white" strokeWidth="2"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="white" strokeWidth="2"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" strokeWidth="2"/>
              <line x1="1" y1="12" x2="3" y2="12" stroke="white" strokeWidth="2"/>
              <line x1="21" y1="12" x2="23" y2="12" stroke="white" strokeWidth="2"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="white" strokeWidth="2"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="white" strokeWidth="2"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Stars for dark mode */}
      <AnimatePresence>
        {actualTheme === 'dark' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
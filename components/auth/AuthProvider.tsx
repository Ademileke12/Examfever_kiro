'use client'

import { createContext, useContext } from 'react'
import { AuthContextType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  // Automatic logout after 30 minutes of inactivity
  useInactivityTimeout({
    timeoutMs: 30 * 60 * 1000, // 30 minutes
    onTimeout: () => {
      console.log('Session timed out due to inactivity.')
      auth.signOut()
    },
    enabled: !!auth.user // Only enable when user is logged in
  })

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

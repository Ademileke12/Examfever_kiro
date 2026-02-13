'use client'

import { createContext, useContext } from 'react'
import { AuthContextType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  // Automatic logout after 1.5 minutes of inactivity
  useInactivityTimeout({
    timeoutMs: 1.5 * 60 * 1000, // 1.5 minutes
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

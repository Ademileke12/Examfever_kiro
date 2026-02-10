'use client'

import { ThemeProvider } from '@/lib/theme/theme-provider'
import { AuthProvider } from '@/components/auth/AuthProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="examfever-theme">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

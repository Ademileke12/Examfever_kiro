'use client'

import { ThemeProvider } from '@/lib/theme/theme-provider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SubscriptionProvider } from '@/components/providers/SubscriptionProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="examfever-theme">
      <AuthProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

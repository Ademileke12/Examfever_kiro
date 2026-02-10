'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { ProtectedRouteProps } from '@/types/auth'

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

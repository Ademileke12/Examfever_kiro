import { useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/auth'
import { AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth'

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    setLoading(false)
    return { error }
  }

  const signUp = async (credentials: RegisterCredentials & { referralCode: string | undefined }) => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/callback`
          : 'https://examfever-kiro.vercel.app/api/auth/callback',
        data: {
          referred_by: credentials.referralCode
        }
      },
    })

    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signOut()

    setLoading(false)
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}

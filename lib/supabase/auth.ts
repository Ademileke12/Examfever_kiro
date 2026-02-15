import { createBrowserClient } from '@supabase/ssr'
import { AuthError } from '@supabase/supabase-js'
import { LoginCredentials, RegisterCredentials } from '@/types/auth'

// Client-side Supabase client
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Authentication utilities
export const authHelpers = {
  // Sign in with email and password
  signIn: async (credentials: LoginCredentials) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  },

  // Sign up with email and password
  signUp: async (credentials: RegisterCredentials) => {
    const supabase = createClient()
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        : "https://examfever-kiro.vercel.app/api/auth/callback"

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  },

  // Sign out
  signOut: async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const supabase = createClient()
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
        : "https://examfever-kiro.vercel.app/auth/reset-password"

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  },

  // Update password
  updatePassword: async (password: string) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  },

  // Get current session
  getSession: async () => {
    const supabase = createClient()

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  },

  // Get current user
  getUser: async () => {
    const supabase = createClient()

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  },
}

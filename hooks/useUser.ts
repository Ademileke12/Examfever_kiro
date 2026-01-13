import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/auth'
import { UserProfile, UserPreferences, UserStats, UpdateProfileData, UpdatePreferencesData } from '@/types/user'

export function useUser(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchUserData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError
      }

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError
      }

      setProfile(profileData)
      setPreferences(preferencesData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchUserData()
    } else {
      setProfile(null)
      setPreferences(null)
      setStats(null)
    }
  }, [user, fetchUserData])

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) return { error: 'No user logged in' }

    setLoading(true)
    setError(null)

    try {
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setProfile(updatedProfile)
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (data: UpdatePreferencesData) => {
    if (!user) return { error: 'No user logged in' }

    setLoading(true)
    setError(null)

    try {
      const { data: updatedPreferences, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setPreferences(updatedPreferences)
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    preferences,
    stats,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refetch: fetchUserData,
  }
}

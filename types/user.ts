import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  email_notifications: boolean
  study_reminders: boolean
  difficulty_preference: 'easy' | 'medium' | 'hard' | 'adaptive'
}

export interface UserStats {
  total_exams_taken: number
  total_questions_answered: number
  average_score: number
  study_streak: number
  total_study_time: number
  last_activity: string
}

export interface ExtendedUser extends User {
  profile?: UserProfile
  preferences?: UserPreferences
  stats?: UserStats
}

export interface UpdateProfileData {
  full_name?: string
  avatar_url?: string
}

export interface UpdatePreferencesData {
  theme?: 'light' | 'dark' | 'system'
  notifications_enabled?: boolean
  email_notifications?: boolean
  study_reminders?: boolean
  difficulty_preference?: 'easy' | 'medium' | 'hard' | 'adaptive'
}

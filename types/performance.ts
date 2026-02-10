export interface PerformanceMetrics {
  accuracy: number
  average_time: number
  improvement: number
  consistency: number
  efficiency: number
  streak: number
}

import { PerformanceTrend } from '@/types/analytics'

export interface DetailedPerformance {
  overall: PerformanceMetrics
  by_topic: TopicPerformance[]
  by_difficulty: DifficultyPerformance[]
  by_time_period: TimeBasedPerformance[]
  trends: PerformanceTrend[]
}

export interface TopicPerformance {
  topic: string
  metrics: PerformanceMetrics
  question_count: number
  time_spent: number
  mastery_level: number
  last_practiced: string
}

export interface DifficultyPerformance {
  difficulty: 'easy' | 'medium' | 'hard'
  metrics: PerformanceMetrics
  question_count: number
  success_rate: number
  average_attempts: number
}

export interface TimeBasedPerformance {
  period: string
  date: string
  metrics: PerformanceMetrics
  exams_taken: number
  total_time: number
}

export interface PerformanceComparison {
  current_period: PerformanceMetrics
  previous_period: PerformanceMetrics
  change_percentage: number
  improvement_areas: string[]
  declining_areas: string[]
}

export interface PerformanceGoals {
  target_accuracy: number
  target_speed: number
  target_consistency: number
  target_streak: number
  deadline: string
  progress: number
}

export interface PerformanceInsights {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  next_actions: string[]
  estimated_improvement_time: number
}

export interface StudyEfficiency {
  questions_per_hour: number
  accuracy_per_minute: number
  optimal_study_duration: number
  fatigue_indicators: FatigueIndicator[]
  peak_performance_times: string[]
}

export interface FatigueIndicator {
  session_duration: number
  accuracy_decline: number
  response_time_increase: number
  error_rate_increase: number
}

export interface LearningVelocity {
  concepts_mastered_per_week: number
  improvement_rate: number
  learning_curve_slope: number
  plateau_indicators: boolean
  breakthrough_moments: string[]
}

export interface CompetitiveMetrics {
  percentile_rank: number
  peer_comparison: PeerComparison
  leaderboard_position: number
  achievement_level: string
}

export interface PeerComparison {
  average_peer_accuracy: number
  average_peer_speed: number
  user_vs_peer_accuracy: number
  user_vs_peer_speed: number
  ranking_category: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

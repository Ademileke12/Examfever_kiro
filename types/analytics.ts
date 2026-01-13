export interface UserActivity {
  id: string
  user_id: string
  activity_type: ActivityType
  metadata: Record<string, any>
  timestamp: string
  session_id?: string
}

export type ActivityType = 
  | 'exam_started'
  | 'exam_completed'
  | 'question_answered'
  | 'question_skipped'
  | 'question_flagged'
  | 'exam_paused'
  | 'exam_resumed'
  | 'pdf_uploaded'
  | 'questions_generated'
  | 'dashboard_viewed'
  | 'analytics_viewed'

export interface AnalyticsData {
  user_id: string
  total_exams: number
  total_questions_answered: number
  average_score: number
  total_study_time: number
  streak_days: number
  last_activity: string
  performance_trend: number
  knowledge_gaps: KnowledgeGap[]
  study_patterns: StudyPattern[]
}

export interface KnowledgeGap {
  topic: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  accuracy_rate: number
  question_count: number
  improvement_needed: number
  recommended_actions: string[]
}

export interface StudyPattern {
  day_of_week: number
  hour_of_day: number
  activity_count: number
  average_performance: number
  consistency_score: number
}

export interface PerformanceTrend {
  date: string
  score: number
  questions_answered: number
  time_spent: number
  topics_covered: string[]
}

export interface StudyRecommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimated_impact: number
  action_items: string[]
  related_topics: string[]
}

export type RecommendationType =
  | 'focus_weak_areas'
  | 'increase_practice'
  | 'review_concepts'
  | 'adjust_study_schedule'
  | 'try_different_difficulty'
  | 'take_break'

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
}

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins?: {
    legend?: {
      display: boolean
      position?: 'top' | 'bottom' | 'left' | 'right'
    }
    tooltip?: {
      enabled: boolean
    }
  }
  scales?: {
    x?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
    y?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
  }
}

export interface AnalyticsFilters {
  date_range: {
    start: string
    end: string
  }
  topics?: string[]
  difficulty_levels?: string[]
  exam_types?: string[]
}

export interface TopicMastery {
  topic: string
  mastery_level: number
  questions_attempted: number
  questions_correct: number
  average_time: number
  last_practiced: string
  improvement_rate: number
}

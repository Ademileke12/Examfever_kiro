export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          user_id: string
          file_id: string | null
          type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false'
          text: string
          options: any | null
          correct_answer: string | null
          explanation: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          topic: string | null
          keywords: string[] | null
          source_content: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_id?: string | null
          type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false'
          text: string
          options?: any | null
          correct_answer?: string | null
          explanation?: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          topic?: string | null
          keywords?: string[] | null
          source_content?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_id?: string | null
          type?: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false'
          text?: string
          options?: any | null
          correct_answer?: string | null
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          topic?: string | null
          keywords?: string[] | null
          source_content?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          text: string
          is_correct: boolean
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          text: string
          is_correct?: boolean
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          text?: string
          is_correct?: boolean
          explanation?: string | null
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          time_limit_minutes: number
          total_questions: number
          difficulty_distribution: any
          question_types: string[]
          status: 'draft' | 'active' | 'completed' | 'archived'
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          time_limit_minutes?: number
          total_questions: number
          difficulty_distribution?: any
          question_types?: string[]
          status?: 'draft' | 'active' | 'completed' | 'archived'
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          time_limit_minutes?: number
          total_questions?: number
          difficulty_distribution?: any
          question_types?: string[]
          status?: 'draft' | 'active' | 'completed' | 'archived'
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      exam_questions: {
        Row: {
          id: string
          exam_id: string
          question_id: string
          order_index: number
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          question_id: string
          order_index: number
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          question_id?: string
          order_index?: number
          points?: number
          created_at?: string
        }
      }
      exam_sessions: {
        Row: {
          id: string
          exam_id: string
          user_id: string
          status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out'
          started_at: string
          completed_at: string | null
          time_remaining_seconds: number | null
          current_question_index: number
          session_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          user_id: string
          status?: 'in_progress' | 'completed' | 'abandoned' | 'timed_out'
          started_at?: string
          completed_at?: string | null
          time_remaining_seconds?: number | null
          current_question_index?: number
          session_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          user_id?: string
          status?: 'in_progress' | 'completed' | 'abandoned' | 'timed_out'
          started_at?: string
          completed_at?: string | null
          time_remaining_seconds?: number | null
          current_question_index?: number
          session_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer_text: string | null
          selected_option_id: string | null
          is_correct: boolean | null
          points_earned: number
          time_spent_seconds: number
          is_flagged: boolean
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer_text?: string | null
          selected_option_id?: string | null
          is_correct?: boolean | null
          points_earned?: number
          time_spent_seconds?: number
          is_flagged?: boolean
          answered_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer_text?: string | null
          selected_option_id?: string | null
          is_correct?: boolean | null
          points_earned?: number
          time_spent_seconds?: number
          is_flagged?: boolean
          answered_at?: string
        }
      }
      exam_results: {
        Row: {
          id: string
          session_id: string
          user_id: string
          exam_id: string
          total_questions: number
          questions_answered: number
          questions_correct: number
          total_points: number
          points_earned: number
          percentage_score: number
          time_taken_seconds: number
          difficulty_breakdown: any
          topic_breakdown: any
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          exam_id: string
          total_questions: number
          questions_answered: number
          questions_correct: number
          total_points: number
          points_earned: number
          percentage_score: number
          time_taken_seconds: number
          difficulty_breakdown?: any
          topic_breakdown?: any
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          exam_id?: string
          total_questions?: number
          questions_answered?: number
          questions_correct?: number
          total_points?: number
          points_earned?: number
          percentage_score?: number
          time_taken_seconds?: number
          difficulty_breakdown?: any
          topic_breakdown?: any
          created_at?: string
        }
      }
    }
  }
}

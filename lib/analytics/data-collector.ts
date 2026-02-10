import { createClient } from '@/lib/supabase/auth'
import { UserActivity, ActivityType } from '@/types/analytics'
import { generateId } from '@/lib/utils'

export class DataCollector {
  private supabase = createClient()
  private sessionId: string | null = null
  private batchQueue: UserActivity[] = []
  private batchTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async trackActivity(
    activityType: ActivityType,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        console.warn('No authenticated user for activity tracking')
        return
      }

      const activity: UserActivity = {
        id: generateId(),
        user_id: user.id,
        activity_type: activityType,
        metadata,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId || generateId()
      }

      // Add to batch queue for efficient processing
      this.batchQueue.push(activity)
      this.scheduleBatchProcess()

    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  private scheduleBatchProcess(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    // Process batch after 2 seconds or when queue reaches 10 items
    if (this.batchQueue.length >= 10) {
      this.processBatch()
    } else {
      this.batchTimeout = setTimeout(() => {
        this.processBatch()
      }, 2000)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return

    try {
      const batch = [...this.batchQueue]
      this.batchQueue = []

      const { error } = await this.supabase
        .from('user_activities')
        .insert(batch)

      if (error) {
        // Check if it's a table not found error
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.warn('Analytics tables not set up yet. Skipping activity tracking.')
          return // Don't re-queue if tables don't exist
        }
        
        console.error('Error saving activity batch:', error)
        // Re-queue failed items for other errors
        this.batchQueue.unshift(...batch)
      }
    } catch (error) {
      console.error('Error processing activity batch:', error)
    }
  }

  async trackExamStart(examId: string, questionCount: number): Promise<void> {
    await this.trackActivity('exam_started', {
      exam_id: examId,
      question_count: questionCount,
      start_time: new Date().toISOString()
    })
  }

  async trackExamComplete(
    examId: string,
    score: number,
    timeSpent: number,
    questionsAnswered: number
  ): Promise<void> {
    await this.trackActivity('exam_completed', {
      exam_id: examId,
      score,
      time_spent: timeSpent,
      questions_answered: questionsAnswered,
      completion_time: new Date().toISOString()
    })

    // Also update performance history
    await this.updatePerformanceHistory(examId, score, timeSpent, questionsAnswered)
  }

  async trackQuestionAnswer(
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    topic: string,
    difficulty: string
  ): Promise<void> {
    await this.trackActivity('question_answered', {
      question_id: questionId,
      is_correct: isCorrect,
      time_spent: timeSpent,
      topic,
      difficulty,
      answer_time: new Date().toISOString()
    })
  }

  async trackPDFUpload(fileName: string, fileSize: number): Promise<void> {
    await this.trackActivity('pdf_uploaded', {
      file_name: fileName,
      file_size: fileSize,
      upload_time: new Date().toISOString()
    })
  }

  async trackQuestionsGenerated(
    pdfId: string,
    questionCount: number,
    topics: string[]
  ): Promise<void> {
    await this.trackActivity('questions_generated', {
      pdf_id: pdfId,
      question_count: questionCount,
      topics,
      generation_time: new Date().toISOString()
    })
  }

  private async updatePerformanceHistory(
    examId: string,
    score: number,
    timeSpent: number,
    questionsAnswered: number
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      const questionsCorrect = Math.round((score / 100) * questionsAnswered)
      const averageTime = Math.round(timeSpent / questionsAnswered)

      const { error } = await this.supabase
        .from('performance_history')
        .insert({
          id: generateId(),
          user_id: user.id,
          exam_id: examId,
          accuracy: score,
          average_time: averageTime,
          questions_answered: questionsAnswered,
          questions_correct: questionsCorrect,
          total_time: timeSpent,
          topics_covered: [], // Will be populated from exam data
          difficulty_level: 'mixed'
        })

      if (error) {
        // Check if it's a table not found error
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.warn('Performance history table not set up yet. Skipping performance tracking.')
          return
        }
        console.error('Error updating performance history:', error)
      }
    } catch (error) {
      console.error('Error in updatePerformanceHistory:', error)
    }
  }

  async getRecentActivities(limit: number = 50): Promise<UserActivity[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching activities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentActivities:', error)
      return []
    }
  }

  async getSessionActivities(sessionId?: string): Promise<UserActivity[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return []

      const targetSessionId = sessionId || this.sessionId

      const { data, error } = await this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', targetSessionId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Error fetching session activities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSessionActivities:', error)
      return []
    }
  }

  // Force process any remaining items in queue
  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    await this.processBatch()
  }

  // Start new session
  startNewSession(): void {
    this.sessionId = this.generateSessionId()
  }
}

// Singleton instance for global use
export const dataCollector = new DataCollector()

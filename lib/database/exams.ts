import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ExamConfig {
  id?: string
  title: string
  description?: string
  timeLimitMinutes: number
  totalQuestions: number
  difficultyDistribution: { easy: number; medium: number; hard: number }
  questionTypes: string[]
  questionIds: string[]
}

export async function createExam(config: ExamConfig, userId: string): Promise<{ success: boolean; examId?: string; error?: string }> {
  try {
    // Create exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        user_id: userId,
        title: config.title,
        description: config.description,
        time_limit_minutes: config.timeLimitMinutes,
        total_questions: config.totalQuestions,
        difficulty_distribution: config.difficultyDistribution,
        question_types: config.questionTypes,
        status: 'draft'
      })
      .select()
      .single()

    if (examError) {
      throw new Error(examError.message)
    }

    // Add questions to exam
    const examQuestions = config.questionIds.map((questionId, index) => ({
      exam_id: examData.id,
      question_id: questionId,
      order_index: index,
      points: 1
    }))

    const { error: questionsError } = await supabase
      .from('exam_questions')
      .insert(examQuestions)

    if (questionsError) {
      throw new Error(questionsError.message)
    }

    return { success: true, examId: examData.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create exam'
    }
  }
}

export async function getExams(userId: string): Promise<{ success: boolean; exams: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions (
          question_id,
          order_index,
          points,
          questions (
            id,
            type,
            text,
            difficulty,
            topic
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, exams: data }
  } catch (error) {
    return {
      success: false,
      exams: [],
      error: error instanceof Error ? error.message : 'Failed to fetch exams'
    }
  }
}

export async function getExam(examId: string, userId: string): Promise<{ success: boolean; exam?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions (
          question_id,
          order_index,
          points,
          questions (
            *,
            question_options (*)
          )
        )
      `)
      .eq('id', examId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, exam: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exam'
    }
  }
}

export async function startExamSession(examId: string, userId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('exam_sessions')
      .insert({
        exam_id: examId,
        user_id: userId,
        status: 'in_progress',
        current_question_index: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, sessionId: data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start exam session'
    }
  }
}

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answer: {
    answerText?: string
    selectedOptionId?: string
    isCorrect?: boolean
    pointsEarned?: number
    timeSpentSeconds?: number
    isFlagged?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_answers')
      .upsert({
        session_id: sessionId,
        question_id: questionId,
        answer_text: answer.answerText,
        selected_option_id: answer.selectedOptionId,
        is_correct: answer.isCorrect,
        points_earned: answer.pointsEarned || 0,
        time_spent_seconds: answer.timeSpentSeconds || 0,
        is_flagged: answer.isFlagged || false
      })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save answer'
    }
  }
}

export async function completeExamSession(
  sessionId: string,
  results: {
    totalQuestions: number
    questionsAnswered: number
    questionsCorrect: number
    totalPoints: number
    pointsEarned: number
    percentageScore: number
    timeTakenSeconds: number
    difficultyBreakdown?: any
    topicBreakdown?: any
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update session status
    const { error: sessionError } = await supabase
      .from('exam_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    // Get session details for results
    const { data: session, error: sessionFetchError } = await supabase
      .from('exam_sessions')
      .select('user_id, exam_id')
      .eq('id', sessionId)
      .single()

    if (sessionFetchError) {
      throw new Error(sessionFetchError.message)
    }

    // Save results
    const { error: resultsError } = await supabase
      .from('exam_results')
      .insert({
        session_id: sessionId,
        user_id: session.user_id,
        exam_id: session.exam_id,
        total_questions: results.totalQuestions,
        questions_answered: results.questionsAnswered,
        questions_correct: results.questionsCorrect,
        total_points: results.totalPoints,
        points_earned: results.pointsEarned,
        percentage_score: results.percentageScore,
        time_taken_seconds: results.timeTakenSeconds,
        difficulty_breakdown: results.difficultyBreakdown || {},
        topic_breakdown: results.topicBreakdown || {}
      })

    if (resultsError) {
      throw new Error(resultsError.message)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete exam session'
    }
  }
}

export async function getExamResults(userId: string, limit: number = 10): Promise<{ success: boolean; results: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exams (
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, results: data }
  } catch (error) {
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Failed to fetch results'
    }
  }
}

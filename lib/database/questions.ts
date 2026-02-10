import { createClient } from '@supabase/supabase-js'
import { Question } from '@/lib/questions/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function saveQuestion(question: Question, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Sanitize text content to prevent Unicode escape sequence issues
    const sanitizeText = (text: string | undefined): string | undefined => {
      if (!text) return text
      // Replace problematic Unicode escape sequences and normalize text
      return text
        .replace(/\\u[\dA-Fa-f]{4}/g, '') // Remove Unicode escape sequences
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .trim()
    }

    // Use simple approach for now - revert to original implementation
    // Insert main question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        id: question.id,
        user_id: userId,
        file_id: question.file_id || question.metadata?.sourceChunk || `legacy-${Date.now()}`,
        course_id: question.course_id || null,
        subject_tag: question.subject_tag || null,
        document_title: question.document_title || null,
        type: question.type,
        text: sanitizeText(question.text) || question.text,
        correct_answer: sanitizeText(question.correctAnswer) || question.correctAnswer,
        explanation: sanitizeText(question.explanation) || question.explanation,
        difficulty: question.difficulty,
        topic: sanitizeText(question.topic) || question.topic,
        keywords: question.keywords,
        source_content: sanitizeText(question.sourceContent) || question.sourceContent,
        metadata: question.metadata
      })
      .select()
      .single()

    if (questionError) {
      throw new Error(questionError.message)
    }

    // Insert options for multiple choice questions
    if (question.options && question.options.length > 0) {
      const optionsData = question.options.map(option => ({
        question_id: question.id,
        text: sanitizeText(option.text) || option.text,
        is_correct: option.isCorrect,
        explanation: sanitizeText(option.explanation) || option.explanation
      }))

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsData)

      if (optionsError) {
        throw new Error(optionsError.message)
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save question'
    }
  }
}

export async function saveQuestions(questions: Question[], userId: string): Promise<{ success: boolean; saved: number; error?: string }> {
  let saved = 0
  const errors: string[] = []
  
  console.log(`Attempting to save ${questions.length} questions for user ${userId}`)
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    if (!question) {
      console.error(`❌ Question at index ${i} is undefined`)
      continue
    }
    console.log(`Saving question ${i + 1}/${questions.length}: ${question.id}`)
    
    const result = await saveQuestion(question, userId)
    if (result.success) {
      saved++
      console.log(`✅ Question ${i + 1} saved successfully`)
    } else {
      console.error(`❌ Failed to save question ${i + 1} (${question.id}):`, result.error)
      errors.push(`Question ${i + 1}: ${result.error}`)
    }
  }

  const result: { success: boolean; saved: number; error?: string } = {
    success: saved > 0,
    saved
  }
  
  if (saved === 0) {
    result.error = `No questions were saved. Errors: ${errors.join('; ')}`
  } else if (errors.length > 0) {
    console.warn(`Partial save: ${saved}/${questions.length} questions saved. Errors: ${errors.join('; ')}`)
  }
  
  console.log(`Save operation completed: ${saved}/${questions.length} questions saved`)
  return result
}

export async function getQuestions(userId: string, filters?: {
  type?: string
  difficulty?: string
  topic?: string
  fileId?: string
  courseId?: string
  subjectTag?: string
  limit?: number
}): Promise<{ success: boolean; questions: Question[]; error?: string }> {
  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.topic) {
      query = query.eq('topic', filters.topic)
    }
    if (filters?.fileId) {
      query = query.eq('file_id', filters.fileId)
    }
    if (filters?.courseId) {
      query = query.eq('course_id', filters.courseId)
    }
    if (filters?.subjectTag) {
      query = query.eq('subject_tag', filters.subjectTag)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      // Check if it's a missing column error
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return {
          success: false,
          questions: [],
          error: 'Database schema outdated. Please run the migration script to add missing course-specific fields. See /setup page for instructions.'
        }
      }
      throw new Error(error.message)
    }

    const questions: Question[] = data.map(row => ({
      id: row.id,
      type: row.type,
      text: row.text,
      options: row.question_options?.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.is_correct,
        explanation: opt.explanation || undefined
      })),
      correctAnswer: row.correct_answer || undefined,
      explanation: row.explanation || undefined,
      difficulty: row.difficulty,
      topic: row.topic || undefined,
      keywords: row.keywords || [],
      sourceContent: row.source_content || '',
      metadata: row.metadata,
      file_id: row.file_id || undefined,
      course_id: row.course_id || undefined,
      subject_tag: row.subject_tag || undefined,
      document_title: row.document_title || undefined
    }))

    return { success: true, questions }
  } catch (error) {
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch questions'
    }
  }
}

export async function deleteQuestion(questionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete question'
    }
  }
}

export async function getQuestionStats(userId: string): Promise<{
  total: number
  byType: Record<string, number>
  byDifficulty: Record<string, number>
  byTopic: Record<string, number>
}> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('type, difficulty, topic')
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    const stats = {
      total: data.length,
      byType: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byTopic: {} as Record<string, number>
    }

    data.forEach(question => {
      stats.byType[question.type] = (stats.byType[question.type] || 0) + 1
      stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1
      if (question.topic) {
        stats.byTopic[question.topic] = (stats.byTopic[question.topic] || 0) + 1
      }
    })

    return stats
  } catch (error) {
    return {
      total: 0,
      byType: {},
      byDifficulty: {},
      byTopic: {}
    }
  }
}

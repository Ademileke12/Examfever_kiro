import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: examId } = await context.params

    // Get exam details - MUST be owned by the authenticated user
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('user_id', user.id) // Authorization check
      .single()

    if (examError) {
      if (examError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Exam not found or unauthorized'
        }, { status: 404 })
      }
      throw new Error(examError.message)
    }

    // Get exam questions
    const { data: examQuestions, error: questionsError } = await supabase
      .from('exam_questions')
      .select(`
        *,
        questions (
          *,
          question_options (*)
        )
      `)
      .eq('exam_id', examId)
      .order('order_index')

    if (questionsError) {
      console.error('Error fetching exam questions:', questionsError)
      return NextResponse.json({
        success: true,
        data: {
          ...exam,
          questions: [],
          message: 'Exam found but questions could not be loaded.'
        }
      })
    }

    // Transform questions
    const questions = examQuestions.map(eq => {
      const question = (eq as any).questions
      return {
        id: question.id,
        text: question.text,
        type: question.type,
        answers: question.question_options?.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.is_correct
        })) || [],
        difficulty: question.difficulty,
        topic: question.topic,
        explanation: question.explanation
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...exam,
        questions
      }
    })

  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exam'
    }, { status: 500 })
  }
}
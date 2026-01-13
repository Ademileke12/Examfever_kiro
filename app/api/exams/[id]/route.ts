import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await context.params

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (examError) {
      if (examError.message?.includes('does not exist') || examError.message?.includes('relation') || examError.message?.includes('table')) {
        return NextResponse.json({
          success: false,
          error: 'Database not set up. Please complete database setup first.',
          setupRequired: true
        }, { status: 503 })
      }
      throw new Error(examError.message)
    }

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: 'Exam not found'
      }, { status: 404 })
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
      // Return exam without questions if questions table doesn't exist
      return NextResponse.json({
        success: true,
        data: {
          ...exam,
          questions: [],
          message: 'Exam found but questions could not be loaded. Database setup may be incomplete.'
        }
      })
    }

    // Transform questions to match the expected format
    const questions = examQuestions.map(eq => {
      const question = eq.questions
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
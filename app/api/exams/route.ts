import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      timeLimit,
      difficultyDistribution,
      questionTypes,
      selectedQuestions
    } = body

    if (!title || !selectedQuestions || selectedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Remove duplicates from selected questions
    const uniqueQuestionIds = Array.from(new Set(selectedQuestions))

    // Create exam
    const examId = generateId()
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        id: examId,
        user_id: session.user.id,
        title,
        description: description || null,
        time_limit_minutes: timeLimit || 60,
        total_questions: uniqueQuestionIds.length,
        difficulty_distribution: difficultyDistribution,
        question_types: questionTypes,
        status: 'active'
      })
      .select()
      .single()

    if (examError) {
      throw new Error(examError.message)
    }

    // Add questions to exam with proper deduplication
    const examQuestions = uniqueQuestionIds.map((questionId, index) => ({
      id: generateId(),
      exam_id: examData.id,
      question_id: questionId as string,
      order_index: index + 1,
      points: 1
    }))

    const { error: questionsError } = await supabase
      .from('exam_questions')
      .insert(examQuestions)

    if (questionsError) {
      throw new Error(questionsError.message || 'Failed to insert exam questions')
    }

    return NextResponse.json({
      success: true,
      data: {
        examId: examData.id,
        exam: examData
      }
    })

  } catch (error) {
    console.error('Exam creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create exam'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: exams, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions (
          question_id,
          order_index,
          points
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: { exams }
    })

  } catch (error) {
    console.error('Exams fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exams'
      },
      { status: 500 }
    )
  }
}
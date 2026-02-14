import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { examResultSchema } from '@/lib/validation/schemas'
import { incrementUsage } from '@/lib/security/limit-check'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    const body = await request.json()

    const validation = examResultSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      examId,
      examTitle,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      timeLimitMinutes,
      userAnswers,
      startTime,
      endTime,
      bundleContext
    } = validation.data

    const studyTimeMinutes = Math.round(timeSpent / 60)

    // Save exam result for the authenticated user
    const { data: result, error: resultError } = await supabase
      .from('exam_results')
      .insert({
        user_id: userId,
        exam_id: examId,
        exam_title: examTitle,
        score: score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_spent_seconds: timeSpent,
        time_limit_minutes: timeLimitMinutes,
        user_answers: userAnswers,
        started_at: startTime,
        completed_at: endTime,
        study_time_minutes: studyTimeMinutes,
        bundle_context: bundleContext || {}
      })
      .select()
      .single()

    if (resultError) {
      console.error('Error saving exam result:', resultError)
      return NextResponse.json(
        { success: false, error: 'Failed to save exam result' },
        { status: 500 }
      )
    }

    // Increment usage counter only upon successful submission
    await incrementUsage('exam')

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Exam result API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent exam results only for the authenticated user
    const { data: results, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching exam results:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exam results' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: results || []
    })

  } catch (error) {
    console.error('Exam results fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
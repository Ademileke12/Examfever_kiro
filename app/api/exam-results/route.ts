import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
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
    } = body

    if (!userId || !examId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate study time in minutes
    const studyTimeMinutes = Math.round(timeSpent / 60)
    
    // Save exam result
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

    // If this was a bundle-based exam, log bundle access for analytics
    if (bundleContext && bundleContext.bundleIds && bundleContext.bundleIds.length > 0) {
      const bundleAccessLogs = bundleContext.bundleIds.map((bundleId: string) => ({
        user_id: userId,
        file_id: bundleId,
        action: 'exam_take',
        metadata: {
          examId,
          score,
          correctAnswers,
          totalQuestions,
          timeSpent,
          timestamp: new Date().toISOString()
        }
      }))

      await supabase
        .from('bundle_access_log')
        .insert(bundleAccessLogs)
    }

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get recent exam results
    const { data: results, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', userId)
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
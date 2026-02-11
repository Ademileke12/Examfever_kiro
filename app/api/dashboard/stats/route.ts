import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get exam statistics for the authenticated user
    const { data: examResults, error: examError } = await supabase
      .from('exam_results')
      .select('score, study_time_minutes, completed_at')
      .eq('user_id', user.id)

    if (examError) {
      console.error('Error fetching exam stats:', examError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exam statistics' },
        { status: 500 }
      )
    }

    const results = examResults || []

    // Calculate statistics
    const totalExams = results.length
    const totalStudyHours = Math.round(results.reduce((sum, result) => sum + (result.study_time_minutes || 0), 0) / 60 * 10) / 10
    const averageScore = totalExams > 0
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalExams)
      : 0

    // Calculate achievements (simple scoring system)
    let achievements = 0
    if (totalExams >= 1) achievements++ // First exam
    if (totalExams >= 5) achievements++ // 5 exams milestone
    if (totalExams >= 10) achievements++ // 10 exams milestone
    if (averageScore >= 80) achievements++ // High performer
    if (averageScore >= 90) achievements++ // Excellence
    if (totalStudyHours >= 10) achievements++ // Study dedication
    if (totalStudyHours >= 25) achievements++ // Study master

    // Get recent exams (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentExams = results.filter(result =>
      new Date(result.completed_at) >= sevenDaysAgo
    ).length

    // Weekly progress (goal: 5 exams per week)
    const weeklyGoal = 5
    const weeklyProgress = Math.min((recentExams / weeklyGoal) * 100, 100)

    return NextResponse.json({
      success: true,
      data: {
        totalExams,
        totalStudyHours,
        averageScore,
        achievements,
        recentExams,
        weeklyProgress,
        weeklyGoal
      }
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
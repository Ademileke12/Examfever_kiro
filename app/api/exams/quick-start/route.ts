import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'
import { checkSubscriptionLimit, incrementUsage } from '@/lib/security/limit-check'

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

    // Check subscription limit for exams
    const limitCheck = await checkSubscriptionLimit('exam')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: limitCheck.error || 'Exam creation limit exceeded',
          remaining: limitCheck.remaining,
          total: limitCheck.total
        },
        { status: 403 }
      )
    }

    const { bundleId } = await request.json()

    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: 'Missing bundleId' },
        { status: 400 }
      )
    }

    // Get bundle information
    const { data: bundleData, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
      .eq('file_id', bundleId)
      .eq('user_id', user.id) // Use authenticated user ID
      .single()

    if (bundleError || !bundleData) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      )
    }

    // Get ALL questions from this bundle
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_id', bundleId)
      .order('created_at')

    if (questionsError) {
      throw new Error(questionsError.message)
    }

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions found in this bundle' },
        { status: 400 }
      )
    }

    // Remove duplicates (just in case)
    const uniqueQuestions = allQuestions.filter((question, index, self) =>
      index === self.findIndex(q => q.id === question.id)
    )

    console.log(`Quick-start exam: Using all ${uniqueQuestions.length} questions from bundle ${bundleData.name}`)

    // Create exam record with all questions
    const examId = generateId()
    const examTitle = `${bundleData.name} - Full Test`

    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        id: examId,
        user_id: user.id,
        title: examTitle,
        description: `Complete exam with all questions from ${bundleData.name}`,
        // removed source_file_ids as it does not exist in schema
        settings: {
          source_file_ids: [bundleId],
          is_quick_start: true
        },
        // removed bundle_context as it does not exist in schema based on migration 000
        // moving bundle context to settings or difficulty_distribution is already handled
        time_limit_minutes: 60, // Default 60 minutes
        total_questions: uniqueQuestions.length,
        difficulty_distribution: {
          easy: uniqueQuestions.filter(q => q.difficulty === 'easy').length,
          medium: uniqueQuestions.filter(q => q.difficulty === 'medium').length,
          hard: uniqueQuestions.filter(q => q.difficulty === 'hard').length
        },
        question_types: Array.from(new Set(uniqueQuestions.map(q => q.type))),
        status: 'active'
      })
      .select()
      .single()

    if (examError) {
      throw new Error(examError.message)
    }

    // Create exam-question associations for ALL questions
    const examQuestions = uniqueQuestions.map((question, index) => ({
      id: generateId(),
      exam_id: examId,
      question_id: question.id,
      order_index: index + 1,
      points: 1
    }))

    const { error: examQuestionsError } = await supabase
      .from('exam_questions')
      .insert(examQuestions)

    if (examQuestionsError) {
      throw new Error(examQuestionsError.message)
    }

    // Increment usage counter after successful exam creation
    await incrementUsage('exam')

    return NextResponse.json({
      success: true,
      examId: examId,
      exam: {
        id: examId,
        title: examTitle,
        totalQuestions: uniqueQuestions.length,
        timeLimitMinutes: 60,
        bundleName: bundleData.name
      }
    })

  } catch (error) {
    console.error('Quick-start exam creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create quick-start exam'
      },
      { status: 500 }
    )
  }
}
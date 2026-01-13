import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateId } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, bundleId } = await request.json()

    if (!userId || !bundleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get bundle information
    const { data: bundleData, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
      .eq('file_id', bundleId)
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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

    console.log(`Quick-start exam: Using all ${uniqueQuestions.length} questions from bundle ${bundleData.bundle_name}`)

    // Create exam record with all questions
    const examId = generateId()
    const examTitle = `${bundleData.bundle_name} - Full Test`
    
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        id: examId,
        user_id: userId,
        title: examTitle,
        description: `Complete exam with all questions from ${bundleData.bundle_name}`,
        source_file_ids: [bundleId],
        bundle_context: {
          bundleIds: [bundleId],
          bundleNames: [bundleData.bundle_name],
          bundleDistribution: { [bundleId]: uniqueQuestions.length },
          totalQuestions: uniqueQuestions.length
        },
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

    // Log bundle access for analytics
    await supabase
      .from('bundle_access_log')
      .insert({
        user_id: userId,
        file_id: bundleId,
        action: 'quick_exam_start',
        metadata: {
          examId,
          questionsUsed: uniqueQuestions.length,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      examId: examId,
      exam: {
        id: examId,
        title: examTitle,
        totalQuestions: uniqueQuestions.length,
        timeLimitMinutes: 60,
        bundleName: bundleData.bundle_name
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
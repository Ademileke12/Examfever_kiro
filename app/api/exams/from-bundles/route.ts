import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'

export interface BundleExamRequest {
  title: string
  description?: string
  bundleIds: string[]
  bundleDistribution: Record<string, number>
  timeLimitMinutes: number
  questionTypes: string[]
  difficultyDistribution: Record<string, number>
}

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

    const userId = user.id
    const {
      title,
      description,
      bundleIds,
      bundleDistribution,
      timeLimitMinutes,
      questionTypes,
      difficultyDistribution
    }: BundleExamRequest = await request.json()

    if (!title || !bundleIds || bundleIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get bundle information for the authenticated user
    const { data: bundleData, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
      .in('file_id', bundleIds)
      .eq('user_id', userId)

    if (bundleError) {
      throw new Error(bundleError.message)
    }

    // Select questions from each bundle
    const selectedQuestions: any[] = []
    const selectedQuestionIds = new Set<string>()

    for (const bundleId of bundleIds) {
      const questionsNeeded = bundleDistribution[bundleId] || 10

      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', userId)
        .eq('file_id', bundleId)
        .limit(questionsNeeded * 3)

      if (questionTypes && questionTypes.length > 0) {
        query = query.in('type', questionTypes)
      }

      const { data: bundleQuestions, error: questionsError } = await query

      if (questionsError) {
        throw new Error(questionsError.message)
      }

      if (!bundleQuestions || bundleQuestions.length === 0) continue

      const availableQuestions = bundleQuestions.filter(q => !selectedQuestionIds.has(q.id))

      let selectedFromBundle: any[] = []
      if (difficultyDistribution && Object.keys(difficultyDistribution).length > 0) {
        const totalDifficultyWeight = Object.values(difficultyDistribution).reduce((sum, weight) => sum + weight, 0)

        for (const [difficulty, weight] of Object.entries(difficultyDistribution)) {
          const questionsForDifficulty = Math.round((weight / totalDifficultyWeight) * questionsNeeded)
          const difficultyQuestions = availableQuestions
            .filter(q => q.difficulty === difficulty && !selectedQuestionIds.has(q.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, questionsForDifficulty)

          selectedFromBundle.push(...difficultyQuestions)
          difficultyQuestions.forEach(q => selectedQuestionIds.add(q.id))
        }
      } else {
        selectedFromBundle = availableQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, questionsNeeded)
        selectedFromBundle.forEach(q => selectedQuestionIds.add(q.id))
      }

      selectedQuestions.push(...selectedFromBundle)
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions could be selected' },
        { status: 400 }
      )
    }

    // Deduplicate
    const finalQuestions = selectedQuestions.filter((question, index, self) =>
      self.findIndex(q => q.id === question.id) === index
    )

    // Create exam record
    const examId = generateId()
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        id: examId,
        user_id: userId,
        title,
        description: description || '',
        settings: {
          source_file_ids: bundleIds,
          bundle_context: {
            bundleIds,
            bundleDistribution,
            bundleNames: bundleData.map(b => b.bundle_name),
            totalQuestions: finalQuestions.length
          }
        },
        time_limit_minutes: timeLimitMinutes,
        total_questions: finalQuestions.length,
        difficulty_distribution: difficultyDistribution || {},
        question_types: questionTypes || ['multiple-choice'],
        status: 'active'
      })
      .select()
      .single()

    if (examError) throw new Error(examError.message)

    // Create exam-question associations
    const examQuestions = finalQuestions.map((question, index) => ({
      id: generateId(),
      exam_id: examId,
      question_id: question.id,
      order_index: index + 1,
      points: 1
    }))

    const { error: examQuestionsError } = await supabase
      .from('exam_questions')
      .insert(examQuestions)

    if (examQuestionsError) throw new Error(examQuestionsError.message)

    await incrementUsage('exam')

    return NextResponse.json({
      success: true,
      exam: {
        id: examId,
        title,
        description,
        totalQuestions: finalQuestions.length,
        createdAt: examData.created_at
      }
    })

  } catch (error) {
    console.error('Bundle exam creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}
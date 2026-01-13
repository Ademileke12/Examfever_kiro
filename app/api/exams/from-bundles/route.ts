import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateId } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BundleExamRequest {
  userId: string
  title: string
  description?: string
  bundleIds: string[]
  bundleDistribution: Record<string, number>
  timeLimitMinutes: number
  questionTypes: string[]
  difficultyDistribution: Record<string, number>
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      title,
      description,
      bundleIds,
      bundleDistribution,
      timeLimitMinutes,
      questionTypes,
      difficultyDistribution
    }: BundleExamRequest = await request.json()

    if (!userId || !title || !bundleIds || bundleIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get bundle information
    const { data: bundleData, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
      .in('file_id', bundleIds)
      .eq('user_id', userId)

    if (bundleError) {
      throw new Error(bundleError.message)
    }

    // Calculate total questions needed
    const totalQuestionsNeeded = Object.values(bundleDistribution).reduce((sum, count) => sum + count, 0)

    // Select questions from each bundle
    const selectedQuestions: any[] = []
    const selectedQuestionIds = new Set<string>() // Track selected question IDs to prevent duplicates
    const bundleSelectionLog: Record<string, { requested: number, available: number, selected: number }> = {}
    
    for (const bundleId of bundleIds) {
      const questionsNeeded = bundleDistribution[bundleId] || 10
      
      // Get questions from this bundle
      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', userId)
        .eq('file_id', bundleId)
        .limit(questionsNeeded * 3) // Get more than needed for better selection and duplicate avoidance

      // Apply question type filter if specified
      if (questionTypes && questionTypes.length > 0) {
        query = query.in('type', questionTypes)
      }

      const { data: bundleQuestions, error: questionsError } = await query

      if (questionsError) {
        throw new Error(questionsError.message)
      }

      if (!bundleQuestions || bundleQuestions.length === 0) {
        bundleSelectionLog[bundleId] = { requested: questionsNeeded, available: 0, selected: 0 }
        console.warn(`No questions found in bundle ${bundleId}`)
        continue
      }

      // Filter out already selected questions to prevent duplicates
      const availableQuestions = bundleQuestions.filter(q => !selectedQuestionIds.has(q.id))
      bundleSelectionLog[bundleId] = { 
        requested: questionsNeeded, 
        available: availableQuestions.length, 
        selected: 0 
      }

      if (availableQuestions.length === 0) {
        console.warn(`All questions from bundle ${bundleId} were already selected from other bundles`)
        continue
      }

      // Apply difficulty distribution if specified
      let selectedFromBundle: any[] = []
      
      if (difficultyDistribution && Object.keys(difficultyDistribution).length > 0) {
        // Select questions based on difficulty distribution
        const totalDifficultyWeight = Object.values(difficultyDistribution).reduce((sum, weight) => sum + weight, 0)
        
        for (const [difficulty, weight] of Object.entries(difficultyDistribution)) {
          const questionsForDifficulty = Math.round((weight / totalDifficultyWeight) * questionsNeeded)
          const difficultyQuestions = availableQuestions
            .filter(q => q.difficulty === difficulty && !selectedQuestionIds.has(q.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, questionsForDifficulty)
          
          selectedFromBundle.push(...difficultyQuestions)
          // Track selected question IDs
          difficultyQuestions.forEach(q => selectedQuestionIds.add(q.id))
        }
      } else {
        // Random selection
        selectedFromBundle = availableQuestions
          .filter(q => !selectedQuestionIds.has(q.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, questionsNeeded)
        
        // Track selected question IDs
        selectedFromBundle.forEach(q => selectedQuestionIds.add(q.id))
      }

      bundleSelectionLog[bundleId].selected = selectedFromBundle.length
      selectedQuestions.push(...selectedFromBundle)
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions could be selected from the specified bundles' },
        { status: 400 }
      )
    }

    // Final deduplication step using both ID and content comparison
    const uniqueQuestions = selectedQuestions.filter((question, index, self) => {
      // First check by ID
      const firstOccurrenceById = self.findIndex(q => q.id === question.id)
      if (firstOccurrenceById !== index) return false
      
      // Then check by content to catch any potential duplicates with different IDs
      const firstOccurrenceByContent = self.findIndex(q => 
        q.text.trim().toLowerCase() === question.text.trim().toLowerCase() &&
        q.type === question.type
      )
      return firstOccurrenceByContent === index
    })

    console.log(`Bundle exam creation summary:`)
    console.log(`- Total questions selected: ${selectedQuestions.length}`)
    console.log(`- Unique questions after deduplication: ${uniqueQuestions.length}`)
    console.log(`- Bundle selection details:`, bundleSelectionLog)
    console.log(`- Duplicates removed: ${selectedQuestions.length - uniqueQuestions.length}`)

    // Use unique questions for exam creation
    const finalQuestions = uniqueQuestions

    // Create exam record
    const examId = generateId()
    
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        id: examId,
        user_id: userId,
        title,
        description: description || '',
        source_file_ids: bundleIds,
        bundle_context: {
          bundleIds,
          bundleDistribution,
          bundleNames: bundleData.map(b => b.bundle_name),
          totalQuestions: finalQuestions.length
        },
        time_limit_minutes: timeLimitMinutes,
        total_questions: finalQuestions.length,
        difficulty_distribution: difficultyDistribution || {},
        question_types: questionTypes || ['multiple-choice'], // Default to only multiple-choice
        status: 'active'
      })
      .select()
      .single()

    if (examError) {
      throw new Error(examError.message)
    }

    // Create exam-question associations
    const examQuestions = finalQuestions.map((question, index) => ({
      id: generateId(), // Add proper UUID for exam_questions table
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
    const bundleAccessLogs = bundleIds.map(bundleId => ({
      user_id: userId,
      file_id: bundleId,
      action: 'exam_create',
      metadata: {
        examId,
        questionsSelected: bundleDistribution[bundleId] || 0,
        timestamp: new Date().toISOString()
      }
    }))

    await supabase
      .from('bundle_access_log')
      .insert(bundleAccessLogs)

    return NextResponse.json({
      success: true,
      exam: {
        id: examId,
        title,
        description,
        bundleContext: examData.bundle_context,
        totalQuestions: finalQuestions.length,
        timeLimitMinutes,
        createdAt: examData.created_at
      }
    })

  } catch (error) {
    console.error('Bundle exam creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create bundle exam' 
      },
      { status: 500 }
    )
  }
}
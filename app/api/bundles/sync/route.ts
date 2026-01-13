import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Syncing bundles for user:', userId)

    // Get all questions grouped by file_id
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('file_id, document_title, subject_tag, difficulty, created_at')
      .eq('user_id', userId)

    if (questionsError) {
      throw new Error(questionsError.message)
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No questions found to create bundles from',
        bundlesCreated: 0
      })
    }

    // Group questions by file_id
    const questionsByFile = questions.reduce((acc: Record<string, any[]>, question) => {
      const fileId = question.file_id
      if (!acc[fileId]) {
        acc[fileId] = []
      }
      acc[fileId].push(question)
      return acc
    }, {})

    let bundlesCreated = 0
    const results = []

    // Create bundles for each file_id
    for (const [fileId, fileQuestions] of Object.entries(questionsByFile)) {
      try {
        // Check if bundle already exists
        const { data: existingBundle } = await supabase
          .from('question_bundles')
          .select('file_id')
          .eq('file_id', fileId)
          .eq('user_id', userId)
          .single()

        if (existingBundle) {
          console.log(`Bundle already exists for file: ${fileId}`)
          continue
        }

        // Calculate bundle metadata
        const questionCount = fileQuestions.length
        const difficultyDistribution: Record<string, number> = {}
        
        fileQuestions.forEach(q => {
          const difficulty = q.difficulty || 'medium'
          difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1
        })

        // Get bundle name from first question's document_title or use file_id
        const bundleName = fileQuestions[0]?.document_title || fileId.replace(/^file-/, '').replace(/-[a-z0-9]+$/, '')
        const subjectTag = fileQuestions[0]?.subject_tag || 'general'
        const uploadDate = fileQuestions[0]?.created_at || new Date().toISOString()

        // Create bundle
        const { data: bundleData, error: bundleError } = await supabase
          .from('question_bundles')
          .insert({
            file_id: fileId,
            user_id: userId,
            bundle_name: bundleName,
            subject_tag: subjectTag,
            question_count: questionCount,
            difficulty_distribution: difficultyDistribution,
            upload_date: uploadDate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              syncedFromQuestions: true,
              questionCount: questionCount
            }
          })
          .select()
          .single()

        if (bundleError) {
          console.error(`Failed to create bundle for ${fileId}:`, bundleError.message)
          results.push({
            fileId,
            success: false,
            error: bundleError.message
          })
        } else {
          console.log(`Created bundle: ${bundleName} (${questionCount} questions)`)
          bundlesCreated++
          results.push({
            fileId,
            success: true,
            bundleName,
            questionCount
          })
        }

      } catch (error) {
        console.error(`Error processing file ${fileId}:`, error)
        results.push({
          fileId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bundle sync completed. Created ${bundlesCreated} new bundles.`,
      bundlesCreated,
      totalFiles: Object.keys(questionsByFile).length,
      results
    })

  } catch (error) {
    console.error('Bundle sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bundle sync failed' 
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { saveQuestions } from '@/lib/database/questions'
import { generateId } from '@/lib/utils'
import type { DifficultyLevel } from '@/lib/questions/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to calculate difficulty distribution
function calculateDifficultyDistribution(questions: any[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  
  questions.forEach(question => {
    const difficulty = question.difficulty || 'medium'
    distribution[difficulty] = (distribution[difficulty] || 0) + 1
  })
  
  return distribution
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    console.log(`Testing PDF workflow with fileId: ${fileId}`)

    // Create test questions similar to what the enhanced offline generator would create
    const testQuestions = []
    for (let i = 0; i < 5; i++) {
      const question = {
        id: generateId(),
        type: 'multiple-choice' as const,
        text: `Test question ${i + 1} from csc_201 document`,
        options: [
          { id: 'a', text: 'Correct answer for software engineering', isCorrect: true },
          { id: 'b', text: 'Incorrect option B', isCorrect: false },
          { id: 'c', text: 'Incorrect option C', isCorrect: false },
          { id: 'd', text: 'Incorrect option D', isCorrect: false }
        ],
        difficulty: (['easy', 'medium', 'hard'] as const)[i % 3] as DifficultyLevel,
        topic: 'Software Engineering',
        keywords: ['software', 'engineering', 'csc'],
        sourceContent: `Test content from csc_201 document for question ${i + 1}`,
        explanation: `This tests software engineering concepts from csc_201.`,
        file_id: fileId,
        course_id: 'csc_201_software',
        subject_tag: 'computer_science',
        document_title: 'csc_201_software',
        metadata: {
          generatedAt: new Date(),
          model: 'enhanced-local-generator',
          confidence: 0.85,
          qualityScore: 0.8,
          processingTime: 100,
          sourceChunk: `test-chunk-${i}`,
          contentHash: `test-hash-${i}`
        }
      }
      testQuestions.push(question)
    }

    console.log(`Created ${testQuestions.length} test questions`)

    // Save questions to database
    console.log('Saving questions to database...')
    const saveResult = await saveQuestions(testQuestions, userId)
    console.log(`Save result:`, saveResult)

    if (saveResult.saved === 0) {
      console.error('No questions were saved! This indicates a database issue.')
      return NextResponse.json({
        success: false,
        error: saveResult.error,
        details: 'Question saving failed'
      }, { status: 500 })
    }

    // Create bundle entry for the questions
    console.log('Creating bundle entry...')
    try {
      const bundleData = {
        file_id: fileId,
        user_id: userId,
        bundle_name: 'csc_201_software',
        subject_tag: 'computer_science',
        question_count: saveResult.saved,
        difficulty_distribution: calculateDifficultyDistribution(testQuestions),
        upload_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          originalFilename: 'csc_201.pdf',
          fileSize: 1024000,
          processingMethod: 'test-workflow'
        }
      }
      
      console.log('Bundle data to insert:', bundleData)
      
      const { data: bundleResult, error: bundleError } = await supabase
        .from('question_bundles')
        .upsert(bundleData)
        .select()
        .single()

      if (bundleError) {
        console.error('Bundle creation failed:', bundleError.message)
        return NextResponse.json({
          success: false,
          error: bundleError.message,
          details: 'Bundle creation failed',
          questionsSaved: saveResult.saved
        }, { status: 500 })
      } else {
        console.log('Bundle created successfully:', bundleResult?.bundle_name)
        
        return NextResponse.json({
          success: true,
          message: 'Test PDF workflow completed successfully',
          data: {
            fileId,
            questionsGenerated: testQuestions.length,
            questionsSaved: saveResult.saved,
            bundleCreated: true,
            bundleName: bundleResult?.bundle_name
          }
        })
      }
    } catch (bundleError) {
      console.error('Bundle creation exception:', bundleError)
      return NextResponse.json({
        success: false,
        error: bundleError instanceof Error ? bundleError.message : 'Bundle creation failed',
        details: 'Bundle creation exception',
        questionsSaved: saveResult.saved
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test PDF workflow error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test workflow failed' 
      },
      { status: 500 }
    )
  }
}
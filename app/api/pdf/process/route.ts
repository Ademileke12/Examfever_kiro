import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPDF } from '@/lib/pdf/processor'
import { questionGenerator } from '@/lib/ai/question-generator'
import { saveQuestions } from '@/lib/database/questions'
import { QuestionGenerationRequest } from '@/lib/questions/types'
import { withTimeout, Timeouts, TimeoutError } from '@/lib/security/timeout'

// Helper function to calculate difficulty distribution
function calculateDifficultyDistribution(questions: any[]): Record<string, number> {
  const distribution: Record<string, number> = {}

  questions.forEach(question => {
    const difficulty = question.difficulty || 'medium'
    distribution[difficulty] = (distribution[difficulty] || 0) + 1
  })

  return distribution
}

// Helper function to extract course metadata from filename and content
function extractCourseMetadata(filename: string, content: string) {
  const cleanFilename = filename.replace(/\.[^/.]+$/, '')

  const subjectPatterns = {
    'mathematics': /math|calculus|algebra|geometry|statistics|trigonometry/i,
    'chemistry': /chemistry|chemical|organic|inorganic|biochemistry/i,
    'physics': /physics|mechanics|thermodynamics|quantum|electromagnetism/i,
    'biology': /biology|anatomy|physiology|genetics|ecology|botany/i,
    'computer_science': /computer|programming|algorithm|software|coding|javascript|python|java/i,
    'history': /history|historical|ancient|medieval|modern|civilization/i,
    'literature': /literature|english|writing|poetry|novel|shakespeare/i,
    'economics': /economics|economic|finance|business|accounting|marketing/i,
    'psychology': /psychology|psychological|cognitive|behavioral|mental/i,
    'engineering': /engineering|mechanical|electrical|civil|structural/i
  }

  let subjectTag = 'general'
  let courseId = cleanFilename.toLowerCase().replace(/[^a-z0-9]/g, '_')

  for (const [subject, pattern] of Object.entries(subjectPatterns)) {
    if (pattern.test(filename) || pattern.test(content.substring(0, 1000))) {
      subjectTag = subject
      break
    }
  }

  const courseCodeMatch = filename.match(/([A-Z]{2,4}\s*\d{3,4})/i)
  if (courseCodeMatch && courseCodeMatch[1]) {
    courseId = courseCodeMatch[1].replace(/\s+/g, '').toLowerCase()
  }

  return {
    courseId,
    subjectTag,
    documentTitle: cleanFilename
  }
}

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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Starting PDF processing for file: ${file.name} for user: ${user.id}`)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Process PDF with timeout
    let processingResult
    try {
      processingResult = await withTimeout(
        extractTextFromPDF(buffer, fileId),
        Timeouts.DRAG,
        'PDF text extraction timed out'
      )
    } catch (error) {
      if (error instanceof TimeoutError) {
        return NextResponse.json({ success: false, error: 'Request timed out during PDF extraction' }, { status: 504 })
      }
      throw error
    }

    if (processingResult.status === 'failed') {
      return NextResponse.json({ success: false, error: 'PDF processing failed' }, { status: 500 })
    }

    const updatedCourseMetadata = extractCourseMetadata(file.name, processingResult.text)

    // Generate questions with timeout
    const generationRequest: QuestionGenerationRequest = {
      content: processingResult.text,
      questionTypes: ['multiple-choice'],
      difficulty: ['easy', 'medium', 'hard'],
      maxQuestions: 15,
      userId: user.id,
      fileId
    }

    let questionResult
    try {
      questionResult = await withTimeout(
        questionGenerator.generateQuestions(generationRequest),
        Timeouts.SLOW,
        'Question generation timed out'
      )

      if (!questionResult.success) {
        return NextResponse.json({
          success: true,
          data: {
            ...processingResult,
            courseMetadata: updatedCourseMetadata,
            questionGeneration: {
              success: false,
              error: questionResult.error,
              questionsGenerated: 0
            }
          }
        })
      }
    } catch (error) {
      console.error('Question generation error:', error)
      const errorMsg = error instanceof TimeoutError ? 'Question generation timed out' : (error instanceof Error ? error.message : 'Generation failed')
      return NextResponse.json({
        success: true,
        data: {
          ...processingResult,
          courseMetadata: updatedCourseMetadata,
          questionGeneration: {
            success: false,
            error: errorMsg,
            questionsGenerated: 0,
            fallbackUsed: true
          }
        }
      })
    }

    // Add metadata and user ID to questions
    const questionsWithMetadata = questionResult.questions.map((question: any) => ({
      ...question,
      user_id: user.id,
      file_id: fileId,
      course_id: updatedCourseMetadata.courseId,
      subject_tag: updatedCourseMetadata.subjectTag,
      document_title: updatedCourseMetadata.documentTitle
    }))

    // Save questions to database
    const saveResult = await saveQuestions(questionsWithMetadata, user.id)

    // Create bundle entry
    if (saveResult.saved > 0) {
      try {
        const bundleData = {
          file_id: fileId,
          user_id: user.id,
          bundle_name: updatedCourseMetadata.documentTitle,
          subject_tag: updatedCourseMetadata.subjectTag,
          question_count: saveResult.saved,
          difficulty_distribution: calculateDifficultyDistribution(questionsWithMetadata),
          upload_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            originalFilename: file.name,
            fileSize: file.size,
            processingMethod: 'authenticated-server-side'
          }
        }

        await supabase.from('question_bundles').upsert(bundleData)
      } catch (bundleError) {
        console.error('Bundle creation error:', bundleError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...processingResult,
        courseMetadata: updatedCourseMetadata,
        questionGeneration: {
          success: true,
          questionsGenerated: questionResult.questions.length,
          questionsSaved: saveResult.saved,
          processingMethod: 'authenticated'
        }
      }
    })

  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      },
      { status: 500 }
    )
  }
}

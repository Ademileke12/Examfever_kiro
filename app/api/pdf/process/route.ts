import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractTextFromPDF } from '@/lib/pdf/processor'
import { questionGenerator } from '@/lib/ai/question-generator'
import { saveQuestions } from '@/lib/database/questions'
import { QuestionGenerationRequest } from '@/lib/questions/types'

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

// Helper function to extract course metadata from filename and content
function extractCourseMetadata(filename: string, content: string) {
  // Extract course info from filename
  const cleanFilename = filename.replace(/\.[^/.]+$/, '') // Remove extension
  
  // Common subject patterns
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
  
  // Try to identify subject from filename and content
  let subjectTag = 'general'
  let courseId = cleanFilename.toLowerCase().replace(/[^a-z0-9]/g, '_')
  
  for (const [subject, pattern] of Object.entries(subjectPatterns)) {
    if (pattern.test(filename) || pattern.test(content.substring(0, 1000))) {
      subjectTag = subject
      break
    }
  }
  
  // Extract potential course codes (e.g., MATH101, CS202)
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`Starting PDF processing for file: ${file.name}`)

    // Convert file to buffer for direct processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    console.log(`Processing PDF with fileId: ${fileId}`)

    // Extract course metadata from filename and content preview
    const courseMetadata = extractCourseMetadata(file.name, '')

    // Process PDF directly from buffer
    console.log('Extracting text from PDF...')
    const processingResult = await extractTextFromPDF(buffer, fileId)

    if (processingResult.status === 'failed') {
      console.error('PDF text extraction failed')
      return NextResponse.json(
        { 
          success: false, 
          error: 'PDF processing failed',
          details: 'Unable to extract text from PDF'
        },
        { status: 500 }
      )
    }

    console.log(`Text extracted successfully. Length: ${processingResult.text.length} characters`)

    // Update course metadata with content analysis
    const updatedCourseMetadata = extractCourseMetadata(file.name, processingResult.text)

    // Generate questions from extracted text
    console.log('Starting AI question generation...')
    const generationRequest: QuestionGenerationRequest = {
      content: processingResult.text,
      questionTypes: ['multiple-choice'], // Only generate multiple-choice questions
      difficulty: ['easy', 'medium', 'hard'],
      maxQuestions: 15, // Reduced from 30 to 15 for faster processing with 3 batches of 5
      userId,
      fileId
    }

    let questionResult
    let timeoutId: NodeJS.Timeout | null = null
    
    try {
      // Add timeout for question generation (increased to 90s)
      const questionPromise = questionGenerator.generateQuestions(generationRequest)
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Question generation timeout after 90s'))
        }, 90000)
      })
      
      questionResult = await Promise.race([
        questionPromise.then(result => {
          if (timeoutId) clearTimeout(timeoutId)
          return result
        }),
        timeoutPromise
      ]) as any

      if (!questionResult.success) {
        console.warn('Question generation failed:', questionResult.error)
        // Return PDF processing success even if question generation fails
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

      console.log(`Generated ${questionResult.questions.length} questions successfully`)

    } catch (error) {
      console.error('Question generation error:', error)
      // Return PDF processing success with fallback questions
      return NextResponse.json({
        success: true,
        data: {
          ...processingResult,
          courseMetadata: updatedCourseMetadata,
          questionGeneration: {
            success: false,
            error: error instanceof Error ? error.message : 'Question generation failed',
            questionsGenerated: 0,
            fallbackUsed: true,
            message: 'PDF processed successfully. AI question generation timed out, but you can still create exams manually from the extracted text.'
          }
        }
      })
    }

    // Add course metadata to questions before saving
    const questionsWithMetadata = questionResult.questions.map((question: any) => ({
      ...question,
      file_id: fileId,
      course_id: updatedCourseMetadata.courseId,
      subject_tag: updatedCourseMetadata.subjectTag,
      document_title: updatedCourseMetadata.documentTitle,
      metadata: {
        ...question.metadata,
        courseMetadata: updatedCourseMetadata
      }
    }))

    // Save questions to database
    console.log('Saving questions to database...')
    const saveResult = await saveQuestions(questionsWithMetadata, userId)
    console.log(`Save result:`, saveResult)
    console.log(`Saved ${saveResult.saved} questions to database`)

    if (saveResult.saved === 0) {
      console.error('No questions were saved! This indicates a database issue.')
      console.error('Save result details:', saveResult)
    }

    // Create bundle entry for the questions
    if (saveResult.saved > 0) {
      console.log('Creating bundle entry...')
      try {
        // Create bundle directly in database instead of HTTP call
        const bundleData = {
          file_id: fileId,
          user_id: userId,
          bundle_name: updatedCourseMetadata.documentTitle,
          subject_tag: updatedCourseMetadata.subjectTag,
          question_count: saveResult.saved,
          difficulty_distribution: calculateDifficultyDistribution(questionsWithMetadata),
          upload_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            originalFilename: file.name,
            fileSize: file.size,
            processingMethod: 'enhanced-offline-generation'
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
          console.error('Bundle error details:', bundleError)
        } else {
          console.log('Bundle created successfully:', bundleResult?.bundle_name || updatedCourseMetadata.documentTitle)
          console.log('Bundle result:', bundleResult)
        }
      } catch (bundleError) {
        console.error('Bundle creation exception:', bundleError)
      }
    } else {
      console.warn('No questions were saved, skipping bundle creation')
    }

    // Since we're processing directly, no PDF cleanup needed
    // The file only exists in memory during processing

    return NextResponse.json({
      success: true,
      data: {
        ...processingResult,
        courseMetadata: updatedCourseMetadata,
        questionGeneration: {
          success: true,
          questionsGenerated: questionResult.questions.length,
          questionsSaved: saveResult.saved,
          metadata: questionResult.metadata,
          processingMethod: 'direct' // Indicate direct processing
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

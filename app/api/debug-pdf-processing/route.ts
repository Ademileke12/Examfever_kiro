import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    const { userId, filename = "test_computer_science.pdf" } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 DEBUG: Starting PDF processing simulation for: ${filename}`)

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    console.log(`🔍 DEBUG: Generated fileId: ${fileId}`)

    // Simulate extracted text content
    const simulatedContent = `
    Computer Science Fundamentals
    
    This document covers the basic principles of computer science including:
    
    1. Data Structures and Algorithms
    Data structures are fundamental ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs.
    
    2. Programming Paradigms
    Programming paradigms are different approaches to programming. The main paradigms include:
    - Object-Oriented Programming (OOP)
    - Functional Programming
    - Procedural Programming
    - Declarative Programming
    
    3. Database Systems
    Database systems are used to store, retrieve, and manage data. Key concepts include:
    - Relational databases
    - SQL queries
    - Database normalization
    - ACID properties
    
    4. Software Engineering
    Software engineering involves the systematic approach to designing, developing, and maintaining software systems. It includes:
    - Requirements analysis
    - System design
    - Implementation
    - Testing and debugging
    - Maintenance
    
    5. Computer Networks
    Computer networks enable communication between different computing devices. Important topics include:
    - Network protocols (TCP/IP, HTTP, HTTPS)
    - Network topologies
    - Security considerations
    - Distributed systems
    `

    console.log(`🔍 DEBUG: Simulated content length: ${simulatedContent.length} characters`)

    // Extract course metadata
    const courseMetadata = extractCourseMetadata(filename, simulatedContent)
    console.log(`🔍 DEBUG: Course metadata:`, courseMetadata)

    // Generate questions using the same process as PDF processing
    console.log('🔍 DEBUG: Starting AI question generation...')
    const generationRequest: QuestionGenerationRequest = {
      content: simulatedContent,
      questionTypes: ['multiple-choice'], // Only generate multiple-choice questions
      difficulty: ['easy', 'medium', 'hard'],
      maxQuestions: 15,
      userId,
      fileId
    }

    console.log(`🔍 DEBUG: Generation request:`, generationRequest)

    let questionResult
    try {
      console.log('🔍 DEBUG: Calling questionGenerator.generateQuestions...')
      questionResult = await questionGenerator.generateQuestions(generationRequest)
      console.log(`🔍 DEBUG: Question generation result:`, {
        success: questionResult.success,
        questionCount: questionResult.questions?.length || 0,
        error: questionResult.error
      })

      if (!questionResult.success) {
        console.error('🔍 DEBUG: Question generation failed:', questionResult.error)
        return NextResponse.json({
          success: false,
          error: questionResult.error,
          stage: 'question_generation'
        }, { status: 500 })
      }

      console.log(`🔍 DEBUG: Generated ${questionResult.questions.length} questions successfully`)

    } catch (error) {
      console.error('🔍 DEBUG: Question generation exception:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Question generation failed',
        stage: 'question_generation_exception'
      }, { status: 500 })
    }

    // Add course metadata to questions before saving (same as PDF processing)
    console.log('🔍 DEBUG: Adding metadata to questions...')
    const questionsWithMetadata = questionResult.questions.map((question: any) => ({
      ...question,
      file_id: fileId,
      course_id: courseMetadata.courseId,
      subject_tag: courseMetadata.subjectTag,
      document_title: courseMetadata.documentTitle,
      metadata: {
        ...question.metadata,
        courseMetadata: courseMetadata
      }
    }))

    console.log(`🔍 DEBUG: Questions with metadata sample:`, {
      count: questionsWithMetadata.length,
      firstQuestion: {
        id: questionsWithMetadata[0]?.id,
        file_id: questionsWithMetadata[0]?.file_id,
        course_id: questionsWithMetadata[0]?.course_id,
        subject_tag: questionsWithMetadata[0]?.subject_tag,
        hasOptions: !!questionsWithMetadata[0]?.options
      }
    })

    // Save questions to database (same as PDF processing)
    console.log('🔍 DEBUG: Saving questions to database...')
    const saveResult = await saveQuestions(questionsWithMetadata, userId)
    console.log(`🔍 DEBUG: Save result:`, saveResult)

    if (saveResult.saved === 0) {
      console.error('🔍 DEBUG: No questions were saved! This indicates a database issue.')
      return NextResponse.json({
        success: false,
        error: saveResult.error,
        stage: 'question_saving',
        details: 'No questions were saved to database'
      }, { status: 500 })
    }

    // Create bundle entry (same as PDF processing)
    console.log('🔍 DEBUG: Creating bundle entry...')
    try {
      const bundleData = {
        file_id: fileId,
        user_id: userId,
        bundle_name: courseMetadata.documentTitle,
        subject_tag: courseMetadata.subjectTag,
        question_count: saveResult.saved,
        difficulty_distribution: calculateDifficultyDistribution(questionsWithMetadata),
        upload_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          originalFilename: filename,
          fileSize: simulatedContent.length,
          processingMethod: 'debug-simulation'
        }
      }
      
      console.log('🔍 DEBUG: Bundle data to insert:', bundleData)
      
      const { data: bundleResult, error: bundleError } = await supabase
        .from('question_bundles')
        .upsert(bundleData)
        .select()
        .single()

      if (bundleError) {
        console.error('🔍 DEBUG: Bundle creation failed:', bundleError.message)
        return NextResponse.json({
          success: false,
          error: bundleError.message,
          stage: 'bundle_creation',
          questionsSaved: saveResult.saved
        }, { status: 500 })
      } else {
        console.log('🔍 DEBUG: Bundle created successfully:', bundleResult?.bundle_name)
      }
    } catch (bundleError) {
      console.error('🔍 DEBUG: Bundle creation exception:', bundleError)
      return NextResponse.json({
        success: false,
        error: bundleError instanceof Error ? bundleError.message : 'Bundle creation failed',
        stage: 'bundle_creation_exception',
        questionsSaved: saveResult.saved
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Debug PDF processing completed successfully',
      data: {
        fileId,
        filename,
        contentLength: simulatedContent.length,
        courseMetadata,
        questionsGenerated: questionResult.questions.length,
        questionsSaved: saveResult.saved,
        bundleCreated: true
      }
    })

  } catch (error) {
    console.error('🔍 DEBUG: Overall processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Debug processing failed',
        stage: 'overall_exception'
      },
      { status: 500 }
    )
  }
}
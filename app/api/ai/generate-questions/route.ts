import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { questionGenerator } from '@/lib/ai/question-generator'
import { saveQuestions } from '@/lib/database/questions'
import { QuestionGenerationRequest } from '@/lib/questions/types'
import { withTimeout, Timeouts, TimeoutError } from '@/lib/security/timeout'

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

    const body = await request.json()

    // Validate request
    const validationResult = validateGenerationRequest(body)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      )
    }

    const generationRequest: QuestionGenerationRequest = {
      content: body.content,
      questionTypes: body.questionTypes || ['multiple-choice'],
      difficulty: body.difficulty || ['medium'],
      maxQuestions: Math.min(body.maxQuestions || 10, 50),
      topics: body.topics,
      userId: user.id,
      fileId: body.fileId
    }

    // Generate questions with timeout
    let result
    try {
      result = await withTimeout(
        questionGenerator.generateQuestions(generationRequest),
        Timeouts.SLOW,
        'Question generation timed out'
      )
    } catch (error) {
      if (error instanceof TimeoutError) {
        return NextResponse.json({ success: false, error: 'AI generation timed out' }, { status: 504 })
      }
      throw error
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Save questions to database
    const saveResult = await saveQuestions(result.questions, user.id)

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
        metadata: result.metadata,
        saved: saveResult.saved,
        saveError: saveResult.error
      }
    })

  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

function validateGenerationRequest(body: any): { isValid: boolean; error?: string } {
  if (!body.content || typeof body.content !== 'string') {
    return { isValid: false, error: 'Content is required and must be a string' }
  }

  if (body.content.length < 100) {
    return { isValid: false, error: 'Content must be at least 100 characters long' }
  }

  if (body.content.length > 50000) {
    return { isValid: false, error: 'Content must be less than 50,000 characters' }
  }

  if (body.questionTypes && !Array.isArray(body.questionTypes)) {
    return { isValid: false, error: 'questionTypes must be an array' }
  }

  if (body.difficulty && !Array.isArray(body.difficulty)) {
    return { isValid: false, error: 'difficulty must be an array' }
  }

  if (body.maxQuestions && (typeof body.maxQuestions !== 'number' || body.maxQuestions < 1)) {
    return { isValid: false, error: 'maxQuestions must be a positive number' }
  }

  const validQuestionTypes = ['multiple-choice'] // Only support multiple-choice questions
  if (body.questionTypes && !body.questionTypes.every((type: string) => validQuestionTypes.includes(type))) {
    return { isValid: false, error: 'Only multiple-choice questions are supported' }
  }

  const validDifficulties = ['easy', 'medium', 'hard']
  if (body.difficulty && !body.difficulty.every((diff: string) => validDifficulties.includes(diff))) {
    return { isValid: false, error: 'Invalid difficulty level provided' }
  }

  return { isValid: true }
}

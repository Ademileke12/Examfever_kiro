import { NextRequest, NextResponse } from 'next/server'
import { saveQuestion } from '@/lib/database/questions'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create a test question with proper UUID
    const testQuestion = {
      id: generateId(),
      type: 'multiple-choice' as const,
      text: 'What is the primary purpose of thermodynamics?',
      options: [
        { id: 'a', text: 'To study heat and energy transfer', isCorrect: true },
        { id: 'b', text: 'To study chemical reactions', isCorrect: false },
        { id: 'c', text: 'To study atomic structure', isCorrect: false },
        { id: 'd', text: 'To study electromagnetic fields', isCorrect: false }
      ],
      difficulty: 'medium' as const,
      topic: 'Thermodynamics',
      keywords: ['thermodynamics', 'heat', 'energy'],
      sourceContent: 'Test content for thermodynamics question',
      explanation: 'Thermodynamics is the branch of physics that deals with heat and energy transfer.',
      file_id: 'test-file-123',
      course_id: 'thermodynamics_101',
      subject_tag: 'physics',
      document_title: 'Thermodynamics Test Document',
      metadata: {
        generatedAt: new Date(),
        model: 'test-generator',
        confidence: 0.9,
        qualityScore: 0.85,
        processingTime: 100,
        sourceChunk: 'test-chunk',
        contentHash: 'test-hash'
      }
    }

    console.log('Attempting to save test question with ID:', testQuestion.id)
    
    const result = await saveQuestion(testQuestion, userId)
    
    if (result.success) {
      console.log('Test question saved successfully')
      return NextResponse.json({
        success: true,
        message: 'Test question saved successfully',
        questionId: testQuestion.id
      })
    } else {
      console.error('Failed to save test question:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test question save error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed' 
      },
      { status: 500 }
    )
  }
}
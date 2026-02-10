import { NextRequest, NextResponse } from 'next/server'
import { getQuestions } from '@/lib/database/questions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const topic = searchParams.get('topic')
    const fileId = searchParams.get('fileId')
    const limit = searchParams.get('limit')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const filters: any = {}
    if (type) filters.type = type
    if (difficulty) filters.difficulty = difficulty
    if (topic) filters.topic = topic
    if (fileId) filters.fileId = fileId
    if (limit) filters.limit = parseInt(limit)

    const result = await getQuestions(userId, filters)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
        count: result.questions.length
      }
    })

  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch questions' 
      },
      { status: 500 }
    )
  }
}
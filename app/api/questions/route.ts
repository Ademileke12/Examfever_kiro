import { NextRequest, NextResponse } from 'next/server'
import { getQuestions } from '@/lib/database/questions'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const topic = searchParams.get('topic')
    const fileId = searchParams.get('fileId')
    const limit = searchParams.get('limit')

    const filters: any = {}
    if (type) filters.type = type
    if (difficulty) filters.difficulty = difficulty
    if (topic) filters.topic = topic
    if (fileId) filters.fileId = fileId
    if (limit) filters.limit = parseInt(limit)

    const result = await getQuestions(user.id, filters)

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
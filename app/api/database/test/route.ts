import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateId } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('questions')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: connectionError.message,
        message: 'Database connection failed or tables do not exist',
        details: {
          code: connectionError.code,
          hint: connectionError.hint
        }
      })
    }

    // Test inserting a sample question
    const testQuestion = {
      id: generateId(),
      user_id: 'test-user',
      type: 'multiple-choice',
      text: 'Database connection test question',
      difficulty: 'easy',
      metadata: { test: true }
    }

    const { data: insertData, error: insertError } = await supabase
      .from('questions')
      .insert(testQuestion)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: insertError.message,
        message: 'Failed to insert test question',
        details: {
          code: insertError.code,
          hint: insertError.hint
        }
      })
    }

    // Clean up test question
    await supabase
      .from('questions')
      .delete()
      .eq('id', insertData.id)

    return NextResponse.json({
      success: true,
      message: 'Database is properly configured and working!',
      data: {
        connectionWorking: true,
        tablesExist: true,
        insertWorking: true,
        testQuestionId: insertData.id
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database test failed'
    })
  }
}
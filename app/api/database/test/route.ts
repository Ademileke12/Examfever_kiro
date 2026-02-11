import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'

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

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('questions')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: connectionError.message,
        message: 'Database connection failed or tables do not exist'
      })
    }

    // Test inserting a sample question for the current user
    const testQuestion = {
      id: generateId(),
      user_id: user.id,
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
        message: 'Failed to insert test question'
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
        userId: user.id
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
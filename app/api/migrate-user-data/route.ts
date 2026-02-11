import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { fromUserId, toUserId } = await request.json()

    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { success: false, error: 'Both fromUserId and toUserId are required' },
        { status: 400 }
      )
    }

    console.log(`Migrating data from ${fromUserId} to ${toUserId} (Initiated by: ${user.id})`)

    // Migrate questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId)
      .select()

    if (questionsError) {
      console.error('Error migrating questions:', questionsError)
      return NextResponse.json(
        { success: false, error: questionsError.message },
        { status: 500 }
      )
    }

    // Migrate bundles
    const { data: bundlesData, error: bundlesError } = await supabase
      .from('question_bundles')
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId)
      .select()

    if (bundlesError) {
      console.error('Error migrating bundles:', bundlesError)
      return NextResponse.json(
        { success: false, error: bundlesError.message },
        { status: 500 }
      )
    }

    console.log(`Migration completed: ${questionsData?.length || 0} questions, ${bundlesData?.length || 0} bundles`)

    return NextResponse.json({
      success: true,
      message: 'Data migration completed successfully',
      data: {
        questionsMigrated: questionsData?.length || 0,
        bundlesMigrated: bundlesData?.length || 0,
        fromUserId,
        toUserId
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed'
      },
      { status: 500 }
    )
  }
}
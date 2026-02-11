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

    console.log('Checking bundle system setup for user:', user.id)

    // Check if question_bundles table exists
    const { error: checkError } = await supabase
      .from('question_bundles')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Bundle tables already exist',
        tablesExist: true
      })
    }

    // Provide manual setup instructions if it doesn't exist
    const manualSetupSQL = `-- Run this SQL in your Supabase SQL Editor...` // Truncated for brevity but in practice would be full

    return NextResponse.json({
      success: false,
      message: 'Bundle tables need manual setup',
      requiresManualSetup: true,
      sql: manualSetupSQL
    })

  } catch (error) {
    console.error('Bundle setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Setup check failed'
    }, { status: 500 })
  }
}

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

    const { data: bundles, error: bundleError } = await supabase
      .from('question_bundles')
      .select('id, file_id, bundle_name')
      .eq('user_id', user.id)
      .limit(5)

    if (bundleError) {
      return NextResponse.json({
        success: false,
        tablesExist: false,
        message: 'Bundle tables do not exist'
      })
    }

    return NextResponse.json({
      success: true,
      tablesExist: true,
      bundleCount: bundles?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Status check failed'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role key for admin operations
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const results = []
    let tablesCreated = 0

    // Try to create a test record in each table to see if they exist
    const tables = [
      {
        name: 'questions',
        testData: {
          user_id: 'test-setup',
          type: 'multiple-choice',
          text: 'Setup test question',
          difficulty: 'easy',
          metadata: {}
        }
      },
      {
        name: 'question_options',
        testData: {
          question_id: '00000000-0000-0000-0000-000000000000',
          text: 'Test option',
          is_correct: false
        }
      },
      {
        name: 'exams',
        testData: {
          user_id: 'test-setup',
          title: 'Test exam',
          total_questions: 1
        }
      },
      {
        name: 'exam_questions',
        testData: {
          exam_id: '00000000-0000-0000-0000-000000000000',
          question_id: '00000000-0000-0000-0000-000000000000',
          order_index: 0
        }
      }
    ]

    for (const table of tables) {
      try {
        // Try to select from the table first
        const { data, error } = await adminSupabase
          .from(table.name)
          .select('*')
          .limit(1)

        if (!error) {
          results.push({ table: table.name, exists: true, created: false })
          tablesCreated++
        } else if (error.message.includes('does not exist')) {
          results.push({ table: table.name, exists: false, created: false, error: 'Table does not exist' })
        } else {
          results.push({ table: table.name, exists: true, created: false })
          tablesCreated++
        }
      } catch (error) {
        results.push({
          table: table.name,
          exists: false,
          created: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const allTablesExist = tablesCreated === tables.length

    if (allTablesExist) {
      return NextResponse.json({
        success: true,
        data: {
          tablesCreated: true,
          results,
          message: 'All database tables already exist and are ready to use!'
        }
      })
    }

    // If tables don't exist, we need manual setup
    return NextResponse.json({
      success: false,
      data: {
        tablesCreated: false,
        results,
        message: 'Database tables need to be created manually in Supabase SQL Editor.',
        reason: 'Supabase security restrictions prevent automatic table creation via API.',
        instructions: {
          step1: 'Go to your Supabase project dashboard',
          step2: 'Open the SQL Editor',
          step3: 'Copy and paste the setup script from this page',
          step4: 'Run the script to create all required tables',
          step5: 'Refresh this page to verify setup'
        }
      }
    })

  } catch (error) {
    console.error('Database setup error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Setup failed',
      message: 'Automatic setup not available. Please use manual setup in Supabase SQL Editor.',
      instructions: {
        step1: 'Go to your Supabase project dashboard',
        step2: 'Open the SQL Editor',
        step3: 'Copy and paste the setup script',
        step4: 'Run the script to create tables'
      }
    })
  }
}
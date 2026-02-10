import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tables = ['questions', 'question_options', 'exams', 'exam_questions', 'user_activities', 'performance_history', 'exam_results']
    const tableStatus: Record<string, boolean> = {}

    for (const tableName of tables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        tableStatus[tableName] = !error
      } catch (error) {
        tableStatus[tableName] = false
      }
    }

    const allTablesExist = Object.values(tableStatus).every(exists => exists)

    return NextResponse.json({
      success: true,
      data: {
        allTablesExist,
        tables: tableStatus,
        message: allTablesExist
          ? 'All database tables are ready!'
          : 'Some database tables are missing. Please run the database setup script.',
        setupInstructions: allTablesExist ? null : {
          step1: 'Go to your Supabase project dashboard',
          step2: 'Open the SQL Editor',
          step3: 'Copy and paste the contents of scripts/setup-database.sql',
          step4: 'Run the script to create the required tables'
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database check failed'
    })
  }
}
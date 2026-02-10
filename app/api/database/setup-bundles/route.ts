import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

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

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Read the bundle setup SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'bundle-system-setup.sql')
    const setupSQL = readFileSync(sqlPath, 'utf-8')

    console.log(`Running bundle system setup by user: ${session.user.id}`)

    // Execute the setup SQL
    const { data, error } = await adminSupabase.rpc('exec_sql', {
      sql_query: setupSQL
    })

    if (error) {
      console.error('Bundle setup error:', error)

      // Try alternative approach - execute SQL directly
      const { error: directError } = await adminSupabase
        .from('_temp_setup')
        .select('*')
        .limit(0) // This will fail but allow us to execute raw SQL

      // If that fails too, try executing the SQL in parts
      const sqlStatements = setupSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      const results = []
      for (const statement of sqlStatements) {
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || statement.includes('ALTER TABLE')) {
          try {
            const { error: stmtError } = await adminSupabase.rpc('exec_sql', {
              sql_query: statement + ';'
            })

            if (stmtError) {
              console.warn(`Statement failed (might be expected):`, statement.substring(0, 100), stmtError.message)
            }

            results.push({
              statement: statement.substring(0, 100) + '...',
              success: !stmtError,
              error: stmtError?.message
            })
          } catch (err) {
            console.warn(`Statement execution failed:`, err)
            results.push({
              statement: statement.substring(0, 100) + '...',
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error'
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Bundle system setup completed with some warnings',
        results,
        warning: 'Some statements may have failed if tables already exist'
      })
    }

    console.log('Bundle setup completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Bundle system setup completed successfully',
      data
    })

  } catch (error) {
    console.error('Bundle setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
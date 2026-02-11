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

    const userId = user.id
    console.log('Starting bundle population for user:', userId)

    // Get questions for the authenticated user
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('file_id, user_id, document_title, subject_tag, created_at')
      .eq('user_id', userId)
      .not('file_id', 'is', null)

    if (questionsError) throw new Error(questionsError.message)

    if (!questions || questions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No questions found to create bundles from',
        bundlesCreated: 0
      })
    }

    // Group questions by file_id
    const bundleGroups = new Map<string, any>()
    questions.forEach(q => {
      if (!bundleGroups.has(q.file_id)) {
        bundleGroups.set(q.file_id, {
          file_id: q.file_id,
          user_id: userId,
          bundle_name: q.document_title || q.file_id,
          subject_tag: q.subject_tag,
          upload_date: q.created_at,
          question_count: 0
        })
      }
      bundleGroups.get(q.file_id)!.question_count++
    })

    const bundlesToInsert = Array.from(bundleGroups.values())

    // Upsert bundles
    const { data: insertedBundles, error: insertError } = await supabase
      .from('question_bundles')
      .upsert(bundlesToInsert, { onConflict: 'file_id' })
      .select()

    if (insertError) throw new Error(insertError.message)

    // Update distributions
    for (const bundle of bundlesToInsert) {
      const { data: bundleQuestions, error: diffError } = await supabase
        .from('questions')
        .select('difficulty')
        .eq('file_id', bundle.file_id)
        .eq('user_id', userId)

      if (!diffError && bundleQuestions) {
        const diffDistribution: Record<string, number> = {}
        bundleQuestions.forEach(q => {
          diffDistribution[q.difficulty] = (diffDistribution[q.difficulty] || 0) + 1
        })

        await supabase
          .from('question_bundles')
          .update({
            difficulty_distribution: diffDistribution,
            question_count: bundleQuestions.length,
            updated_at: new Date().toISOString()
          })
          .eq('file_id', bundle.file_id)
          .eq('user_id', userId)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully populated ${bundlesToInsert.length} bundles`,
      bundlesCreated: bundlesToInsert.length
    })

  } catch (error) {
    console.error('Bundle population error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Population failed'
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
      .select('*')
      .eq('user_id', user.id)

    if (bundleError) throw new Error(bundleError.message)

    return NextResponse.json({
      success: true,
      currentBundles: bundles?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed'
    }, { status: 500 })
  }
}
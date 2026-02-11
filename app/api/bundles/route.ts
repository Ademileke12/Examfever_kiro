import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface Bundle {
  fileId: string
  bundleName: string
  subjectTag: string | null
  questionCount: number
  difficultyDistribution: Record<string, number>
  lastAccessed: string | null
  uploadDate: string
  metadata: Record<string, any>
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const subjectTag = searchParams.get('subjectTag')
    const search = searchParams.get('search')

    let query = supabase
      .from('question_bundles')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false, nullsFirst: false })
      .order('upload_date', { ascending: false })

    if (subjectTag) {
      query = query.eq('subject_tag', subjectTag)
    }

    if (search) {
      query = query.or(`bundle_name.ilike.%${search}%,subject_tag.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const bundles: Bundle[] = data.map(row => ({
      fileId: row.file_id,
      bundleName: row.bundle_name,
      subjectTag: row.subject_tag,
      questionCount: row.question_count || 0,
      difficultyDistribution: row.difficulty_distribution || {},
      lastAccessed: row.last_accessed,
      uploadDate: row.upload_date || row.created_at,
      metadata: row.metadata || {}
    }))

    return NextResponse.json({
      success: true,
      bundles
    })

  } catch (error) {
    console.error('Bundle listing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Check if requesting user matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to user data' },
        { status: 403 }
      )
    }

    const { fileId, bundleName, subjectTag } = await request.json()

    if (!fileId || !bundleName) {
      return NextResponse.json(
        { success: false, error: 'File ID and Bundle Name are required' },
        { status: 400 }
      )
    }

    // Create or update bundle for the authenticated user
    const { data, error } = await supabase
      .from('question_bundles')
      .upsert({
        file_id: fileId,
        user_id: user.id,
        bundle_name: bundleName,
        subject_tag: subjectTag,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Manually refresh bundle statistics
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('difficulty')
        .eq('file_id', fileId)
        .eq('user_id', user.id)

      if (!questionsError && questionsData) {
        const questionCount = questionsData.length
        const difficultyDistribution: Record<string, number> = {}

        questionsData.forEach(q => {
          const difficulty = q.difficulty || 'medium'
          difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1
        })

        await supabase
          .from('question_bundles')
          .update({
            question_count: questionCount,
            difficulty_distribution: difficultyDistribution
          })
          .eq('file_id', fileId)
          .eq('user_id', user.id)
      }
    } catch (statsError) {
      console.warn('Failed to update bundle stats:', statsError)
    }

    return NextResponse.json({
      success: true,
      bundle: {
        fileId: data.file_id,
        bundleName: data.bundle_name,
        subjectTag: data.subject_tag,
        questionCount: data.question_count || 0,
        difficultyDistribution: data.difficulty_distribution || {},
        lastAccessed: data.last_accessed,
        uploadDate: data.upload_date || data.created_at,
        metadata: data.metadata || {}
      }
    })

  } catch (error) {
    console.error('Bundle creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bundle' },
      { status: 500 }
    )
  }
}
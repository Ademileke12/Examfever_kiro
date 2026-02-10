import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subjectTag = searchParams.get('subjectTag')
    const search = searchParams.get('search')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('question_bundles')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed', { ascending: false, nullsFirst: false })
      .order('upload_date', { ascending: false })

    if (subjectTag) {
      query = query.eq('subject_tag', subjectTag)
    }

    if (search) {
      query = query.or(`bundle_name.ilike.%${search}%,subject_tag.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

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
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch bundles' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId, bundleName, subjectTag } = await request.json()

    if (!fileId || !userId || !bundleName) {
      return NextResponse.json(
        { success: false, error: 'File ID, User ID, and Bundle Name are required' },
        { status: 400 }
      )
    }

    // Create or update bundle
    const { data, error } = await supabase
      .from('question_bundles')
      .upsert({
        file_id: fileId,
        user_id: userId,
        bundle_name: bundleName,
        subject_tag: subjectTag,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Manually refresh bundle statistics by counting questions
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('difficulty')
        .eq('file_id', fileId)
        .eq('user_id', userId)

      if (!questionsError && questionsData) {
        const questionCount = questionsData.length
        const difficultyDistribution: Record<string, number> = {}
        
        questionsData.forEach(q => {
          const difficulty = q.difficulty || 'medium'
          difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1
        })

        // Update bundle with calculated stats
        await supabase
          .from('question_bundles')
          .update({
            question_count: questionCount,
            difficulty_distribution: difficultyDistribution
          })
          .eq('file_id', fileId)
          .eq('user_id', userId)
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
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create bundle' 
      },
      { status: 500 }
    )
  }
}
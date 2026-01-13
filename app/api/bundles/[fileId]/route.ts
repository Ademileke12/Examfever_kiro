import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getQuestions } from '@/lib/database/questions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BundleDetails {
  bundle: {
    fileId: string
    bundleName: string
    subjectTag: string | null
    questionCount: number
    difficultyDistribution: Record<string, number>
    lastAccessed: string | null
    uploadDate: string
    metadata: Record<string, any>
  }
  questions: any[]
  statistics: {
    totalQuestions: number
    byType: Record<string, number>
    byDifficulty: Record<string, number>
    byTopic: Record<string, number>
    averageQuality: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includeQuestions = searchParams.get('includeQuestions') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get bundle metadata
    const { data: bundleData, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', userId)
      .single()

    if (bundleError) {
      throw new Error(bundleError.message)
    }

    // Update last accessed time
    await supabase
      .from('question_bundles')
      .update({ last_accessed: new Date().toISOString() })
      .eq('file_id', fileId)
      .eq('user_id', userId)

    // Log bundle access
    await supabase
      .from('bundle_access_log')
      .insert({
        user_id: userId,
        file_id: fileId,
        action: 'view',
        metadata: { timestamp: new Date().toISOString() }
      })

    let questions: any[] = []
    let statistics = {
      totalQuestions: 0,
      byType: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byTopic: {} as Record<string, number>,
      averageQuality: 0
    }

    if (includeQuestions) {
      // Get questions for this bundle
      const questionsResult = await getQuestions(userId, { fileId })
      
      if (questionsResult.success) {
        questions = questionsResult.questions

        // Calculate detailed statistics
        statistics.totalQuestions = questions.length
        
        questions.forEach((question: any) => {
          // By type
          statistics.byType[question.type] = (statistics.byType[question.type] || 0) + 1
          
          // By difficulty
          statistics.byDifficulty[question.difficulty] = (statistics.byDifficulty[question.difficulty] || 0) + 1
          
          // By topic
          if (question.topic) {
            statistics.byTopic[question.topic] = (statistics.byTopic[question.topic] || 0) + 1
          }
        })

        // Calculate average quality score
        const qualityScores = questions
          .map((q: any) => q.metadata?.qualityScore || 0.7)
          .filter((score: number) => score > 0)
        
        statistics.averageQuality = qualityScores.length > 0 
          ? qualityScores.reduce((sum: number, score: number) => sum + score, 0) / qualityScores.length
          : 0.7
      }
    }

    const bundleDetails: BundleDetails = {
      bundle: {
        fileId: bundleData.file_id,
        bundleName: bundleData.bundle_name,
        subjectTag: bundleData.subject_tag,
        questionCount: bundleData.question_count || 0,
        difficultyDistribution: bundleData.difficulty_distribution || {},
        lastAccessed: bundleData.last_accessed,
        uploadDate: bundleData.upload_date || bundleData.created_at,
        metadata: bundleData.metadata || {}
      },
      questions,
      statistics
    }

    return NextResponse.json({
      success: true,
      ...bundleDetails
    })

  } catch (error) {
    console.error('Bundle details error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch bundle details' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId, bundleName, subjectTag, metadata } = await request.json()
    const { fileId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update bundle metadata
    const { data, error } = await supabase
      .from('question_bundles')
      .update({
        bundle_name: bundleName,
        subject_tag: subjectTag,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('file_id', fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Also update questions table if bundle name changed
    if (bundleName) {
      await supabase
        .from('questions')
        .update({ document_title: bundleName })
        .eq('file_id', fileId)
        .eq('user_id', userId)
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
    console.error('Bundle update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update bundle' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { fileId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete all questions in this bundle
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('file_id', fileId)
      .eq('user_id', userId)

    if (questionsError) {
      throw new Error(questionsError.message)
    }

    // Delete bundle metadata
    const { error: bundleError } = await supabase
      .from('question_bundles')
      .delete()
      .eq('file_id', fileId)
      .eq('user_id', userId)

    if (bundleError) {
      throw new Error(bundleError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Bundle deleted successfully'
    })

  } catch (error) {
    console.error('Bundle deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete bundle' 
      },
      { status: 500 }
    )
  }
}
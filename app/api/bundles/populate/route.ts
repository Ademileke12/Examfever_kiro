import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Starting bundle population from existing questions...')
    
    // First check if bundle tables exist
    const { data: bundleCheck, error: bundleError } = await supabase
      .from('question_bundles')
      .select('id')
      .limit(1)
    
    if (bundleError) {
      return NextResponse.json({
        success: false,
        error: 'Bundle tables do not exist',
        message: 'Please create the bundle tables first using the setup endpoint',
        setupUrl: '/api/database/setup-bundles-simple',
        details: bundleError.message
      }, { status: 400 })
    }
    
    // Get all unique file_ids from questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('file_id, user_id, document_title, subject_tag, created_at')
      .not('file_id', 'is', null)
    
    if (questionsError) {
      throw new Error(`Failed to fetch questions: ${questionsError.message}`)
    }
    
    if (!questions || questions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No questions found to create bundles from',
        bundlesCreated: 0
      })
    }
    
    // Group questions by file_id and user_id
    const bundleGroups = new Map<string, {
      fileId: string
      userId: string
      bundleName: string
      subjectTag: string | null
      uploadDate: string
      questionCount: number
    }>()
    
    questions.forEach(q => {
      const key = `${q.file_id}-${q.user_id}`
      if (!bundleGroups.has(key)) {
        bundleGroups.set(key, {
          fileId: q.file_id,
          userId: q.user_id,
          bundleName: q.document_title || q.file_id,
          subjectTag: q.subject_tag,
          uploadDate: q.created_at,
          questionCount: 0
        })
      }
      bundleGroups.get(key)!.questionCount++
    })
    
    console.log(`Found ${bundleGroups.size} unique bundles to create`)
    
    // Create bundles
    const bundlesToInsert = Array.from(bundleGroups.values()).map(bundle => ({
      file_id: bundle.fileId,
      user_id: bundle.userId,
      bundle_name: bundle.bundleName,
      subject_tag: bundle.subjectTag,
      question_count: bundle.questionCount,
      upload_date: bundle.uploadDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    // Insert bundles (use upsert to handle duplicates)
    const { data: insertedBundles, error: insertError } = await supabase
      .from('question_bundles')
      .upsert(bundlesToInsert, { 
        onConflict: 'file_id',
        ignoreDuplicates: false 
      })
      .select()
    
    if (insertError) {
      throw new Error(`Failed to insert bundles: ${insertError.message}`)
    }
    
    // Calculate difficulty distributions for each bundle
    const bundleUpdates = []
    
    for (const bundle of bundlesToInsert) {
      const { data: bundleQuestions, error: diffError } = await supabase
        .from('questions')
        .select('difficulty')
        .eq('file_id', bundle.file_id)
        .eq('user_id', bundle.user_id)
      
      if (!diffError && bundleQuestions) {
        const diffDistribution: Record<string, number> = {}
        bundleQuestions.forEach(q => {
          diffDistribution[q.difficulty] = (diffDistribution[q.difficulty] || 0) + 1
        })
        
        bundleUpdates.push({
          file_id: bundle.file_id,
          difficulty_distribution: diffDistribution,
          question_count: bundleQuestions.length
        })
      }
    }
    
    // Update difficulty distributions
    for (const update of bundleUpdates) {
      await supabase
        .from('question_bundles')
        .update({
          difficulty_distribution: update.difficulty_distribution,
          question_count: update.question_count,
          updated_at: new Date().toISOString()
        })
        .eq('file_id', update.file_id)
    }
    
    console.log(`Successfully created/updated ${bundlesToInsert.length} bundles`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully populated ${bundlesToInsert.length} bundles from existing questions`,
      bundlesCreated: bundlesToInsert.length,
      bundles: insertedBundles?.slice(0, 5) || [], // Return first 5 as sample
      stats: {
        totalQuestions: questions.length,
        uniqueFiles: bundleGroups.size,
        averageQuestionsPerBundle: Math.round(questions.length / bundleGroups.size)
      }
    })
    
  } catch (error) {
    console.error('Bundle population error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current bundle statistics
    const { data: bundles, error: bundleError } = await supabase
      .from('question_bundles')
      .select('*')
    
    if (bundleError) {
      return NextResponse.json({
        success: false,
        error: 'Bundle tables do not exist or are not accessible',
        details: bundleError.message
      }, { status: 400 })
    }
    
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('file_id, user_id')
      .not('file_id', 'is', null)
    
    if (questionsError) {
      throw new Error(`Failed to fetch questions: ${questionsError.message}`)
    }
    
    // Count unique file_ids in questions
    const uniqueFiles = new Set(questions?.map(q => `${q.file_id}-${q.user_id}`) || [])
    
    return NextResponse.json({
      success: true,
      currentBundles: bundles?.length || 0,
      questionsWithFiles: questions?.length || 0,
      uniqueFileUserCombinations: uniqueFiles.size,
      needsPopulation: (bundles?.length || 0) < uniqueFiles.size,
      sampleBundles: bundles?.slice(0, 3) || []
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const bundleId = searchParams.get('bundleId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (bundleId) {
      // Get analytics for specific bundle
      return await getBundleSpecificAnalytics(userId, bundleId)
    } else {
      // Get analytics for all bundles
      return await getAllBundlesAnalytics(userId)
    }

  } catch (error) {
    console.error('Bundle analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAllBundlesAnalytics(userId: string) {
  // Get all bundles for user
  const { data: bundles, error: bundlesError } = await supabase
    .from('question_bundles')
    .select('*')
    .eq('user_id', userId)

  if (bundlesError) {
    throw new Error(bundlesError.message)
  }

  // Get exam results with bundle context
  const { data: examResults, error: resultsError } = await supabase
    .from('exam_results')
    .select('*')
    .eq('user_id', userId)
    .not('bundle_context', 'is', null)
    .order('completed_at', { ascending: false })

  if (resultsError) {
    throw new Error(resultsError.message)
  }

  // Calculate analytics per bundle
  const bundleAnalytics = bundles.map(bundle => {
    const bundleResults = examResults.filter(result => 
      result.bundle_context?.bundleIds?.includes(bundle.file_id)
    )

    const totalAttempts = bundleResults.length
    const averageScore = totalAttempts > 0 
      ? Math.round(bundleResults.reduce((sum, result) => sum + result.score, 0) / totalAttempts)
      : 0
    
    const totalStudyTime = bundleResults.reduce((sum, result) => sum + (result.study_time_minutes || 0), 0)
    const lastAttempted = bundleResults.length > 0 ? bundleResults[0].completed_at : null

    // Identify strengths and weaknesses (simplified)
    const recentResults = bundleResults.slice(0, 5)
    const recentAverage = recentResults.length > 0
      ? recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length
      : 0

    const strengthAreas = recentAverage >= 80 ? ['Strong performance'] : []
    const weaknessAreas = recentAverage < 60 ? ['Needs improvement'] : []

    return {
      fileId: bundle.file_id,
      bundleName: bundle.bundle_name,
      subjectTag: bundle.subject_tag,
      questionCount: bundle.question_count,
      totalAttempts,
      averageScore,
      totalStudyTime,
      lastAttempted,
      strengthAreas,
      weaknessAreas,
      recentTrend: recentResults.length >= 2 
        ? (recentResults[0].score > recentResults[1].score ? 'improving' : 'declining')
        : 'stable'
    }
  })

  // Overall statistics
  const totalBundles = bundles.length
  const totalExams = examResults.length
  const overallAverageScore = totalExams > 0
    ? Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / totalExams)
    : 0
  const totalStudyTime = examResults.reduce((sum, result) => sum + (result.study_time_minutes || 0), 0)

  return NextResponse.json({
    success: true,
    data: {
      overview: {
        totalBundles,
        totalExams,
        overallAverageScore,
        totalStudyTime
      },
      bundlePerformance: bundleAnalytics,
      recommendations: generateRecommendations(bundleAnalytics)
    }
  })
}

async function getBundleSpecificAnalytics(userId: string, bundleId: string) {
  // Get bundle information
  const { data: bundle, error: bundleError } = await supabase
    .from('question_bundles')
    .select('*')
    .eq('file_id', bundleId)
    .eq('user_id', userId)
    .single()

  if (bundleError) {
    throw new Error(bundleError.message)
  }

  // Get exam results for this bundle
  const { data: examResults, error: resultsError } = await supabase
    .from('exam_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (resultsError) {
    throw new Error(resultsError.message)
  }

  // Filter results that include this bundle
  const bundleResults = examResults.filter(result => 
    result.bundle_context?.bundleIds?.includes(bundleId)
  )

  // Calculate performance history
  const performanceHistory = bundleResults.map(result => ({
    date: result.completed_at,
    score: result.score,
    timeSpent: result.study_time_minutes,
    questionsCorrect: result.correct_answers,
    totalQuestions: result.total_questions
  }))

  // Calculate trends
  const scores = performanceHistory.map(p => p.score)
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0

  const trend = scores.length >= 2
    ? (scores[0] > scores[scores.length - 1] ? 'improving' : 'declining')
    : 'stable'

  // Get bundle access logs
  const { data: accessLogs, error: logsError } = await supabase
    .from('bundle_access_log')
    .select('*')
    .eq('user_id', userId)
    .eq('file_id', bundleId)
    .order('timestamp', { ascending: false })
    .limit(20)

  if (logsError) {
    console.warn('Could not fetch access logs:', logsError)
  }

  return NextResponse.json({
    success: true,
    data: {
      bundle: {
        fileId: bundle.file_id,
        bundleName: bundle.bundle_name,
        subjectTag: bundle.subject_tag,
        questionCount: bundle.question_count,
        difficultyDistribution: bundle.difficulty_distribution,
        lastAccessed: bundle.last_accessed,
        uploadDate: bundle.upload_date
      },
      performance: {
        totalAttempts: bundleResults.length,
        averageScore,
        trend,
        bestScore: Math.max(...scores, 0),
        worstScore: Math.min(...scores, 100),
        totalStudyTime: performanceHistory.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
      },
      performanceHistory,
      accessLogs: accessLogs || [],
      recommendations: generateBundleRecommendations(bundle, performanceHistory)
    }
  })
}

function generateRecommendations(bundleAnalytics: any[]) {
  const recommendations = []

  // Find bundles that need attention
  const weakBundles = bundleAnalytics.filter(b => b.averageScore < 60 && b.totalAttempts > 0)
  if (weakBundles.length > 0) {
    recommendations.push({
      type: 'improvement',
      title: 'Focus on Weak Areas',
      description: `Consider reviewing ${weakBundles.map(b => b.bundleName).join(', ')} as your performance is below 60%.`,
      priority: 'high'
    })
  }

  // Find unused bundles
  const unusedBundles = bundleAnalytics.filter(b => b.totalAttempts === 0)
  if (unusedBundles.length > 0) {
    recommendations.push({
      type: 'practice',
      title: 'Explore New Material',
      description: `You have ${unusedBundles.length} bundle(s) that haven't been practiced yet.`,
      priority: 'medium'
    })
  }

  // Find strong areas
  const strongBundles = bundleAnalytics.filter(b => b.averageScore >= 80 && b.totalAttempts > 0)
  if (strongBundles.length > 0) {
    recommendations.push({
      type: 'maintenance',
      title: 'Maintain Strong Performance',
      description: `Great work on ${strongBundles.map(b => b.bundleName).join(', ')}! Consider periodic review to maintain proficiency.`,
      priority: 'low'
    })
  }

  return recommendations
}

function generateBundleRecommendations(bundle: any, performanceHistory: any[]) {
  const recommendations = []

  if (performanceHistory.length === 0) {
    recommendations.push({
      type: 'start',
      title: 'Start Practicing',
      description: `Begin with this ${bundle.bundle_name} bundle to assess your knowledge level.`,
      priority: 'high'
    })
  } else {
    const latestScore = performanceHistory[0]?.score || 0
    const averageScore = performanceHistory.reduce((sum, p) => sum + p.score, 0) / performanceHistory.length

    if (latestScore < 60) {
      recommendations.push({
        type: 'review',
        title: 'Review Fundamentals',
        description: 'Focus on understanding the basic concepts before attempting more practice exams.',
        priority: 'high'
      })
    } else if (latestScore >= 80) {
      recommendations.push({
        type: 'advance',
        title: 'Ready for Advanced Practice',
        description: 'Consider combining this bundle with others for comprehensive testing.',
        priority: 'medium'
      })
    }

    if (performanceHistory.length >= 3) {
      const trend = performanceHistory[0].score > performanceHistory[2].score ? 'improving' : 'declining'
      if (trend === 'declining') {
        recommendations.push({
          type: 'attention',
          title: 'Performance Declining',
          description: 'Your recent scores are lower than previous attempts. Consider reviewing the material.',
          priority: 'high'
        })
      }
    }
  }

  return recommendations
}
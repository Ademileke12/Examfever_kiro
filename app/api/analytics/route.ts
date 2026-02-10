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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get exam results within date range
    const { data: examResults, error: examError } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: true })

    if (examError) {
      console.error('Error fetching exam results:', examError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exam results' },
        { status: 500 }
      )
    }

    const results = examResults || []

    // Get questions data for subject analysis
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('subject_tag, course_id, difficulty, topic')
      .eq('user_id', session.user.id)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
    }

    const questionsData = questions || []

    // Calculate analytics data
    const analyticsData = calculateAnalyticsData(results, days)
    const performanceData = calculatePerformanceData(results, questionsData)
    const knowledgeGaps = calculateKnowledgeGaps(results, questionsData)
    const masteryAreas = calculateMasteryAreas(results, questionsData)
    const recommendations = generateRecommendations(results, knowledgeGaps, masteryAreas)

    return NextResponse.json({
      success: true,
      data: {
        analyticsData,
        performanceData,
        knowledgeGaps,
        masteryAreas,
        recommendations
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAnalyticsData(results: any[], days: number) {
  const totalExams = results.length
  const totalStudyTime = Math.round(
    results.reduce((sum, result) => sum + (result.study_time_minutes || 0), 0) / 60 * 10
  ) / 10

  const averageScore = totalExams > 0
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalExams)
    : 0

  // Calculate completion rate (assuming users complete exams they start)
  const completionRate = totalExams > 0 ? 100 : 0

  // Calculate streak days (consecutive days with exams)
  const streakDays = calculateStreakDays(results)

  // Weekly goals and progress
  const weeklyGoal = 3
  const currentWeekResults = results.filter(result => {
    const resultDate = new Date(result.completed_at)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of current week
    return resultDate >= weekStart
  })
  const weeklyProgress = currentWeekResults.length

  return {
    totalExams,
    totalStudyTime,
    averageScore,
    completionRate,
    streakDays,
    weeklyGoal,
    weeklyProgress
  }
}

function calculatePerformanceData(results: any[], questions: any[]) {
  // Extract scores and dates for trend analysis
  const scores = results.map(result => result.score)
  const dates = results.map(result => new Date(result.completed_at).toISOString().split('T')[0])

  // Calculate subject performance based on exam titles and available questions
  const subjects: { [key: string]: number[] } = {}

  // Group by subject tags from questions
  const subjectTags = Array.from(new Set(questions.map(q => q.subject_tag).filter(Boolean)))

  subjectTags.forEach(subject => {
    // Find exams that might relate to this subject (basic matching)
    const relatedResults = results.filter(result =>
      result.exam_title?.toLowerCase().includes(subject?.toLowerCase() || '') ||
      subject?.toLowerCase().includes('math') && result.exam_title?.toLowerCase().includes('math') ||
      subject?.toLowerCase().includes('science') && result.exam_title?.toLowerCase().includes('science')
    )

    if (relatedResults.length > 0) {
      subjects[subject] = relatedResults.map(r => r.score)
    }
  })

  // If no subject matching, create generic subjects based on exam titles
  if (Object.keys(subjects).length === 0 && results.length > 0) {
    subjects['General'] = scores
  }

  // Calculate average scores per subject
  const subjectAverages: { [key: string]: number } = {}
  Object.entries(subjects).forEach(([subject, subjectScores]) => {
    subjectAverages[subject] = Math.round(
      subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
    )
  })

  // Calculate difficulty performance
  const difficulty: { [key: string]: number } = {
    'Easy': 0,
    'Medium': 0,
    'Hard': 0
  }

  // Estimate difficulty based on scores (this is a simplification)
  results.forEach(result => {
    if (result.score >= 80) {
      difficulty['Easy'] = (difficulty['Easy'] + result.score) / 2 || result.score
    } else if (result.score >= 60) {
      difficulty['Medium'] = (difficulty['Medium'] + result.score) / 2 || result.score
    } else {
      difficulty['Hard'] = (difficulty['Hard'] + result.score) / 2 || result.score
    }
  })

  return {
    scores,
    dates,
    subjects: subjectAverages,
    difficulty
  }
}

function calculateKnowledgeGaps(results: any[], questions: any[]) {
  const gaps: any[] = []

  // Analyze low-performing areas
  const subjectPerformance: { [key: string]: { scores: number[], attempts: number } } = {}

  results.forEach(result => {
    // Try to match exam to subject
    const matchedSubjects = questions.filter(q =>
      result.exam_title?.toLowerCase().includes(q.subject_tag?.toLowerCase() || '') ||
      result.exam_title?.toLowerCase().includes(q.topic?.toLowerCase() || '')
    )

    if (matchedSubjects.length > 0) {
      matchedSubjects.forEach(q => {
        const key = `${q.subject_tag || 'General'}-${q.topic || 'General Topics'}`
        if (!subjectPerformance[key]) {
          subjectPerformance[key] = { scores: [], attempts: 0 }
        }
        subjectPerformance[key].scores.push(result.score)
        subjectPerformance[key].attempts++
      })
    } else {
      // Generic gap analysis
      const key = `General-${result.exam_title || 'Practice Exam'}`
      if (!subjectPerformance[key]) {
        subjectPerformance[key] = { scores: [], attempts: 0 }
      }
      subjectPerformance[key].scores.push(result.score)
      subjectPerformance[key].attempts++
    }
  })

  // Identify gaps (average score < 70%)
  Object.entries(subjectPerformance).forEach(([key, data]) => {
    const [subject, topic] = key.split('-')
    const averageScore = Math.round(
      data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
    )

    if (averageScore < 70 && data.attempts >= 1) {
      gaps.push({
        subject: subject || 'General',
        topic: topic || 'General Topics',
        score: averageScore,
        attempts: data.attempts
      })
    }
  })

  return gaps.slice(0, 5) // Return top 5 gaps
}

function calculateMasteryAreas(results: any[], questions: any[]) {
  const mastery: any[] = []

  // Analyze high-performing areas
  const subjectPerformance: { [key: string]: { scores: number[], attempts: number } } = {}

  results.forEach(result => {
    // Try to match exam to subject
    const matchedSubjects = questions.filter(q =>
      result.exam_title?.toLowerCase().includes(q.subject_tag?.toLowerCase() || '') ||
      result.exam_title?.toLowerCase().includes(q.topic?.toLowerCase() || '')
    )

    if (matchedSubjects.length > 0) {
      matchedSubjects.forEach(q => {
        const key = `${q.subject_tag || 'General'}-${q.topic || 'General Topics'}`
        if (!subjectPerformance[key]) {
          subjectPerformance[key] = { scores: [], attempts: 0 }
        }
        subjectPerformance[key].scores.push(result.score)
        subjectPerformance[key].attempts++
      })
    } else {
      // Generic mastery analysis
      const key = `General-${result.exam_title || 'Practice Exam'}`
      if (!subjectPerformance[key]) {
        subjectPerformance[key] = { scores: [], attempts: 0 }
      }
      subjectPerformance[key].scores.push(result.score)
      subjectPerformance[key].attempts++
    }
  })

  // Identify mastery areas (average score >= 85%)
  Object.entries(subjectPerformance).forEach(([key, data]) => {
    const [subject, topic] = key.split('-')
    const averageScore = Math.round(
      data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
    )

    // Calculate consistency (how close scores are to each other)
    const consistency = data.scores.length > 1
      ? Math.round(100 - (Math.max(...data.scores) - Math.min(...data.scores)))
      : 100

    if (averageScore >= 85 && data.attempts >= 2) {
      mastery.push({
        subject: subject || 'General',
        topic: topic || 'General Topics',
        score: averageScore,
        consistency: Math.max(consistency, 70) // Minimum 70% consistency
      })
    }
  })

  return mastery.slice(0, 5) // Return top 5 mastery areas
}

function generateRecommendations(results: any[], gaps: any[], mastery: any[]) {
  const recommendations: any[] = []

  // Recommendations based on knowledge gaps
  if (gaps.length > 0) {
    const topGap = gaps[0]
    recommendations.push({
      type: 'study',
      title: `Focus on ${topGap.topic}`,
      description: `Your ${topGap.subject} scores in ${topGap.topic} show room for improvement. Consider reviewing fundamental concepts.`,
      priority: 'high'
    })
  }

  // Recommendations based on overall performance
  if (results.length > 0) {
    const recentScores = results.slice(-3).map(r => r.score)
    const recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length

    if (recentAverage < 70) {
      recommendations.push({
        type: 'practice',
        title: 'Increase Practice Frequency',
        description: 'Your recent scores suggest you need more practice. Try taking shorter, focused exams daily.',
        priority: 'high'
      })
    } else if (recentAverage >= 85) {
      recommendations.push({
        type: 'review',
        title: 'Maintain Excellence',
        description: 'Great job! Keep up the consistent practice to maintain your high performance.',
        priority: 'low'
      })
    }
  }

  // Study time recommendations
  const totalStudyTime = results.reduce((sum, result) => sum + (result.study_time_minutes || 0), 0)
  const averageStudyTime = results.length > 0 ? totalStudyTime / results.length : 0

  if (averageStudyTime < 30) {
    recommendations.push({
      type: 'study',
      title: 'Increase Study Duration',
      description: 'Consider spending more time on each exam session. Aim for at least 30-45 minutes per session.',
      priority: 'medium'
    })
  }

  // Consistency recommendations
  if (results.length >= 3) {
    const scores = results.slice(-5).map(r => r.score)
    const variance = Math.max(...scores) - Math.min(...scores)

    if (variance > 30) {
      recommendations.push({
        type: 'practice',
        title: 'Improve Consistency',
        description: 'Your scores vary significantly. Focus on consistent study habits and review weak areas regularly.',
        priority: 'medium'
      })
    }
  }

  return recommendations.slice(0, 3) // Return top 3 recommendations
}

function calculateStreakDays(results: any[]) {
  if (results.length === 0) return 0

  const dates = results.map(result =>
    new Date(result.completed_at).toISOString().split('T')[0]
  )

  const uniqueDates = Array.from(new Set(dates)).sort().reverse()

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let currentDate = new Date()

  for (let i = 0; i < uniqueDates.length; i++) {
    const examDate = uniqueDates[i]
    const expectedDate = currentDate.toISOString().split('T')[0]

    if (examDate === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
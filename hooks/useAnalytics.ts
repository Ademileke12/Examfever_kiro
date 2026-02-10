'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserId } from '@/lib/auth/user'

interface AnalyticsData {
  totalExams: number
  totalStudyTime: number
  averageScore: number
  completionRate: number
  streakDays: number
  weeklyGoal: number
  weeklyProgress: number
}

interface PerformanceData {
  scores: number[]
  dates: string[]
  subjects: { [key: string]: number }
  difficulty: { [key: string]: number }
}

interface KnowledgeGap {
  subject: string
  topic: string
  score: number
  attempts: number
}

interface MasteryArea {
  subject: string
  topic: string
  score: number
  consistency: number
}

interface Recommendation {
  type: 'study' | 'practice' | 'review'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export function useAnalytics(days: number = 30) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([])
  const [masteryAreas, setMasteryAreas] = useState<MasteryArea[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(days)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user ID from localStorage or session
      const userId = getUserId()

      // Fetch real analytics data from API
      const response = await fetch(`/api/analytics?userId=${userId}&days=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }

      const { analyticsData, performanceData, knowledgeGaps, masteryAreas, recommendations } = result.data

      setAnalyticsData(analyticsData)
      setPerformanceData(performanceData)
      setKnowledgeGaps(knowledgeGaps)
      setMasteryAreas(masteryAreas)
      setRecommendations(recommendations)

    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
      
      // Fallback to empty data instead of mock data
      setAnalyticsData({
        totalExams: 0,
        totalStudyTime: 0,
        averageScore: 0,
        completionRate: 0,
        streakDays: 0,
        weeklyGoal: 3,
        weeklyProgress: 0
      })
      setPerformanceData({
        scores: [],
        dates: [],
        subjects: {},
        difficulty: { 'Easy': 0, 'Medium': 0, 'Hard': 0 }
      })
      setKnowledgeGaps([])
      setMasteryAreas([])
      setRecommendations([
        {
          type: 'study',
          title: 'Start Taking Exams',
          description: 'Take your first exam to begin tracking your progress and get personalized recommendations.',
          priority: 'high'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const updateTimeRange = useCallback((newDays: number) => {
    setTimeRange(newDays)
  }, [])

  const refetch = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analyticsData,
    performanceData,
    knowledgeGaps,
    masteryAreas,
    recommendations,
    loading,
    error,
    refetch,
    updateTimeRange
  }
}

export function useActivityTracker() {
  const trackActivity = useCallback((activity: string, data?: any) => {
    // Mock activity tracking - in a real app, this would send to analytics service
    console.log('Activity tracked:', activity, data)
  }, [])

  return { trackActivity }
}
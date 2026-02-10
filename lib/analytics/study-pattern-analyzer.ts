import { StudyPattern, UserActivity } from '@/types/analytics'
import { PerformanceMetrics } from '@/types/performance'

export interface StudyHabits {
  optimal_study_times: OptimalTime[]
  study_consistency: ConsistencyMetrics
  session_patterns: SessionPattern[]
  productivity_insights: ProductivityInsight[]
  recommendations: StudyRecommendation[]
}

export interface OptimalTime {
  hour: number
  day_of_week: number
  performance_score: number
  frequency: number
  confidence: number
}

export interface ConsistencyMetrics {
  daily_consistency: number
  weekly_consistency: number
  monthly_consistency: number
  streak_length: number
  gap_frequency: number
}

export interface SessionPattern {
  typical_duration: number
  break_frequency: number
  peak_performance_minute: number
  fatigue_onset_minute: number
  optimal_session_length: number
}

export interface ProductivityInsight {
  insight_type: 'peak_time' | 'optimal_duration' | 'break_pattern' | 'consistency_issue'
  description: string
  impact_score: number
  actionable_advice: string
}

export interface StudyRecommendation {
  category: 'timing' | 'duration' | 'frequency' | 'breaks'
  recommendation: string
  expected_improvement: number
  difficulty_to_implement: 'easy' | 'medium' | 'hard'
}

export class StudyPatternAnalyzer {
  
  analyzeStudyPatterns(activities: UserActivity[]): StudyHabits {
    const studyActivities = this.filterStudyActivities(activities)
    const optimalTimes = this.findOptimalStudyTimes(studyActivities)
    const consistency = this.analyzeConsistency(studyActivities)
    const sessionPatterns = this.analyzeSessionPatterns(studyActivities)
    const insights = this.generateProductivityInsights(studyActivities, optimalTimes, consistency)
    const recommendations = this.generateStudyRecommendations(insights, consistency, sessionPatterns)

    return {
      optimal_study_times: optimalTimes,
      study_consistency: consistency,
      session_patterns: sessionPatterns,
      productivity_insights: insights,
      recommendations: recommendations
    }
  }

  generateStudySchedule(
    habits: StudyHabits,
    availableHours: { [key: number]: number[] }, // day_of_week -> available_hours
    targetHoursPerWeek: number
  ): WeeklySchedule {
    const schedule: WeeklySchedule = {
      weekly_hours: targetHoursPerWeek,
      daily_sessions: [],
      optimization_score: 0
    }

    // Sort optimal times by performance score
    const sortedOptimalTimes = habits.optimal_study_times
      .sort((a, b) => b.performance_score - a.performance_score)

    let remainingHours = targetHoursPerWeek
    const dailySessions: DailySession[] = []

    // Distribute hours across the week based on optimal times
    for (let day = 0; day < 7 && remainingHours > 0; day++) {
      const dayOptimalTimes = sortedOptimalTimes.filter(time => time.day_of_week === day)
      const availableHoursForDay = availableHours[day] || []

      if (dayOptimalTimes.length > 0 && availableHoursForDay.length > 0) {
        const optimalSessionLength = habits.session_patterns[0]?.optimal_session_length || 60
        const sessionsNeeded = Math.min(
          Math.floor(remainingHours * 60 / optimalSessionLength),
          availableHoursForDay.length
        )

        for (let i = 0; i < sessionsNeeded && remainingHours > 0; i++) {
          const sessionHours = Math.min(optimalSessionLength / 60, remainingHours)
          const timeSlot = dayOptimalTimes[i % dayOptimalTimes.length]
          
          if (!timeSlot) continue
          
          const startHour = timeSlot.hour

          if (availableHoursForDay.includes(startHour)) {
            dailySessions.push({
              day_of_week: day,
              start_hour: startHour,
              duration_minutes: sessionHours * 60,
              expected_performance: timeSlot.performance_score,
              break_intervals: this.calculateBreakIntervals(sessionHours * 60)
            })

            remainingHours -= sessionHours
          }
        }
      }
    }

    schedule.daily_sessions = dailySessions
    schedule.optimization_score = this.calculateOptimizationScore(schedule, habits)

    return schedule
  }

  private filterStudyActivities(activities: UserActivity[]): UserActivity[] {
    const studyActivityTypes = [
      'exam_started',
      'exam_completed',
      'question_answered',
      'pdf_uploaded',
      'questions_generated'
    ]

    return activities.filter(activity => 
      studyActivityTypes.includes(activity.activity_type)
    )
  }

  private findOptimalStudyTimes(activities: UserActivity[]): OptimalTime[] {
    const timePerformanceMap = new Map<string, { scores: number[], count: number }>()

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const key = `${dayOfWeek}-${hour}`

      // Extract performance score from metadata
      const score = this.extractPerformanceScore(activity)
      
      if (score > 0) {
        if (!timePerformanceMap.has(key)) {
          timePerformanceMap.set(key, { scores: [], count: 0 })
        }
        
        const entry = timePerformanceMap.get(key)!
        entry.scores.push(score)
        entry.count++
      }
    })

    return Array.from(timePerformanceMap.entries())
      .map(([key, data]) => {
        const parts = key.split('-').map(Number)
        const dayOfWeek = parts[0]
        const hour = parts[1]
        
        // Skip if parsing failed
        if (dayOfWeek === undefined || hour === undefined || isNaN(dayOfWeek) || isNaN(hour)) {
          return null
        }
        
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
        const confidence = Math.min(100, data.count * 10) // Higher confidence with more data

        return {
          hour,
          day_of_week: dayOfWeek,
          performance_score: Math.round(averageScore * 100) / 100,
          frequency: data.count,
          confidence: Math.round(confidence)
        }
      })
      .filter((time): time is NonNullable<typeof time> => time !== null && time.frequency >= 3) // Minimum 3 sessions for reliability
      .sort((a, b) => b.performance_score - a.performance_score)
  }

  private extractPerformanceScore(activity: UserActivity): number {
    switch (activity.activity_type) {
      case 'exam_completed':
        return activity.metadata.score || 0
      case 'question_answered':
        return activity.metadata.is_correct ? 100 : 0
      default:
        return 0
    }
  }

  private analyzeConsistency(activities: UserActivity[]): ConsistencyMetrics {
    const dailyActivity = this.groupActivitiesByDay(activities)
    const weeklyActivity = this.groupActivitiesByWeek(activities)
    
    const dailyConsistency = this.calculateDailyConsistency(dailyActivity)
    const weeklyConsistency = this.calculateWeeklyConsistency(weeklyActivity)
    const monthlyConsistency = this.calculateMonthlyConsistency(activities)
    const streakLength = this.calculateCurrentStreak(dailyActivity)
    const gapFrequency = this.calculateGapFrequency(dailyActivity)

    return {
      daily_consistency: Math.round(dailyConsistency * 100) / 100,
      weekly_consistency: Math.round(weeklyConsistency * 100) / 100,
      monthly_consistency: Math.round(monthlyConsistency * 100) / 100,
      streak_length: streakLength,
      gap_frequency: Math.round(gapFrequency * 100) / 100
    }
  }

  private groupActivitiesByDay(activities: UserActivity[]): Map<string, UserActivity[]> {
    const dailyMap = new Map<string, UserActivity[]>()

    activities.forEach(activity => {
      const dateStr = new Date(activity.timestamp).toISOString().split('T')[0]
      if (!dateStr) return // Skip if date parsing failed
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, [])
      }
      dailyMap.get(dateStr)!.push(activity)
    })

    return dailyMap
  }

  private groupActivitiesByWeek(activities: UserActivity[]): Map<string, UserActivity[]> {
    const weeklyMap = new Map<string, UserActivity[]>()

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weekKey) return // Skip if date parsing failed
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, [])
      }
      weeklyMap.get(weekKey)!.push(activity)
    })

    return weeklyMap
  }

  private calculateDailyConsistency(dailyActivity: Map<string, UserActivity[]>): number {
    const days = Array.from(dailyActivity.keys()).sort()
    if (days.length < 7) return 0

    const recentDays = days.slice(-30) // Last 30 days
    const activeDays = recentDays.filter(day => dailyActivity.get(day)!.length > 0)
    
    return (activeDays.length / recentDays.length) * 100
  }

  private calculateWeeklyConsistency(weeklyActivity: Map<string, UserActivity[]>): number {
    const weeks = Array.from(weeklyActivity.keys()).sort()
    if (weeks.length < 4) return 0

    const recentWeeks = weeks.slice(-12) // Last 12 weeks
    const activeWeeks = recentWeeks.filter(week => weeklyActivity.get(week)!.length >= 3) // At least 3 activities per week
    
    return (activeWeeks.length / recentWeeks.length) * 100
  }

  private calculateMonthlyConsistency(activities: UserActivity[]): number {
    const monthlyActivity = new Map<string, number>()

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyActivity.set(monthKey, (monthlyActivity.get(monthKey) || 0) + 1)
    })

    const months = Array.from(monthlyActivity.values())
    if (months.length < 2) return 100

    const average = months.reduce((sum, count) => sum + count, 0) / months.length
    const variance = months.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / months.length
    const coefficient = Math.sqrt(variance) / average

    return Math.max(0, 100 - (coefficient * 50)) // Lower coefficient = higher consistency
  }

  private calculateCurrentStreak(dailyActivity: Map<string, UserActivity[]>): number {
    const days = Array.from(dailyActivity.keys()).sort().reverse()
    let streak = 0

    for (const day of days) {
      if (dailyActivity.get(day)!.length > 0) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  private calculateGapFrequency(dailyActivity: Map<string, UserActivity[]>): number {
    const days = Array.from(dailyActivity.keys()).sort()
    if (days.length < 7) return 0

    let gaps = 0
    let consecutiveInactiveDays = 0

    for (let i = 1; i < days.length; i++) {
      const prevDay = days[i - 1]
      const currentDay = days[i]
      
      if (!prevDay || !currentDay) continue
      
      const prevDate = new Date(prevDay)
      const currentDate = new Date(currentDay)
      const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff > 1) {
        gaps++
        consecutiveInactiveDays += daysDiff - 1
      }
    }

    return gaps / days.length * 100
  }

  private analyzeSessionPatterns(activities: UserActivity[]): SessionPattern[] {
    const sessions = this.groupActivitiesBySession(activities)
    
    if (sessions.length === 0) {
      return [{
        typical_duration: 60,
        break_frequency: 0,
        peak_performance_minute: 30,
        fatigue_onset_minute: 90,
        optimal_session_length: 60
      }]
    }

    const durations = sessions.map(session => session.duration)
    const typicalDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length

    return [{
      typical_duration: Math.round(typicalDuration),
      break_frequency: this.calculateBreakFrequency(sessions),
      peak_performance_minute: this.findPeakPerformanceMinute(sessions),
      fatigue_onset_minute: this.findFatigueOnsetMinute(sessions),
      optimal_session_length: this.calculateOptimalSessionLength(sessions)
    }]
  }

  private groupActivitiesBySession(activities: UserActivity[]): SessionData[] {
    const sessions: SessionData[] = []
    const sessionMap = new Map<string, UserActivity[]>()

    activities.forEach(activity => {
      const sessionId = activity.session_id || 'default'
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, [])
      }
      sessionMap.get(sessionId)!.push(activity)
    })

    sessionMap.forEach((sessionActivities, sessionId) => {
      if (sessionActivities.length > 1) {
        const sortedActivities = sessionActivities.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        const firstActivity = sortedActivities[0]
        const lastActivity = sortedActivities[sortedActivities.length - 1]
        
        if (!firstActivity || !lastActivity) return
        
        const startTime = new Date(firstActivity.timestamp)
        const endTime = new Date(lastActivity.timestamp)
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes

        sessions.push({
          session_id: sessionId,
          activities: sortedActivities,
          duration: duration,
          start_time: startTime,
          end_time: endTime
        })
      }
    })

    return sessions
  }

  private calculateBreakFrequency(sessions: SessionData[]): number {
    // Simplified break detection based on activity gaps
    let totalBreaks = 0
    let totalSessions = sessions.length

    sessions.forEach(session => {
      const activities = session.activities
      let breaks = 0

      for (let i = 1; i < activities.length; i++) {
        const prevActivity = activities[i - 1]
        const currentActivity = activities[i]
        
        if (!prevActivity || !currentActivity) continue
        
        const prevTime = new Date(prevActivity.timestamp)
        const currentTime = new Date(currentActivity.timestamp)
        const gap = (currentTime.getTime() - prevTime.getTime()) / (1000 * 60) // minutes

        if (gap > 10) { // 10+ minute gap considered a break
          breaks++
        }
      }

      totalBreaks += breaks
    })

    return totalSessions > 0 ? totalBreaks / totalSessions : 0
  }

  private findPeakPerformanceMinute(sessions: SessionData[]): number {
    // Simplified - assume peak performance is in the first third of session
    const averageDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length
    return Math.round(averageDuration * 0.3)
  }

  private findFatigueOnsetMinute(sessions: SessionData[]): number {
    // Simplified - assume fatigue starts at 75% of average session length
    const averageDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length
    return Math.round(averageDuration * 0.75)
  }

  private calculateOptimalSessionLength(sessions: SessionData[]): number {
    // Find session length that maximizes performance
    const durationPerformanceMap = new Map<number, number[]>()

    sessions.forEach(session => {
      const durationBucket = Math.floor(session.duration / 15) * 15 // 15-minute buckets
      const performance = this.calculateSessionPerformance(session)

      if (!durationPerformanceMap.has(durationBucket)) {
        durationPerformanceMap.set(durationBucket, [])
      }
      durationPerformanceMap.get(durationBucket)!.push(performance)
    })

    let bestDuration = 60 // Default
    let bestPerformance = 0

    durationPerformanceMap.forEach((performances, duration) => {
      const avgPerformance = performances.reduce((sum, perf) => sum + perf, 0) / performances.length
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance
        bestDuration = duration
      }
    })

    return bestDuration
  }

  private calculateSessionPerformance(session: SessionData): number {
    const examCompletions = session.activities.filter(a => a.activity_type === 'exam_completed')
    const questionAnswers = session.activities.filter(a => a.activity_type === 'question_answered')

    if (examCompletions.length > 0) {
      return examCompletions.reduce((sum, activity) => sum + (activity.metadata.score || 0), 0) / examCompletions.length
    }

    if (questionAnswers.length > 0) {
      const correctAnswers = questionAnswers.filter(a => a.metadata.is_correct).length
      return (correctAnswers / questionAnswers.length) * 100
    }

    return 50 // Default neutral performance
  }

  private generateProductivityInsights(
    activities: UserActivity[],
    optimalTimes: OptimalTime[],
    consistency: ConsistencyMetrics
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = []

    // Peak time insights
    if (optimalTimes.length > 0) {
      const bestTime = optimalTimes[0]
      if (bestTime) {
        insights.push({
          insight_type: 'peak_time',
          description: `Your peak performance occurs on ${this.getDayName(bestTime.day_of_week)} at ${bestTime.hour}:00`,
          impact_score: bestTime.performance_score,
          actionable_advice: `Schedule your most challenging study sessions during this time for maximum effectiveness`
        })
      }
    }

    // Consistency insights
    if (consistency.daily_consistency < 70) {
      insights.push({
        insight_type: 'consistency_issue',
        description: `Your daily study consistency is ${consistency.daily_consistency}%, which could be improved`,
        impact_score: 100 - consistency.daily_consistency,
        actionable_advice: `Try to study for at least 15 minutes every day to build a consistent habit`
      })
    }

    return insights
  }

  private generateStudyRecommendations(
    insights: ProductivityInsight[],
    consistency: ConsistencyMetrics,
    sessionPatterns: SessionPattern[]
  ): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = []

    // Timing recommendations
    if (insights.some(i => i.insight_type === 'peak_time')) {
      recommendations.push({
        category: 'timing',
        recommendation: 'Schedule difficult topics during your peak performance hours',
        expected_improvement: 15,
        difficulty_to_implement: 'easy'
      })
    }

    // Consistency recommendations
    if (consistency.daily_consistency < 80) {
      recommendations.push({
        category: 'frequency',
        recommendation: 'Establish a daily study routine, even if just 15 minutes',
        expected_improvement: 25,
        difficulty_to_implement: 'medium'
      })
    }

    // Session length recommendations
    if (sessionPatterns.length > 0) {
      const firstPattern = sessionPatterns[0]
      if (firstPattern) {
        const optimalLength = firstPattern.optimal_session_length
        recommendations.push({
          category: 'duration',
          recommendation: `Aim for ${optimalLength}-minute study sessions for optimal performance`,
          expected_improvement: 10,
          difficulty_to_implement: 'easy'
        })
      }
    }

    return recommendations
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek] || 'Unknown'
  }

  private calculateBreakIntervals(durationMinutes: number): number[] {
    const intervals: number[] = []
    const breakInterval = 25 // Pomodoro-style 25-minute intervals

    for (let i = breakInterval; i < durationMinutes; i += breakInterval + 5) {
      intervals.push(i)
    }

    return intervals
  }

  private calculateOptimizationScore(schedule: WeeklySchedule, habits: StudyHabits): number {
    let score = 0
    const maxScore = schedule.daily_sessions.length * 100

    schedule.daily_sessions.forEach(session => {
      // Score based on alignment with optimal times
      const matchingOptimalTime = habits.optimal_study_times.find(
        time => time.day_of_week === session.day_of_week && 
                Math.abs(time.hour - session.start_hour) <= 1
      )

      if (matchingOptimalTime) {
        score += matchingOptimalTime.performance_score
      } else {
        score += 50 // Neutral score for non-optimal times
      }
    })

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }
}

interface SessionData {
  session_id: string
  activities: UserActivity[]
  duration: number
  start_time: Date
  end_time: Date
}

interface WeeklySchedule {
  weekly_hours: number
  daily_sessions: DailySession[]
  optimization_score: number
}

interface DailySession {
  day_of_week: number
  start_hour: number
  duration_minutes: number
  expected_performance: number
  break_intervals: number[]
}

import { 
  PerformanceMetrics, 
  DetailedPerformance, 
  TopicPerformance, 
  DifficultyPerformance,
  TimeBasedPerformance,
  PerformanceComparison,
  StudyEfficiency,
  LearningVelocity
} from '@/types/performance'
import { PerformanceTrend } from '@/types/analytics'

export interface ExamResult {
  id: string
  date: string
  score: number
  questions_answered: number
  questions_correct: number
  total_time: number
  topics_covered: string[]
  difficulty_level: string
}

export class PerformanceCalculator {
  
  calculateOverallMetrics(examResults: ExamResult[]): PerformanceMetrics {
    if (examResults.length === 0) {
      return {
        accuracy: 0,
        average_time: 0,
        improvement: 0,
        consistency: 0,
        efficiency: 0,
        streak: 0
      }
    }

    const totalQuestions = examResults.reduce((sum, exam) => sum + exam.questions_answered, 0)
    const totalCorrect = examResults.reduce((sum, exam) => sum + exam.questions_correct, 0)
    const totalTime = examResults.reduce((sum, exam) => sum + exam.total_time, 0)

    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0
    const improvement = this.calculateImprovement(examResults)
    const consistency = this.calculateConsistency(examResults)
    const efficiency = this.calculateEfficiency(examResults)
    const streak = this.calculateStreak(examResults)

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      average_time: Math.round(averageTime * 100) / 100,
      improvement: Math.round(improvement * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      streak
    }
  }

  calculateDetailedPerformance(examResults: ExamResult[]): DetailedPerformance {
    const overall = this.calculateOverallMetrics(examResults)
    const byTopic = this.calculateTopicPerformance(examResults)
    const byDifficulty = this.calculateDifficultyPerformance(examResults)
    const byTimePeriod = this.calculateTimeBasedPerformance(examResults)
    const trends = this.calculateTrends(examResults)

    return {
      overall,
      by_topic: byTopic,
      by_difficulty: byDifficulty,
      by_time_period: byTimePeriod,
      trends
    }
  }

  private calculateImprovement(examResults: ExamResult[]): number {
    if (examResults.length < 2) return 0

    const sortedResults = [...examResults].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstHalf = sortedResults.slice(0, Math.floor(sortedResults.length / 2))
    const secondHalf = sortedResults.slice(Math.floor(sortedResults.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, exam) => sum + exam.score, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, exam) => sum + exam.score, 0) / secondHalf.length

    return secondHalfAvg - firstHalfAvg
  }

  private calculateConsistency(examResults: ExamResult[]): number {
    if (examResults.length < 2) return 100

    const scores = examResults.map(exam => exam.score)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)

    // Convert to consistency score (lower deviation = higher consistency)
    const maxPossibleDeviation = 50 // Assuming scores range 0-100
    return Math.max(0, 100 - (standardDeviation / maxPossibleDeviation) * 100)
  }

  private calculateEfficiency(examResults: ExamResult[]): number {
    if (examResults.length === 0) return 0

    const efficiencyScores = examResults.map(exam => {
      const questionsPerMinute = exam.questions_answered / (exam.total_time / 60)
      const accuracyWeight = exam.score / 100
      return questionsPerMinute * accuracyWeight
    })

    return efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
  }

  private calculateStreak(examResults: ExamResult[]): number {
    if (examResults.length === 0) return 0

    const sortedResults = [...examResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    let lastDate = new Date()

    for (const exam of sortedResults) {
      const examDate = new Date(exam.date)
      const daysDiff = Math.floor((lastDate.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff <= 1 && exam.score >= 70) { // Minimum 70% for streak
        streak++
        lastDate = examDate
      } else {
        break
      }
    }

    return streak
  }

  private calculateTopicPerformance(examResults: ExamResult[]): TopicPerformance[] {
    const topicMap = new Map<string, ExamResult[]>()

    examResults.forEach(exam => {
      exam.topics_covered.forEach(topic => {
        if (!topicMap.has(topic)) {
          topicMap.set(topic, [])
        }
        topicMap.get(topic)!.push(exam)
      })
    })

    return Array.from(topicMap.entries()).map(([topic, topicExams]) => {
      const metrics = this.calculateOverallMetrics(topicExams)
      const questionCount = topicExams.reduce((sum, exam) => sum + exam.questions_answered, 0)
      const timeSpent = topicExams.reduce((sum, exam) => sum + exam.total_time, 0)
      const lastPracticed = Math.max(...topicExams.map(exam => new Date(exam.date).getTime()))
      const masteryLevel = Math.min(100, metrics.accuracy * (metrics.consistency / 100))

      return {
        topic,
        metrics,
        question_count: questionCount,
        time_spent: timeSpent,
        mastery_level: Math.round(masteryLevel * 100) / 100,
        last_practiced: new Date(lastPracticed).toISOString()
      }
    })
  }

  private calculateDifficultyPerformance(examResults: ExamResult[]): DifficultyPerformance[] {
    const difficulties = ['easy', 'medium', 'hard'] as const
    
    return difficulties.map(difficulty => {
      const difficultyExams = examResults.filter(exam => exam.difficulty_level === difficulty)
      const metrics = this.calculateOverallMetrics(difficultyExams)
      const questionCount = difficultyExams.reduce((sum, exam) => sum + exam.questions_answered, 0)
      const successRate = difficultyExams.length > 0 
        ? difficultyExams.filter(exam => exam.score >= 70).length / difficultyExams.length * 100
        : 0

      return {
        difficulty,
        metrics,
        question_count: questionCount,
        success_rate: Math.round(successRate * 100) / 100,
        average_attempts: difficultyExams.length
      }
    })
  }

  private calculateTimeBasedPerformance(examResults: ExamResult[]): TimeBasedPerformance[] {
    const dailyMap = new Map<string, ExamResult[]>()

    examResults.forEach(exam => {
      const datePart = exam.date.split('T')[0] // Get date part only
      if (!datePart) return // Skip if no valid date
      
      if (!dailyMap.has(datePart)) {
        dailyMap.set(datePart, [])
      }
      dailyMap.get(datePart)!.push(exam)
    })

    return Array.from(dailyMap.entries()).map(([date, dayExams]) => {
      const metrics = this.calculateOverallMetrics(dayExams)
      const examsCount = dayExams.length
      const totalTime = dayExams.reduce((sum, exam) => sum + exam.total_time, 0)

      return {
        period: 'daily',
        date,
        metrics,
        exams_taken: examsCount,
        total_time: totalTime
      }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  private calculateTrends(examResults: ExamResult[]): PerformanceTrend[] {
    return examResults
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(exam => ({
        date: exam.date,
        score: exam.score,
        questions_answered: exam.questions_answered,
        time_spent: exam.total_time,
        topics_covered: exam.topics_covered
      }))
  }

  calculateComparison(
    currentResults: ExamResult[], 
    previousResults: ExamResult[]
  ): PerformanceComparison {
    const currentMetrics = this.calculateOverallMetrics(currentResults)
    const previousMetrics = this.calculateOverallMetrics(previousResults)

    const changePercentage = previousMetrics.accuracy > 0 
      ? ((currentMetrics.accuracy - previousMetrics.accuracy) / previousMetrics.accuracy) * 100
      : 0

    const improvementAreas: string[] = []
    const decliningAreas: string[] = []

    if (currentMetrics.accuracy > previousMetrics.accuracy) improvementAreas.push('accuracy')
    else if (currentMetrics.accuracy < previousMetrics.accuracy) decliningAreas.push('accuracy')

    if (currentMetrics.average_time < previousMetrics.average_time) improvementAreas.push('speed')
    else if (currentMetrics.average_time > previousMetrics.average_time) decliningAreas.push('speed')

    if (currentMetrics.consistency > previousMetrics.consistency) improvementAreas.push('consistency')
    else if (currentMetrics.consistency < previousMetrics.consistency) decliningAreas.push('consistency')

    return {
      current_period: currentMetrics,
      previous_period: previousMetrics,
      change_percentage: Math.round(changePercentage * 100) / 100,
      improvement_areas: improvementAreas,
      declining_areas: decliningAreas
    }
  }

  calculateStudyEfficiency(examResults: ExamResult[]): StudyEfficiency {
    if (examResults.length === 0) {
      return {
        questions_per_hour: 0,
        accuracy_per_minute: 0,
        optimal_study_duration: 30,
        fatigue_indicators: [],
        peak_performance_times: []
      }
    }

    const totalQuestions = examResults.reduce((sum, exam) => sum + exam.questions_answered, 0)
    const totalHours = examResults.reduce((sum, exam) => sum + exam.total_time, 0) / 3600

    const questionsPerHour = totalHours > 0 ? totalQuestions / totalHours : 0
    const accuracyPerMinute = examResults.reduce((sum, exam) => {
      const minutes = exam.total_time / 60
      return sum + (exam.score / 100) / minutes
    }, 0) / examResults.length

    return {
      questions_per_hour: Math.round(questionsPerHour * 100) / 100,
      accuracy_per_minute: Math.round(accuracyPerMinute * 100) / 100,
      optimal_study_duration: this.calculateOptimalDuration(examResults),
      fatigue_indicators: this.detectFatigueIndicators(examResults),
      peak_performance_times: this.findPeakPerformanceTimes(examResults)
    }
  }

  private calculateOptimalDuration(examResults: ExamResult[]): number {
    // Find duration that maximizes accuracy
    const durationGroups = new Map<number, ExamResult[]>()
    
    examResults.forEach(exam => {
      const durationBucket = Math.floor(exam.total_time / 600) * 10 // 10-minute buckets
      if (!durationGroups.has(durationBucket)) {
        durationGroups.set(durationBucket, [])
      }
      durationGroups.get(durationBucket)!.push(exam)
    })

    let bestDuration = 30
    let bestAccuracy = 0

    durationGroups.forEach((exams, duration) => {
      const avgAccuracy = exams.reduce((sum, exam) => sum + exam.score, 0) / exams.length
      if (avgAccuracy > bestAccuracy) {
        bestAccuracy = avgAccuracy
        bestDuration = duration
      }
    })

    return bestDuration
  }

  private detectFatigueIndicators(examResults: ExamResult[]) {
    // Simplified fatigue detection
    return examResults
      .filter(exam => exam.total_time > 3600) // Sessions longer than 1 hour
      .map(exam => ({
        session_duration: exam.total_time,
        accuracy_decline: Math.max(0, 80 - exam.score), // Assuming 80% is baseline
        response_time_increase: Math.max(0, exam.total_time / exam.questions_answered - 60), // Assuming 60s is baseline
        error_rate_increase: Math.max(0, (100 - exam.score) - 20) // Assuming 20% error rate is baseline
      }))
  }

  private findPeakPerformanceTimes(examResults: ExamResult[]): string[] {
    const hourlyPerformance = new Map<number, number[]>()

    examResults.forEach(exam => {
      const hour = new Date(exam.date).getHours()
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, [])
      }
      hourlyPerformance.get(hour)!.push(exam.score)
    })

    const hourlyAverages = Array.from(hourlyPerformance.entries())
      .map(([hour, scores]) => ({
        hour,
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3) // Top 3 hours

    return hourlyAverages.map(({ hour }) => `${hour}:00`)
  }
}

import { PerformanceTrend } from '@/types/analytics'
import { PerformanceMetrics } from '@/types/performance'

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable'
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  slope: number
  r_squared: number
  prediction: number
}

export interface PatternDetection {
  weekly_patterns: WeeklyPattern[]
  seasonal_trends: SeasonalTrend[]
  performance_cycles: PerformanceCycle[]
  anomalies: Anomaly[]
}

export interface WeeklyPattern {
  day_of_week: number
  average_performance: number
  consistency: number
  activity_level: number
}

export interface SeasonalTrend {
  period: string
  trend_direction: 'up' | 'down' | 'stable'
  magnitude: number
  confidence: number
}

export interface PerformanceCycle {
  cycle_length: number
  peak_performance_day: number
  low_performance_day: number
  amplitude: number
}

export interface Anomaly {
  date: string
  expected_score: number
  actual_score: number
  deviation: number
  possible_causes: string[]
}

export class TrendAnalyzer {
  
  analyzePerformanceTrend(trends: PerformanceTrend[]): TrendAnalysis {
    if (trends.length < 3) {
      const lastTrend = trends[trends.length - 1]
      return {
        direction: 'stable',
        strength: 'weak',
        confidence: 0,
        slope: 0,
        r_squared: 0,
        prediction: lastTrend ? lastTrend.score : 0
      }
    }

    const sortedTrends = [...trends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const regression = this.calculateLinearRegression(sortedTrends)
    
    const direction = this.determineDirection(regression.slope)
    const strength = this.determineStrength(regression.r_squared)
    const confidence = this.calculateConfidence(regression.r_squared, sortedTrends.length)
    const prediction = this.predictNextScore(sortedTrends, regression)

    return {
      direction,
      strength,
      confidence: Math.round(confidence * 100) / 100,
      slope: Math.round(regression.slope * 100) / 100,
      r_squared: Math.round(regression.r_squared * 100) / 100,
      prediction: Math.round(prediction * 100) / 100
    }
  }

  detectPatterns(trends: PerformanceTrend[]): PatternDetection {
    const weeklyPatterns = this.analyzeWeeklyPatterns(trends)
    const seasonalTrends = this.analyzeSeasonalTrends(trends)
    const performanceCycles = this.detectPerformanceCycles(trends)
    const anomalies = this.detectAnomalies(trends)

    return {
      weekly_patterns: weeklyPatterns,
      seasonal_trends: seasonalTrends,
      performance_cycles: performanceCycles,
      anomalies: anomalies
    }
  }

  private calculateLinearRegression(trends: PerformanceTrend[]) {
    const n = trends.length
    const x = trends.map((_, index) => index)
    const y = trends.map(trend => trend.score)

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => {
      const yVal = y[i]
      return yVal !== undefined ? sum + val * yVal : sum
    }, 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared
    const yMean = sumY / n
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0)
    const ssResidual = y.reduce((sum, val, i) => {
      const xVal = x[i]
      if (xVal !== undefined) {
        const predicted = slope * xVal + intercept
        return sum + Math.pow(val - predicted, 2)
      }
      return sum
    }, 0)
    const rSquared = 1 - (ssResidual / ssTotal)

    return { slope, intercept, r_squared: rSquared }
  }

  private determineDirection(slope: number): 'improving' | 'declining' | 'stable' {
    if (Math.abs(slope) < 0.1) return 'stable'
    return slope > 0 ? 'improving' : 'declining'
  }

  private determineStrength(rSquared: number): 'weak' | 'moderate' | 'strong' {
    if (rSquared < 0.3) return 'weak'
    if (rSquared < 0.7) return 'moderate'
    return 'strong'
  }

  private calculateConfidence(rSquared: number, sampleSize: number): number {
    // Confidence based on R-squared and sample size
    const baseConfidence = rSquared
    const sampleAdjustment = Math.min(1, sampleSize / 20) // Full confidence at 20+ samples
    return baseConfidence * sampleAdjustment * 100
  }

  private predictNextScore(trends: PerformanceTrend[], regression: any): number {
    const nextIndex = trends.length
    const prediction = regression.slope * nextIndex + regression.intercept
    return Math.max(0, Math.min(100, prediction)) // Clamp between 0-100
  }

  private analyzeWeeklyPatterns(trends: PerformanceTrend[]): WeeklyPattern[] {
    const weeklyData = new Map<number, number[]>()

    trends.forEach(trend => {
      const dayOfWeek = new Date(trend.date).getDay()
      if (!weeklyData.has(dayOfWeek)) {
        weeklyData.set(dayOfWeek, [])
      }
      weeklyData.get(dayOfWeek)!.push(trend.score)
    })

    return Array.from(weeklyData.entries()).map(([dayOfWeek, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
      const consistency = Math.max(0, 100 - Math.sqrt(variance))

      return {
        day_of_week: dayOfWeek,
        average_performance: Math.round(average * 100) / 100,
        consistency: Math.round(consistency * 100) / 100,
        activity_level: scores.length
      }
    }).sort((a, b) => a.day_of_week - b.day_of_week)
  }

  private analyzeSeasonalTrends(trends: PerformanceTrend[]): SeasonalTrend[] {
    if (trends.length < 30) return [] // Need at least 30 days for seasonal analysis

    const monthlyData = new Map<number, number[]>()

    trends.forEach(trend => {
      const month = new Date(trend.date).getMonth()
      if (!monthlyData.has(month)) {
        monthlyData.set(month, [])
      }
      monthlyData.get(month)!.push(trend.score)
    })

    return Array.from(monthlyData.entries())
      .map(([month, scores]) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const overallAverage = trends.reduce((sum, trend) => sum + trend.score, 0) / trends.length
        const deviation = average - overallAverage

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthName = monthNames[month]
        
        if (!monthName) return null

        return {
          period: monthName,
          trend_direction: (Math.abs(deviation) < 2 ? 'stable' : (deviation > 0 ? 'up' : 'down')) as 'stable' | 'up' | 'down',
          magnitude: Math.abs(deviation),
          confidence: Math.min(100, scores.length * 5) // Higher confidence with more data points
        }
      })
      .filter((trend): trend is NonNullable<typeof trend> => trend !== null)
  }

  private detectPerformanceCycles(trends: PerformanceTrend[]): PerformanceCycle[] {
    if (trends.length < 14) return [] // Need at least 2 weeks of data

    // Simple cycle detection using moving averages
    const windowSize = 7 // 7-day window
    const movingAverages: number[] = []

    for (let i = windowSize - 1; i < trends.length; i++) {
      const window = trends.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, trend) => sum + trend.score, 0) / window.length
      movingAverages.push(average)
    }

    // Find peaks and valleys
    const peaks: number[] = []
    const valleys: number[] = []

    for (let i = 1; i < movingAverages.length - 1; i++) {
      const current = movingAverages[i]
      const prev = movingAverages[i - 1]
      const next = movingAverages[i + 1]
      
      if (current !== undefined && prev !== undefined && next !== undefined) {
        if (current > prev && current > next) {
          peaks.push(i)
        }
        if (current < prev && current < next) {
          valleys.push(i)
        }
      }
    }

    if (peaks.length < 2 || valleys.length < 2) return []

    // Calculate average cycle length
    const peakIntervals = peaks.slice(1).map((peak, i) => {
      const prevPeak = peaks[i]
      return prevPeak !== undefined ? peak - prevPeak : 0
    }).filter(interval => interval > 0)
    const avgCycleLength = peakIntervals.reduce((sum, interval) => sum + interval, 0) / peakIntervals.length

    // Find typical peak and valley days
    const peakDay = peaks.reduce((sum, peak) => sum + (peak % 7), 0) / peaks.length
    const valleyDay = valleys.reduce((sum, valley) => sum + (valley % 7), 0) / valleys.length

    // Calculate amplitude
    const peakValues = peaks.map(i => movingAverages[i]).filter((val): val is number => val !== undefined)
    const valleyValues = valleys.map(i => movingAverages[i]).filter((val): val is number => val !== undefined)
    
    if (peakValues.length === 0 || valleyValues.length === 0) return []
    
    const avgPeak = peakValues.reduce((sum, val) => sum + val, 0) / peakValues.length
    const avgValley = valleyValues.reduce((sum, val) => sum + val, 0) / valleyValues.length
    const amplitude = avgPeak - avgValley

    return [{
      cycle_length: Math.round(avgCycleLength),
      peak_performance_day: Math.round(peakDay),
      low_performance_day: Math.round(valleyDay),
      amplitude: Math.round(amplitude * 100) / 100
    }]
  }

  private detectAnomalies(trends: PerformanceTrend[]): Anomaly[] {
    if (trends.length < 10) return []

    const scores = trends.map(trend => trend.score)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)

    const threshold = 2 * stdDev // 2 standard deviations

    return trends
      .map((trend, index) => {
        const deviation = Math.abs(trend.score - mean)
        if (deviation > threshold) {
          const possibleCauses = this.identifyPossibleCauses(trend, trends, index)
          return {
            date: trend.date,
            expected_score: Math.round(mean * 100) / 100,
            actual_score: trend.score,
            deviation: Math.round(deviation * 100) / 100,
            possible_causes: possibleCauses
          }
        }
        return null
      })
      .filter((anomaly): anomaly is Anomaly => anomaly !== null)
  }

  private identifyPossibleCauses(
    anomaly: PerformanceTrend, 
    allTrends: PerformanceTrend[], 
    index: number
  ): string[] {
    const causes: string[] = []

    // Check if it's a weekend
    const dayOfWeek = new Date(anomaly.date).getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      causes.push('Weekend effect')
    }

    // Check if time spent was unusual
    const avgTime = allTrends.reduce((sum, trend) => sum + trend.time_spent, 0) / allTrends.length
    if (anomaly.time_spent > avgTime * 1.5) {
      causes.push('Extended study session')
    } else if (anomaly.time_spent < avgTime * 0.5) {
      causes.push('Shortened study session')
    }

    // Check if it's after a break
    if (index > 0) {
      const prevTrend = allTrends[index - 1]
      if (prevTrend) {
        const prevDate = new Date(prevTrend.date)
        const currentDate = new Date(anomaly.date)
        const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysDiff > 3) {
          causes.push('Return after break')
        }
      }
    }

    // Check if topics were different
    const commonTopics = allTrends
      .flatMap(trend => trend.topics_covered)
      .reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const hasUncommonTopics = anomaly.topics_covered.some(topic => 
      (commonTopics[topic] || 0) < allTrends.length * 0.3
    )

    if (hasUncommonTopics) {
      causes.push('New or uncommon topics')
    }

    if (causes.length === 0) {
      causes.push('Unknown factors')
    }

    return causes
  }

  calculateMovingAverage(trends: PerformanceTrend[], windowSize: number = 7): PerformanceTrend[] {
    if (trends.length < windowSize) return trends

    const result: PerformanceTrend[] = []

    for (let i = windowSize - 1; i < trends.length; i++) {
      const window = trends.slice(i - windowSize + 1, i + 1)
      const currentTrend = trends[i]
      
      if (!currentTrend) continue
      
      const avgScore = window.reduce((sum, trend) => sum + trend.score, 0) / window.length
      const avgTime = window.reduce((sum, trend) => sum + trend.time_spent, 0) / window.length
      const avgQuestions = window.reduce((sum, trend) => sum + trend.questions_answered, 0) / window.length

      result.push({
        date: currentTrend.date,
        score: Math.round(avgScore * 100) / 100,
        questions_answered: Math.round(avgQuestions),
        time_spent: Math.round(avgTime),
        topics_covered: currentTrend.topics_covered
      })
    }

    return result
  }
}

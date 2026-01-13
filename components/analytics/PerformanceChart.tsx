import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { motion } from 'framer-motion'
import { PerformanceTrend } from '@/types/analytics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PerformanceChartProps {
  trends: PerformanceTrend[]
  loading?: boolean
  height?: number
  showMovingAverage?: boolean
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
}

export default function PerformanceChart({ 
  trends, 
  loading = false, 
  height = 300,
  showMovingAverage = true,
  timeRange = 'month'
}: PerformanceChartProps) {
  
  const processedData = React.useMemo(() => {
    if (!trends || trends.length === 0) return null

    const sortedTrends = [...trends].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const labels = sortedTrends.map(trend => {
      const date = new Date(trend.date)
      return timeRange === 'week' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const scoreData = sortedTrends.map(trend => trend.score)
    
    // Calculate moving average if enabled
    const movingAverageData = showMovingAverage 
      ? calculateMovingAverage(scoreData, 3)
      : []

    return {
      labels,
      datasets: [
        {
          label: 'Performance Score',
          data: scoreData,
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsla(var(--primary), 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(var(--primary))',
          pointBorderColor: 'hsl(var(--background))',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        ...(showMovingAverage && movingAverageData.length > 0 ? [{
          label: 'Trend Line',
          data: movingAverageData,
          borderColor: 'hsl(var(--secondary))',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        }] : [])
      ]
    }
  }, [trends, showMovingAverage, timeRange])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'hsl(var(--foreground))',
          font: {
            size: 12,
            weight: 500 as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0]?.dataIndex
            const trend = trends[index]
            if (!trend) return 'Unknown Date'
            return new Date(trend.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          },
          afterBody: (context: any) => {
            const index = context[0]?.dataIndex
            const trend = trends[index]
            if (!trend) return []
            return [
              `Questions: ${trend.questions_answered}`,
              `Time: ${Math.round(trend.time_spent / 60)}min`,
              `Topics: ${trend.topics_covered.join(', ')}`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        min: 0,
        max: 100,
        grid: {
          color: 'hsla(var(--muted-foreground), 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          callback: (value: any) => `${value}%`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const
    }
  }

  if (loading) {
    return (
      <div className="w-full bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
        <div className="h-[300px] bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!processedData) {
    return (
      <div className="w-full bg-card rounded-lg border p-6">
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-lg font-medium mb-1">No Performance Data</h3>
          <p className="text-sm text-center">
            Complete some exams to see your performance trends
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="w-full bg-card rounded-lg border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance Trend</h3>
          <p className="text-sm text-muted-foreground">
            Your score progression over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PerformanceIndicator trends={trends} />
        </div>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <Line data={processedData} options={options} />
      </div>
      
      <PerformanceInsights trends={trends} />
    </motion.div>
  )
}

function calculateMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      const value = data[i]
      if (value !== undefined) {
        result.push(value)
      }
    } else {
      const window = data.slice(i - windowSize + 1, i + 1).filter(val => val !== undefined)
      if (window.length > 0) {
        const average = window.reduce((sum, val) => sum + val, 0) / window.length
        result.push(Math.round(average * 100) / 100)
      }
    }
  }
  
  return result
}

function PerformanceIndicator({ trends }: { trends: PerformanceTrend[] }) {
  if (trends.length < 2) return null

  const recent = trends.slice(-5)
  const older = trends.slice(-10, -5)
  
  const recentAvg = recent.reduce((sum, t) => sum + t.score, 0) / recent.length
  const olderAvg = older.length > 0 
    ? older.reduce((sum, t) => sum + t.score, 0) / older.length 
    : recentAvg

  const change = recentAvg - olderAvg
  const isImproving = change > 1
  const isStable = Math.abs(change) <= 1
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        isImproving 
          ? 'bg-success/10 text-success' 
          : isStable 
            ? 'bg-muted text-muted-foreground'
            : 'bg-destructive/10 text-destructive'
      }`}>
        <span>
          {isImproving ? '↗' : isStable ? '→' : '↘'}
        </span>
        <span>
          {isImproving ? 'Improving' : isStable ? 'Stable' : 'Declining'}
        </span>
      </div>
    </div>
  )
}

function PerformanceInsights({ trends }: { trends: PerformanceTrend[] }) {
  const insights = React.useMemo(() => {
    if (trends.length < 3) return []

    const results: string[] = []
    const scores = trends.map(t => t.score)
    const latest = scores[scores.length - 1]
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    if (latest !== undefined && latest > average + 5) {
      results.push('🎉 Your latest performance is above your average!')
    }
    
    const streak = calculateStreak(scores)
    if (streak >= 3) {
      results.push(`🔥 You're on a ${streak}-session improvement streak!`)
    }
    
    const bestScore = Math.max(...scores)
    if (latest !== undefined && latest === bestScore) {
      results.push('⭐ This is your best performance yet!')
    }
    
    return results.slice(0, 2) // Show max 2 insights
  }, [trends])

  if (insights.length === 0) return null

  return (
    <motion.div 
      className="mt-4 pt-4 border-t border-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <motion.p 
            key={index}
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
          >
            {insight}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}

function calculateStreak(scores: number[]): number {
  let streak = 0
  
  for (let i = scores.length - 1; i > 0; i--) {
    const current = scores[i]
    const previous = scores[i - 1]
    if (current !== undefined && previous !== undefined && current >= previous) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

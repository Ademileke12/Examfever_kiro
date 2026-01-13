import React from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { motion } from 'framer-motion'
import { KnowledgeGap } from '@/types/analytics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface KnowledgeGapAnalysisProps {
  gaps: KnowledgeGap[]
  loading?: boolean
  viewType?: 'bar' | 'doughnut' | 'heatmap'
}

export default function KnowledgeGapAnalysis({ 
  gaps, 
  loading = false,
  viewType = 'bar'
}: KnowledgeGapAnalysisProps) {
  
  const [selectedView, setSelectedView] = React.useState(viewType)

  const processedData = React.useMemo(() => {
    if (!gaps || gaps.length === 0) return null

    const sortedGaps = [...gaps].sort((a, b) => b.improvement_needed - a.improvement_needed)
    
    return {
      labels: sortedGaps.map(gap => gap.topic),
      datasets: [
        {
          label: 'Accuracy Rate',
          data: sortedGaps.map(gap => gap.accuracy_rate * 100),
          backgroundColor: sortedGaps.map(gap => {
            const rate = gap.accuracy_rate
            if (rate < 0.5) return 'hsla(var(--destructive), 0.8)'
            if (rate < 0.7) return 'hsla(var(--warning), 0.8)'
            return 'hsla(var(--success), 0.8)'
          }),
          borderColor: sortedGaps.map(gap => {
            const rate = gap.accuracy_rate
            if (rate < 0.5) return 'hsl(var(--destructive))'
            if (rate < 0.7) return 'hsl(var(--warning))'
            return 'hsl(var(--success))'
          }),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    }
  }, [gaps])

  const doughnutData = React.useMemo(() => {
    if (!gaps || gaps.length === 0) return null

    const criticalGaps = gaps.filter(gap => gap.improvement_needed >= 0.7).length
    const moderateGaps = gaps.filter(gap => gap.improvement_needed >= 0.4 && gap.improvement_needed < 0.7).length
    const minorGaps = gaps.filter(gap => gap.improvement_needed < 0.4).length

    return {
      labels: ['Critical Gaps', 'Moderate Gaps', 'Minor Gaps'],
      datasets: [
        {
          data: [criticalGaps, moderateGaps, minorGaps],
          backgroundColor: [
            'hsla(var(--destructive), 0.8)',
            'hsla(var(--warning), 0.8)',
            'hsla(var(--success), 0.8)'
          ],
          borderColor: [
            'hsl(var(--destructive))',
            'hsl(var(--warning))',
            'hsl(var(--success))'
          ],
          borderWidth: 2,
        }
      ]
    }
  }, [gaps])

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context: any) => {
            const index = context[0]?.dataIndex
            return gaps[index]?.topic || 'Unknown Topic'
          },
          afterBody: (context: any) => {
            const index = context[0]?.dataIndex
            const gap = gaps[index]
            if (!gap) return []
            return [
              `Questions: ${gap.question_count}`,
              `Improvement needed: ${Math.round(gap.improvement_needed * 100)}%`,
              `Difficulty: ${gap.difficulty_level}`
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
          },
          maxRotation: 45
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
    animation: {
      duration: 1200,
      easing: 'easeOutQuart' as const
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
      }
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
          <div className="h-6 bg-muted rounded w-40 animate-pulse" />
          <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        </div>
        <div className="h-[400px] bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!gaps || gaps.length === 0) {
    return (
      <div className="w-full bg-card rounded-lg border p-6">
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <div className="text-4xl mb-2">🎯</div>
          <h3 className="text-lg font-medium mb-1">No Knowledge Gaps Detected</h3>
          <p className="text-sm text-center">
            Great job! Complete more exams to get detailed gap analysis
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
          <h3 className="text-lg font-semibold text-foreground">Knowledge Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Areas that need your attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ViewToggle 
            selectedView={selectedView} 
            onViewChange={setSelectedView}
          />
        </div>
      </div>

      <div className="h-[400px] mb-6">
        {selectedView === 'bar' && processedData && (
          <Bar data={processedData} options={barOptions} />
        )}
        {selectedView === 'doughnut' && doughnutData && (
          <Doughnut data={doughnutData} options={doughnutOptions} />
        )}
        {selectedView === 'heatmap' && (
          <HeatmapView gaps={gaps} />
        )}
      </div>

      <GapSummary gaps={gaps} />
    </motion.div>
  )
}

function ViewToggle({ 
  selectedView, 
  onViewChange 
}: { 
  selectedView: string
  onViewChange: (view: 'bar' | 'doughnut' | 'heatmap') => void 
}) {
  const views = [
    { key: 'bar', label: 'Bar Chart', icon: '📊' },
    { key: 'doughnut', label: 'Overview', icon: '🍩' },
    { key: 'heatmap', label: 'Heatmap', icon: '🔥' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => onViewChange(view.key as any)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedView === view.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="mr-1">{view.icon}</span>
          {view.label}
        </button>
      ))}
    </div>
  )
}

function HeatmapView({ gaps }: { gaps: KnowledgeGap[] }) {
  const maxGaps = 12 // Show max 12 topics in heatmap
  const displayGaps = gaps.slice(0, maxGaps)

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 h-full">
      {displayGaps.map((gap, index) => {
        const intensity = gap.improvement_needed
        const bgColor = intensity >= 0.7 
          ? 'bg-destructive/20 border-destructive/40' 
          : intensity >= 0.4 
            ? 'bg-warning/20 border-warning/40'
            : 'bg-success/20 border-success/40'

        return (
          <motion.div
            key={gap.topic}
            className={`p-3 rounded-lg border-2 ${bgColor} flex flex-col items-center justify-center text-center`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs font-medium text-foreground mb-1 truncate w-full">
              {gap.topic}
            </div>
            <div className="text-lg font-bold text-foreground">
              {Math.round(gap.accuracy_rate * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {gap.question_count} questions
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function GapSummary({ gaps }: { gaps: KnowledgeGap[] }) {
  const criticalGaps = gaps.filter(gap => gap.improvement_needed >= 0.7)
  const moderateGaps = gaps.filter(gap => gap.improvement_needed >= 0.4 && gap.improvement_needed < 0.7)
  
  const topRecommendations = React.useMemo(() => {
    const allRecommendations = gaps.flatMap(gap => gap.recommended_actions)
    const recommendationCounts = allRecommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(recommendationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([rec]) => rec)
  }, [gaps])

  return (
    <motion.div 
      className="pt-4 border-t border-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive">
            {criticalGaps.length}
          </div>
          <div className="text-sm text-muted-foreground">Critical Gaps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {moderateGaps.length}
          </div>
          <div className="text-sm text-muted-foreground">Moderate Gaps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.round(gaps.reduce((sum, gap) => sum + gap.accuracy_rate, 0) / gaps.length * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Average Accuracy</div>
        </div>
      </div>

      {topRecommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Top Recommendations:</h4>
          <div className="space-y-1">
            {topRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation}
                className="text-sm text-muted-foreground flex items-center space-x-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
              >
                <span className="text-primary">•</span>
                <span>{recommendation}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import { useAnalytics, useActivityTracker } from '@/hooks/useAnalytics'

export default function AnalyticsPage() {
  const {
    analyticsData,
    performanceData,
    knowledgeGaps,
    masteryAreas,
    recommendations,
    loading,
    error,
    refetch,
    updateTimeRange
  } = useAnalytics(30)

  const { trackActivity } = useActivityTracker()

  React.useEffect(() => {
    // Track that user viewed analytics dashboard
    trackActivity('analytics_viewed', {
      page: 'analytics_dashboard',
      timestamp: new Date().toISOString()
    })
  }, [trackActivity])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ParticleBackground />
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Analytics Error</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
              {error}
            </p>
            <button
              onClick={refetch}
              className="magnetic glass glass-hover px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-glow transition-all duration-300"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <ParticleBackground />
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
              <p className="text-readable-muted text-lg">
                Track your learning progress and optimize your study strategy
              </p>
            </div>
            
            <TimeRangeSelector 
              onTimeRangeChange={updateTimeRange}
              loading={loading}
            />
          </div>
        </motion.div>

        {/* Main Dashboard */}
        <AnalyticsDashboard
          analyticsData={analyticsData}
          performanceData={performanceData}
          knowledgeGaps={knowledgeGaps}
          masteryAreas={masteryAreas}
          recommendations={recommendations}
          loading={loading}
        />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8"
        >
          <QuickActions onRefresh={refetch} />
        </motion.div>
      </div>
    </div>
  )
}

function TimeRangeSelector({ 
  onTimeRangeChange, 
  loading 
}: { 
  onTimeRangeChange: (days: number) => void
  loading: boolean 
}) {
  const [selectedRange, setSelectedRange] = React.useState(30)

  const timeRanges = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: '1 Year', value: 365 }
  ]

  const handleRangeChange = (days: number) => {
    setSelectedRange(days)
    onTimeRangeChange(days)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-readable-light">Time Range:</span>
      <div className="flex items-center space-x-1 glass rounded-lg p-1">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            disabled={loading}
            className={`magnetic px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
              selectedRange === range.value
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow'
                : 'text-readable-muted hover:text-readable'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuickActions({ onRefresh }: { onRefresh: () => void }) {
  const actions = [
    {
      title: 'Take Practice Exam',
      description: 'Test your knowledge with a timed exam',
      icon: '📝',
      href: '/exam',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Upload New PDF',
      description: 'Add study materials and generate questions',
      icon: '📄',
      href: '/upload',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'View Question Bank',
      description: 'Browse your generated questions',
      icon: '🏦',
      href: '/questions',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Refresh Data',
      description: 'Update your analytics with latest data',
      icon: '🔄',
      onClick: onRefresh,
      color: 'from-slate-500 to-slate-600'
    }
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-readable mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {action.href ? (
              <a
                href={action.href}
                className={`magnetic glass glass-hover block p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-transparent transition-all duration-300 bg-gradient-to-br ${action.color} hover:shadow-glow`}
              >
                <ActionContent action={action} />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={`magnetic glass glass-hover w-full p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-transparent transition-all duration-300 bg-gradient-to-br ${action.color} hover:shadow-glow`}
              >
                <ActionContent action={action} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ActionContent({ action }: { action: any }) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-2">{action.icon}</div>
      <h4 className="font-medium mb-1 text-white">{action.title}</h4>
      <p className="text-xs text-white/80">{action.description}</p>
    </div>
  )
}

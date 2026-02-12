'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import { UsageTracker } from '@/components/subscription/UsageTracker'
import { useSubscription } from '@/components/providers/SubscriptionProvider'
import { useAnalytics, useActivityTracker } from '@/hooks/useAnalytics'
import { FileText, Upload, Library, RefreshCw, ArrowRight, Loader2 } from 'lucide-react'

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

  const { subscription, loading: subLoading } = useSubscription()
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

  if (subLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isFreePlan = !subscription || subscription.plan_tier === 'free'

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C]">
      <ParticleBackground />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8">
        {isFreePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative">
              <RefreshCw className="w-12 h-12 text-white animate-spin-slow" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
                <FileText className="w-4 h-4 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black gradient-text mb-4">
              Premium Analytics
            </h2>
            <p className="text-readable-muted text-lg max-w-xl mb-10">
              Unlock deep insights into your learning progress, identify knowledge gaps, and receive AI-powered study recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-2xl">
              {[
                { title: 'Performance Trends', desc: 'Track your score improvements over time.' },
                { title: 'Knowledge Gaps', desc: 'Identify topics that need more review.' },
                { title: 'Mastery Analysis', desc: 'See which subjects you fixed.' },
                { title: 'AI Recommendations', desc: 'Personalized paths for better grades.' }
              ].map((feature, i) => (
                <div key={i} className="glass p-5 rounded-2xl border border-white/10 text-left flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-readable text-sm">{feature.title}</h4>
                    <p className="text-xs text-readable-muted">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/subscription"
              className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-glow flex items-center gap-3"
            >
              Upgrade to Unlock
              <ArrowRight className="w-5 h-5" />
            </a>

            <p className="mt-6 text-sm text-readable-light italic">
              Available on Standard and Premium plans.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-readable-muted text-sm sm:text-base md:text-lg">
                    Track your learning progress and optimize your study strategy
                  </p>
                </div>

                <TimeRangeSelector
                  onTimeRangeChange={updateTimeRange}
                  loading={loading}
                />
              </div>
            </motion.div>

            {/* Usage Tracker */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <UsageTracker
                  uploadsRemaining={subscription.uploads_allowed - subscription.uploads_used}
                  uploadsTotal={subscription.uploads_allowed}
                  examsRemaining={subscription.exams_allowed - subscription.exams_used}
                  examsTotal={subscription.exams_allowed}
                  expiryDate={subscription.sub_end_date || ''}
                  loading={subLoading}
                />
              </motion.div>
            )}

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
          </>
        )}
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
      <span className="hidden sm:inline text-sm text-readable-light">Time Range:</span>
      <div className="flex items-center space-x-1 glass rounded-lg p-1">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            disabled={loading}
            className={`magnetic px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all duration-300 whitespace-nowrap ${selectedRange === range.value
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
      icon: FileText,
      href: '/exam',
      color: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Upload New PDF',
      description: 'Add study materials and generate questions',
      icon: Upload,
      href: '/upload',
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'View Question Bank',
      description: 'Browse your generated questions',
      icon: Library,
      href: '/questions',
      color: 'from-orange-500 to-amber-600',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Refresh Data',
      description: 'Update your analytics with latest data',
      icon: RefreshCw,
      onClick: onRefresh,
      color: 'from-slate-500 to-slate-700',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-400'
    }
  ]

  return (
    <div className="glass rounded-3xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-readable mb-6">Quick Actions</h3>
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
                className="group glass glass-hover block p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-glow"
              >
                <ActionContent action={action} />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className="group glass glass-hover w-full p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-glow text-left"
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
  const Icon = action.icon
  return (
    <div className="flex flex-col h-full">
      <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${action.iconColor}`} />
      </div>
      <h4 className="font-semibold text-readable mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
      <p className="text-xs text-readable-muted mb-3 flex-grow">{action.description}</p>
      <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Go</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  Brain,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react'

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

interface Props {
  analyticsData: AnalyticsData | null
  performanceData: PerformanceData | null
  knowledgeGaps: KnowledgeGap[]
  masteryAreas: MasteryArea[]
  recommendations: Recommendation[]
  loading: boolean
}

export default function AnalyticsDashboard({
  analyticsData,
  performanceData,
  knowledgeGaps,
  masteryAreas,
  recommendations,
  loading
}: Props) {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-readable mb-2">
          No Analytics Data Available
        </h3>
        <p className="text-readable-muted mb-6">
          Start taking exams to see your analytics dashboard. Your progress will be tracked automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/upload"
            className="magnetic glass glass-hover px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-glow transition-all duration-300"
          >
            Upload Study Material
          </a>
          <a
            href="/browse"
            className="magnetic glass glass-hover px-6 py-3 rounded-xl font-semibold text-readable border border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-all duration-300"
          >
            Browse Exams
          </a>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Exams',
      value: analyticsData.totalExams.toString(),
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Study Hours',
      value: `${analyticsData.totalStudyTime}h`,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Average Score',
      value: `${analyticsData.averageScore}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+5%'
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData.completionRate}%`,
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      change: '+3%'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass glass-hover bento-card rounded-2xl p-6 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-glow`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-readable-light mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-readable group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-readable mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Trend
          </h3>
          <div className="space-y-3">
            {performanceData?.scores.slice(-5).map((score, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-readable-light">
                  Exam {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-8">
                    {score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Subject Performance
          </h3>
          <div className="space-y-3">
            {performanceData && Object.entries(performanceData.subjects).map(([subject, score]) => (
              <div key={subject} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {subject}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-8">
                    {score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Knowledge Gaps & Mastery Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Knowledge Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Knowledge Gaps
          </h3>
          <div className="space-y-4">
            {knowledgeGaps.slice(0, 3).map((gap, index) => (
              <div key={index} className="glass glass-hover p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {gap.topic}
                  </h4>
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    {gap.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {gap.subject} • {gap.attempts} attempts
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mastery Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Mastery Areas
          </h3>
          <div className="space-y-4">
            {masteryAreas.slice(0, 3).map((area, index) => (
              <div key={index} className="glass glass-hover p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {area.topic}
                  </h4>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {area.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {area.subject} • {area.consistency}% consistency
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className={`glass glass-hover p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                rec.priority === 'high' ? 'border-red-300 dark:border-red-700' :
                rec.priority === 'medium' ? 'border-yellow-300 dark:border-yellow-700' :
                'border-green-300 dark:border-green-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {rec.title}
                </h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          Weekly Progress
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {analyticsData.weeklyProgress} / {analyticsData.weeklyGoal}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Exams completed this week
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {Math.round((analyticsData.weeklyProgress / analyticsData.weeklyGoal) * 100)}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Goal completion
            </p>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((analyticsData.weeklyProgress / analyticsData.weeklyGoal) * 100, 100)}%` }}
          />
        </div>
      </motion.div>
    </div>
  )
}
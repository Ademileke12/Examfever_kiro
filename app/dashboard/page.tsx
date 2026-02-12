'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { FileText, Clock, TrendingUp, Award, Play, Upload, BarChart3, Loader2, GraduationCap, Timer, Target, Trophy } from 'lucide-react'
import { getUserId } from '@/lib/auth/user'

interface ExamResult {
  id: string
  exam_title: string
  score: number
  completed_at: string
  time_spent_seconds: number
  total_questions: number
}

interface DashboardStats {
  totalExams: number
  totalStudyHours: number
  averageScore: number
  achievements: number
  recentExams: number
  weeklyProgress: number
  weeklyGoal: number
}

function DashboardContent() {
  const [recentExams, setRecentExams] = useState<ExamResult[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const userId = getUserId()

      // Fetch recent exams and stats in parallel
      const [examsResponse, statsResponse] = await Promise.all([
        fetch(`/api/exam-results?userId=${userId}&limit=5`),
        fetch(`/api/dashboard/stats?userId=${userId}`)
      ])

      if (examsResponse.ok) {
        const examsData = await examsResponse.json()
        if (examsData.success) {
          setRecentExams(examsData.data)
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60)
    return `${minutes} min`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Default stats for when no data is available
  const defaultStats = {
    totalExams: 0,
    totalStudyHours: 0,
    averageScore: 0,
    achievements: 0,
    recentExams: 0,
    weeklyProgress: 0,
    weeklyGoal: 5
  }

  const displayStats = stats || defaultStats

  const statsCards = [
    {
      label: 'Exams Completed',
      value: displayStats.totalExams.toString(),
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Study Hours',
      value: displayStats.totalStudyHours.toString(),
      icon: Timer,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Average Score',
      value: `${displayStats.averageScore}%`,
      icon: Target,
      color: 'from-purple-500 to-fuchsia-600'
    },
    {
      label: 'Achievements',
      value: displayStats.achievements.toString(),
      icon: Trophy,
      color: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />

      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        paddingLeft: isMobile ? '1rem' : '1.5rem',
        paddingRight: isMobile ? '1rem' : '1.5rem',
        paddingTop: isMobile ? '5rem' : '6rem',
        paddingBottom: isMobile ? '2rem' : '2rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: isMobile ? '2rem' : '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '0'
        }}>
          <div>
            <h1 className="gradient-text" style={{
              fontSize: isMobile ? 'clamp(1.75rem, 5vw, 2.5rem)' : '2.25rem',
              fontWeight: '700',
              marginBottom: isMobile ? '0.5rem' : '0.5rem',
              lineHeight: '1.2'
            }}>
              My Learning Dashboard
            </h1>
            <p style={{
              color: 'hsl(var(--muted-foreground))',
              fontSize: isMobile ? '1rem' : '1.125rem',
              lineHeight: '1.6'
            }}>
              Track your progress and continue your exam preparation
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="glass glass-hover btn-outline"
            style={{
              padding: isMobile ? '0.75rem 1.5rem' : '0.75rem 1.5rem',
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              alignSelf: isMobile ? 'flex-start' : 'auto',
              minHeight: isMobile ? '44px' : 'auto'
            }}
          >
            {loading ? (
              <Loader2 style={{ width: '1.25rem', height: '1.25rem' }} className="animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '3rem 0' : '3rem 0',
            color: 'hsl(var(--muted-foreground))',
            fontSize: isMobile ? '1rem' : '1rem'
          }}>
            <Loader2 style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem' }} className="animate-spin" />
            Loading dashboard...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass border-destructive/20 bg-destructive/10 rounded-xl p-4 mb-8 text-destructive">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? '1rem' : '1.5rem',
              marginBottom: isMobile ? '1.5rem' : '2rem'
            }}>
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  className="glass glass-hover bento-card rounded-2xl p-6 group transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm md:text-base">
                        {stat.label}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/20`}>
                      <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Activity */}
              <div className="xl:col-span-2">
                <div className="glass rounded-xl lg:rounded-2xl overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <h2 className="text-lg lg:text-2xl font-bold text-readable">
                      Recent Exams
                    </h2>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    {recentExams.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <p className="text-xl font-semibold text-readable mb-2">No exams taken yet</p>
                        <p className="text-readable-muted">Start by uploading a PDF or taking a practice exam</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentExams.map((exam, index) => (
                          <div
                            key={exam.id}
                            className="glass glass-hover rounded-xl p-3 sm:p-4 group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {exam.exam_title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {exam.total_questions} questions • {formatDuration(exam.time_spent_seconds)}
                                  </p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:hidden">
                                    {formatDate(exam.completed_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className={`text-lg sm:text-xl md:text-2xl font-black mb-0.5 sm:mb-1 ${exam.score >= 80 ? 'text-green-600 dark:text-green-400' :
                                  exam.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                  }`}>
                                  {exam.score}%
                                </div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-blue-600 dark:text-blue-400 font-bold group-hover:underline whitespace-nowrap">
                                  View
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {recentExams.length > 0 && (
                      <div className="mt-6">
                        <Link href="/browse" className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline transition-colors">
                          View All Exams →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Progress */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold text-readable">
                      Quick Actions
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <Link
                      href="/upload"
                      className="magnetic glass glass-hover flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Upload New PDF</span>
                    </Link>

                    <Link
                      href="/browse"
                      className="magnetic glass glass-hover flex items-center gap-4 p-4 rounded-xl group transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Take Practice Exam</span>
                    </Link>

                    <Link
                      href="/analytics"
                      className="magnetic glass glass-hover flex items-center gap-4 p-4 rounded-xl group transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">View Analytics</span>
                    </Link>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold text-readable">
                      Weekly Progress
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-lg">
                        <span className="font-medium text-slate-500 dark:text-slate-400">This Week</span>
                        <span className="font-bold text-slate-800 dark:text-white">{displayStats.recentExams} exams</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${displayStats.weeklyProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                          style={{ width: `${Math.min(displayStats.weeklyProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Goal: {displayStats.weeklyGoal} exams per week
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

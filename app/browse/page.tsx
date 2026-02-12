'use client'

import { useState, useEffect } from 'react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { FileText, Clock, Brain, TrendingUp, Calendar, Award } from 'lucide-react'
import Link from 'next/link'
import { getUserId } from '@/lib/auth/user'

interface ExamResult {
  id: string
  exam_id: string
  exam_title: string
  score: number
  correct_answers: number
  total_questions: number
  time_spent_seconds: number
  time_limit_minutes: number
  study_time_minutes: number
  completed_at: string
  started_at: string
}

export default function BrowsePage() {
  const [examHistory, setExamHistory] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('Most Recent')
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
    fetchExamHistory()
  }, [])

  const fetchExamHistory = async () => {
    try {
      setLoading(true)
      const userId = getUserId()

      const response = await fetch(`/api/exam-results?userId=${userId}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setExamHistory(data.data)
      } else {
        setError('Failed to load exam history')
      }
    } catch (err) {
      console.error('Error fetching exam history:', err)
      setError('Failed to load exam history')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 80) return 'text-blue-600 dark:text-blue-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
    if (score >= 80) return { label: 'Good', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }
    if (score >= 70) return { label: 'Fair', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }
    if (score >= 60) return { label: 'Pass', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }
    return { label: 'Needs Work', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
  }

  const sortedExams = [...examHistory].sort((a, b) => {
    switch (sortBy) {
      case 'Best Score':
        return b.score - a.score
      case 'Most Recent':
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      case 'Longest Duration':
        return b.time_spent_seconds - a.time_spent_seconds
      case 'Most Questions':
        return b.total_questions - a.total_questions
      default:
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />

      {/* Header */}
      <div className="glass border-b border-border">
        <div style={{
          maxWidth: '90rem',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 1.5rem',
          paddingTop: isMobile ? '5rem' : '6rem',
          paddingBottom: isMobile ? '2rem' : '2rem'
        }}>
          <h1 className="gradient-text" style={{
            fontSize: isMobile ? 'clamp(1.75rem, 5vw, 2.5rem)' : '2.25rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}>
            My Exam History
          </h1>
          <p className="text-muted-foreground" style={{
            fontSize: isMobile ? '1rem' : '1.125rem',
            lineHeight: '1.6'
          }}>
            Review your past exam performance and results
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass border-b border-border">
        <div style={{
          maxWidth: '90rem',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 1.5rem',
          paddingTop: isMobile ? '2rem' : '2rem',
          paddingBottom: isMobile ? '2rem' : '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: isMobile ? '1rem' : '1.5rem',
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Link
              href="/questions"
              className="magnetic btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isMobile ? '1rem 2rem' : '1rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                minHeight: isMobile ? '44px' : 'auto',
                justifyContent: 'center',
                flex: isMobile ? '1' : 'none'
              }}
            >
              <Brain className="w-5 h-5" />
              Take New Exam
            </Link>
            <Link
              href="/upload"
              className="magnetic glass glass-hover btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isMobile ? '1rem 2rem' : '1rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                minHeight: isMobile ? '44px' : 'auto',
                justifyContent: 'center',
                flex: isMobile ? '1' : 'none'
              }}
            >
              <FileText className="w-5 h-5" />
              Upload More PDFs
            </Link>
            <Link
              href="/analytics"
              className="magnetic glass glass-hover btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isMobile ? '1rem 2rem' : '1rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                minHeight: isMobile ? '44px' : 'auto',
                justifyContent: 'center',
                flex: isMobile ? '1' : 'none'
              }}
            >
              <TrendingUp className="w-5 h-5" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {examHistory.length > 0 && (
        <div className="glass border-b border-border">
          <div style={{
            maxWidth: '90rem',
            margin: '0 auto',
            padding: isMobile ? '0 1.5rem' : '0 1.5rem',
            paddingTop: isMobile ? '2rem' : '2rem',
            paddingBottom: isMobile ? '2rem' : '2rem'
          }}>
            <div style={{
              display: 'flex',
              gap: isMobile ? '1rem' : '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <div style={{ flex: 1, maxWidth: isMobile ? '100%' : '32rem' }}>
                <input
                  type="text"
                  placeholder="Search your exam history..."
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: isMobile ? '1rem 1.25rem' : '1rem 1.25rem',
                    fontSize: isMobile ? '1rem' : '1.125rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: isMobile ? '100%' : 'auto'
              }}>
                <span className="text-muted-foreground" style={{
                  fontSize: '0.875rem',
                  display: 'none' // Hide on mobile for now
                }}>
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                  style={{
                    padding: isMobile ? '1rem 1.25rem' : '1rem 1.25rem',
                    fontSize: isMobile ? '1rem' : '1.125rem',
                    cursor: 'pointer',
                    minWidth: isMobile ? '150px' : '150px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none'
                  }}
                >
                  <option>Most Recent</option>
                  <option>Best Score</option>
                  <option>Longest Duration</option>
                  <option>Most Questions</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        padding: isMobile ? '0 1.5rem' : '0 1.5rem',
        paddingTop: isMobile ? '2rem' : '2rem',
        paddingBottom: isMobile ? '2rem' : '2rem'
      }}>
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Loading Exam History...</h3>
            <p className="text-muted-foreground text-lg">Please wait while we fetch your results</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <FileText className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Error Loading History</h3>
            <p className="text-muted-foreground mb-6 text-lg">{error}</p>
            <button
              onClick={fetchExamHistory}
              className="magnetic btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : examHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No Exams Taken Yet</h3>
            <p className="text-muted-foreground mb-6 text-lg">Start taking exams to build your history and track your progress</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/exam"
                className="magnetic btn-primary"
              >
                Take First Exam
              </Link>
              <Link
                href="/upload"
                className="magnetic glass glass-hover btn-outline"
              >
                Upload PDF
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isMobile ? '1.5rem' : '1.5rem'
            }}>
              <p className="text-muted-foreground" style={{
                fontSize: isMobile ? '1rem' : '1.125rem'
              }}>
                {examHistory.length} exam{examHistory.length !== 1 ? 's' : ''} completed
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem'
            }}>
              {sortedExams.map((exam, index) => {
                const scoreBadge = getScoreBadge(exam.score)

                return (
                  <div key={exam.id} className="glass glass-hover bento-card rounded-2xl overflow-hidden group" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Exam Header */}
                    <div className="border-b border-border" style={{
                      padding: isMobile ? '1.5rem' : '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '1rem' : '0'
                      }}>
                        <h3 className="text-foreground group-hover:text-primary transition-colors" style={{
                          fontSize: isMobile ? '1.125rem' : '1.25rem',
                          fontWeight: '700',
                          lineHeight: '1.4',
                          flex: 1
                        }}>
                          {exam.exam_title}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${scoreBadge.color}`} style={{
                          alignSelf: isMobile ? 'flex-start' : 'auto'
                        }}>
                          {scoreBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center text-muted-foreground mb-3" style={{
                        fontSize: isMobile ? '0.875rem' : '1rem'
                      }}>
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>{formatDate(exam.completed_at)}</span>
                      </div>

                      <div className="flex items-center justify-between text-muted-foreground" style={{
                        fontSize: isMobile ? '0.875rem' : '1rem'
                      }}>
                        <div className="flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          <span>{exam.total_questions} questions</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          <span>{formatDuration(exam.time_spent_seconds)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Exam Stats */}
                    <div style={{ padding: isMobile ? '1.5rem' : '1.5rem' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: isMobile ? '1.5rem' : '1.5rem',
                        marginBottom: isMobile ? '1.5rem' : '1.5rem'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div className={`group-hover:scale-110 transition-transform duration-300 ${getScoreColor(exam.score)}`} style={{
                            fontSize: isMobile ? '2rem' : '1.875rem',
                            fontWeight: '700'
                          }}>
                            {exam.score}%
                          </div>
                          <div className="text-muted-foreground" style={{
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Final Score
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div className="text-foreground group-hover:scale-110 transition-transform duration-300" style={{
                            fontSize: isMobile ? '2rem' : '1.875rem',
                            fontWeight: '700'
                          }}>
                            {exam.correct_answers}/{exam.total_questions}
                          </div>
                          <div className="text-muted-foreground" style={{
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Correct
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginBottom: isMobile ? '1.5rem' : '1.5rem'
                      }}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Study Time:</span>
                          <span className="text-foreground font-medium">
                            {formatDuration(exam.study_time_minutes * 60)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time Limit:</span>
                          <span className="text-foreground font-medium">
                            {exam.time_limit_minutes} minutes
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="text-foreground font-medium">
                            {Math.round((exam.correct_answers / exam.total_questions) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          className="flex-1 glass glass-hover btn-outline opacity-60 cursor-not-allowed"
                          style={{
                            padding: isMobile ? '0.75rem 1rem' : '0.75rem 1rem',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            minHeight: isMobile ? '44px' : 'auto'
                          }}
                          disabled
                        >
                          View Results
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-12 glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-warning" />
                Your Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {examHistory.length}
                  </div>
                  <div className="text-muted-foreground">Total Exams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(examHistory.reduce((sum, exam) => sum + exam.score, 0) / examHistory.length)}%
                  </div>
                  <div className="text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    {Math.max(...examHistory.map(exam => exam.score))}%
                  </div>
                  <div className="text-muted-foreground">Best Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatDuration(examHistory.reduce((sum, exam) => sum + exam.time_spent_seconds, 0))}
                  </div>
                  <div className="text-muted-foreground">Total Study Time</div>
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="text-center mt-12 glass rounded-2xl p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Keep Learning!</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">Continue your learning journey with more practice exams</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/exam"
                  className="magnetic btn-primary"
                >
                  Take Another Exam
                </Link>
                <Link
                  href="/upload"
                  className="magnetic glass glass-hover btn-outline"
                >
                  Upload More PDFs
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Play, BookOpen } from 'lucide-react'

// Default exam settings
const DEFAULT_EXAM_SETTINGS = {
  TIME_LIMIT_MINUTES: 60, // Default 60 minutes for all exams
  MIN_TIME_LIMIT: 5,      // Minimum 5 minutes
  MAX_TIME_LIMIT: 300     // Maximum 5 hours
}

interface Question {
  id: string
  type: string
  text: string
  difficulty: string
  topic?: string
  options?: Array<{
    text: string
    isCorrect: boolean
  }>
}

interface ExamConfig {
  title: string
  description: string
  timeLimit: number
  totalQuestions: number
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  questionTypes: string[]
  selectedQuestions: string[]
}

interface ExamCreatorProps {
  onExamCreated?: (examId: string) => void
  selectedBundles?: string[]
  bundleDistribution?: Record<string, number>
}

export default function ExamCreator({ onExamCreated, selectedBundles, bundleDistribution }: ExamCreatorProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [config, setConfig] = useState<ExamConfig>({
    title: '',
    description: '',
    timeLimit: DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES, // Use default timer
    totalQuestions: 15, // Increased default from 10 to 15
    difficultyDistribution: {
      easy: 5,   // Increased from 3 to 5
      medium: 7, // Increased from 5 to 7
      hard: 3    // Increased from 2 to 3
    },
    questionTypes: ['multiple-choice'],
    selectedQuestions: []
  })

  // Calculate total questions from bundle distribution if bundles are selected
  const totalBundleQuestions = bundleDistribution 
    ? Object.values(bundleDistribution).reduce((sum, count) => sum + count, 0)
    : 0

  // Update config when bundle distribution changes
  useEffect(() => {
    if (selectedBundles && selectedBundles.length > 0 && bundleDistribution) {
      setConfig(prev => ({
        ...prev,
        selectedQuestions: ['bundle-based'], // Placeholder to indicate questions are selected
        totalQuestions: totalBundleQuestions
      }))
    }
  }, [selectedBundles, bundleDistribution, totalBundleQuestions])

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch(`/api/questions?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.data.questions)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoSelect = () => {
    const { easy, medium, hard } = config.difficultyDistribution
    const selectedQuestions: string[] = []
    const selectedIds = new Set<string>()
    
    // Filter questions by difficulty and type
    const easyQuestions = questions.filter(q => 
      q.difficulty === 'easy' && config.questionTypes.includes(q.type)
    )
    const mediumQuestions = questions.filter(q => 
      q.difficulty === 'medium' && config.questionTypes.includes(q.type)
    )
    const hardQuestions = questions.filter(q => 
      q.difficulty === 'hard' && config.questionTypes.includes(q.type)
    )

    // Shuffle questions to ensure random selection
    const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5)
    const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5)
    const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5)

    // Select questions based on distribution, avoiding duplicates
    shuffledEasy.slice(0, easy).forEach(q => {
      if (!selectedIds.has(q.id)) {
        selectedQuestions.push(q.id)
        selectedIds.add(q.id)
      }
    })
    
    shuffledMedium.slice(0, medium).forEach(q => {
      if (!selectedIds.has(q.id)) {
        selectedQuestions.push(q.id)
        selectedIds.add(q.id)
      }
    })
    
    shuffledHard.slice(0, hard).forEach(q => {
      if (!selectedIds.has(q.id)) {
        selectedQuestions.push(q.id)
        selectedIds.add(q.id)
      }
    })

    console.log(`Auto-selected ${selectedQuestions.length} unique questions:`, {
      easy: shuffledEasy.slice(0, easy).length,
      medium: shuffledMedium.slice(0, medium).length,
      hard: shuffledHard.slice(0, hard).length,
      total: selectedQuestions.length
    })

    setConfig(prev => ({ ...prev, selectedQuestions }))
  }

  const handleCreateExam = async () => {
    if (!config.title.trim()) {
      alert('Please enter an exam title')
      return
    }

    if (config.selectedQuestions.length === 0) {
      alert('Please select questions for the exam')
      return
    }

    setCreating(true)
    try {
      const userId = localStorage.getItem('userId') || 'demo-user'
      
      // Use bundle-based exam creation if bundles are selected
      if (selectedBundles && selectedBundles.length > 0) {
        const response = await fetch('/api/exams/from-bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: config.title,
            description: config.description,
            bundleIds: selectedBundles,
            bundleDistribution: bundleDistribution || {},
            timeLimitMinutes: config.timeLimit,
            questionTypes: config.questionTypes,
            difficultyDistribution: config.difficultyDistribution
          })
        })

        const data = await response.json()
        
        if (data.success) {
          onExamCreated?.(data.exam.id)
        } else {
          alert('Failed to create bundle exam: ' + data.error)
        }
      } else {
        // Use regular exam creation
        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...config,
            userId
          })
        })

        const data = await response.json()
        
        if (data.success) {
          onExamCreated?.(data.data.examId)
        } else {
          alert('Failed to create exam: ' + data.error)
        }
      }
    } catch (error) {
      alert('Failed to create exam')
      console.error('Exam creation error:', error)
    } finally {
      setCreating(false)
    }
  }

  const filteredQuestions = questions.filter(q => 
    config.questionTypes.includes(q.type)
  )

  const questionStats = {
    easy: filteredQuestions.filter(q => q.difficulty === 'easy').length,
    medium: filteredQuestions.filter(q => q.difficulty === 'medium').length,
    hard: filteredQuestions.filter(q => q.difficulty === 'hard').length
  }

  return (
    <div className="glass rounded-xl p-8">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Plus style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
        <h2 className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          Create New Exam
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1.5rem' }} />
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.125rem', lineHeight: '1.6' }}>
            No questions available. Upload some PDFs first to generate questions.
          </p>
          <a
            href="/upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#1d4ed8'
              ;(e.target as HTMLAnchorElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#2563eb'
              ;(e.target as HTMLAnchorElement).style.transform = 'translateY(0)'
            }}
          >
            Upload PDFs
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="text-foreground" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Exam Title *
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter exam title"
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1rem',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--primary))'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--border))'}
              />
            </div>
            <div>
              <label className="text-foreground" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={config.timeLimit}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES
                  const clampedValue = Math.min(Math.max(value, DEFAULT_EXAM_SETTINGS.MIN_TIME_LIMIT), DEFAULT_EXAM_SETTINGS.MAX_TIME_LIMIT)
                  setConfig(prev => ({ ...prev, timeLimit: clampedValue }))
                }}
                min={DEFAULT_EXAM_SETTINGS.MIN_TIME_LIMIT}
                max={DEFAULT_EXAM_SETTINGS.MAX_TIME_LIMIT}
                placeholder={`Default: ${DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES} minutes`}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1rem',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--primary))'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--border))'}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: '500' }}>
                Default: {DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES} minutes (Range: {DEFAULT_EXAM_SETTINGS.MIN_TIME_LIMIT}-{DEFAULT_EXAM_SETTINGS.MAX_TIME_LIMIT} minutes)
              </p>
            </div>
          </div>

          <div>
            <label className="text-foreground" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter exam description (optional)"
              rows={3}
              className="form-input"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '120px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--background))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'hsl(var(--primary))'}
              onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'hsl(var(--border))'}
            />
          </div>

          {/* Question Distribution */}
          <div>
            <h3 className="text-foreground" style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Question Distribution
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                  Easy ({questionStats.easy} available)
                </label>
                <input
                  type="number"
                  value={config.difficultyDistribution.easy}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    difficultyDistribution: {
                      ...prev.difficultyDistribution,
                      easy: Math.min(parseInt(e.target.value) || 0, questionStats.easy)
                    }
                  }))}
                  min="0"
                  max={questionStats.easy}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    fontSize: '1rem',
                    color: 'hsl(var(--foreground))',
                    backgroundColor: 'hsl(var(--background))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--border))'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                  Medium ({questionStats.medium} available)
                </label>
                <input
                  type="number"
                  value={config.difficultyDistribution.medium}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    difficultyDistribution: {
                      ...prev.difficultyDistribution,
                      medium: Math.min(parseInt(e.target.value) || 0, questionStats.medium)
                    }
                  }))}
                  min="0"
                  max={questionStats.medium}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    fontSize: '1rem',
                    color: 'hsl(var(--foreground))',
                    backgroundColor: 'hsl(var(--background))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#f59e0b'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--border))'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                  Hard ({questionStats.hard} available)
                </label>
                <input
                  type="number"
                  value={config.difficultyDistribution.hard}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    difficultyDistribution: {
                      ...prev.difficultyDistribution,
                      hard: Math.min(parseInt(e.target.value) || 0, questionStats.hard)
                    }
                  }))}
                  min="0"
                  max={questionStats.hard}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    fontSize: '1rem',
                    color: 'hsl(var(--foreground))',
                    backgroundColor: 'hsl(var(--background))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#dc2626'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'hsl(var(--border))'}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleAutoSelect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                backgroundColor: 'transparent',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                ;(e.target as HTMLButtonElement).style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.target as HTMLButtonElement).style.borderColor = '#d1d5db'
              }}
            >
              <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
              Auto-Select Questions
            </button>

            <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '600' }}>
              {selectedBundles && selectedBundles.length > 0 
                ? `${totalBundleQuestions} questions from ${selectedBundles.length} bundle${selectedBundles.length !== 1 ? 's' : ''}`
                : `${config.selectedQuestions.length} questions selected`
              }
            </div>

            <button
              onClick={handleCreateExam}
              disabled={creating || (config.selectedQuestions.length === 0 && totalBundleQuestions === 0)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                backgroundColor: creating || (config.selectedQuestions.length === 0 && totalBundleQuestions === 0) ? '#9ca3af' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: creating || (config.selectedQuestions.length === 0 && totalBundleQuestions === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: creating || (config.selectedQuestions.length === 0 && totalBundleQuestions === 0) ? 'none' : '0 4px 6px rgba(22, 163, 74, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!creating && (config.selectedQuestions.length > 0 || totalBundleQuestions > 0)) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!creating && (config.selectedQuestions.length > 0 || totalBundleQuestions > 0)) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                }
              }}
            >
              <Play style={{ width: '1.25rem', height: '1.25rem' }} />
              {creating ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
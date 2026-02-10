'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flag, CheckSquare, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { pageVariants } from '@/lib/animations/variants'
import { useSearchParams } from 'next/navigation'
import BundleProgress from '@/components/bundles/BundleProgress'

// Default exam settings
const DEFAULT_EXAM_SETTINGS = {
  TIME_LIMIT_MINUTES: 60, // Default 60 minutes for all exams
  MIN_TIME_LIMIT: 5,      // Minimum 5 minutes
  MAX_TIME_LIMIT: 300     // Maximum 5 hours
}

interface ExamData {
  id: string
  title: string
  description?: string
  time_limit_minutes: number
  bundle_context?: {
    bundleIds: string[]
    bundleNames: string[]
    bundleDistribution: Record<string, number>
    totalQuestions: number
  }
  questions: Array<{
    id: string
    text: string
    type: 'multiple-choice' // Only support multiple-choice questions
    answers?: Array<{
      id: string
      text: string
      isCorrect: boolean
    }>
    difficulty?: string
    topic?: string
    explanation?: string
  }>
}

// Mock exam data as fallback - ALL MULTIPLE CHOICE QUESTIONS
const mockExam: ExamData = {
  id: 'mock-1',
  title: 'Sample Exam',
  time_limit_minutes: DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES, // Use default timer
  questions: [
    {
      id: '1',
      text: 'What is the primary purpose of React hooks?',
      type: 'multiple-choice' as const,
      difficulty: 'easy',
      answers: [
        { id: 'a', text: 'To manage component state and lifecycle', isCorrect: true },
        { id: 'b', text: 'To style components', isCorrect: false },
        { id: 'c', text: 'To handle routing', isCorrect: false },
        { id: 'd', text: 'To optimize performance only', isCorrect: false },
      ],
    },
    {
      id: '2',
      text: 'What is the main benefit of React\'s virtual DOM?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'Improved performance through efficient updates', isCorrect: true },
        { id: 'b', text: 'Better styling capabilities', isCorrect: false },
        { id: 'c', text: 'Easier debugging', isCorrect: false },
        { id: 'd', text: 'Smaller bundle size', isCorrect: false },
      ],
    },
    {
      id: '3',
      text: 'Which of the following is NOT a valid React hook?',
      type: 'multiple-choice' as const,
      difficulty: 'easy',
      answers: [
        { id: 'a', text: 'useState', isCorrect: false },
        { id: 'b', text: 'useEffect', isCorrect: false },
        { id: 'c', text: 'useComponent', isCorrect: true },
        { id: 'd', text: 'useCallback', isCorrect: false },
      ],
    },
    {
      id: '4',
      text: 'What is the key difference between props and state in React?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'Props are immutable, state is mutable', isCorrect: true },
        { id: 'b', text: 'Props are internal, state is external', isCorrect: false },
        { id: 'c', text: 'Props are faster, state is slower', isCorrect: false },
        { id: 'd', text: 'There is no difference', isCorrect: false },
      ],
    },
    {
      id: '5',
      text: 'Which method is used to update state in a functional component?',
      type: 'multiple-choice' as const,
      difficulty: 'easy',
      answers: [
        { id: 'a', text: 'setState()', isCorrect: false },
        { id: 'b', text: 'useState()', isCorrect: true },
        { id: 'c', text: 'updateState()', isCorrect: false },
        { id: 'd', text: 'changeState()', isCorrect: false },
      ],
    },
    {
      id: '6',
      text: 'What is the purpose of React keys in lists?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'To help React identify which items have changed', isCorrect: true },
        { id: 'b', text: 'To style list items', isCorrect: false },
        { id: 'c', text: 'To sort the list', isCorrect: false },
        { id: 'd', text: 'To add animations', isCorrect: false },
      ],
    },
    {
      id: '7',
      text: 'What is JSX in React?',
      type: 'multiple-choice' as const,
      difficulty: 'easy',
      answers: [
        { id: 'a', text: 'A JavaScript extension syntax', isCorrect: true },
        { id: 'b', text: 'A CSS framework', isCorrect: false },
        { id: 'c', text: 'A database query language', isCorrect: false },
        { id: 'd', text: 'A testing library', isCorrect: false },
      ],
    },
    {
      id: '8',
      text: 'How do you handle events in React?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'Using addEventListener', isCorrect: false },
        { id: 'b', text: 'Using event handlers as props', isCorrect: true },
        { id: 'c', text: 'Using jQuery', isCorrect: false },
        { id: 'd', text: 'Using vanilla JavaScript only', isCorrect: false },
      ],
    },
    {
      id: '9',
      text: 'What is the purpose of keys in React lists?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'To style list items', isCorrect: false },
        { id: 'b', text: 'To help React identify which items have changed', isCorrect: true },
        { id: 'c', text: 'To sort the list', isCorrect: false },
        { id: 'd', text: 'To add animations', isCorrect: false },
      ],
    },
    {
      id: '10',
      text: 'What is the difference between controlled and uncontrolled components?',
      type: 'multiple-choice' as const,
      difficulty: 'hard',
      answers: [
        { id: 'a', text: 'Controlled components have their state managed by React', isCorrect: true },
        { id: 'b', text: 'Uncontrolled components are faster', isCorrect: false },
        { id: 'c', text: 'Controlled components use refs', isCorrect: false },
        { id: 'd', text: 'There is no difference', isCorrect: false },
      ],
    },
    {
      id: '11',
      text: 'What is React Context used for?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'To share data between components without prop drilling', isCorrect: true },
        { id: 'b', text: 'To style components', isCorrect: false },
        { id: 'c', text: 'To handle routing', isCorrect: false },
        { id: 'd', text: 'To manage animations', isCorrect: false },
      ],
    },
    {
      id: '12',
      text: 'How do you optimize React application performance?',
      type: 'multiple-choice' as const,
      difficulty: 'hard',
      answers: [
        { id: 'a', text: 'Use React.memo, useMemo, and useCallback', isCorrect: true },
        { id: 'b', text: 'Use only class components', isCorrect: false },
        { id: 'c', text: 'Avoid using hooks', isCorrect: false },
        { id: 'd', text: 'Use inline styles only', isCorrect: false },
      ],
    },
    {
      id: '13',
      text: 'What is the purpose of useEffect hook?',
      type: 'multiple-choice' as const,
      difficulty: 'easy',
      answers: [
        { id: 'a', text: 'To manage component state', isCorrect: false },
        { id: 'b', text: 'To perform side effects', isCorrect: true },
        { id: 'c', text: 'To create components', isCorrect: false },
        { id: 'd', text: 'To handle routing', isCorrect: false },
      ],
    },
    {
      id: '14',
      text: 'What are React fragments and why are they useful?',
      type: 'multiple-choice' as const,
      difficulty: 'medium',
      answers: [
        { id: 'a', text: 'To group elements without adding extra DOM nodes', isCorrect: true },
        { id: 'b', text: 'To add styling to components', isCorrect: false },
        { id: 'c', text: 'To handle state management', isCorrect: false },
        { id: 'd', text: 'To create animations', isCorrect: false },
      ],
    },
    {
      id: '15',
      text: 'What is React reconciliation?',
      type: 'multiple-choice' as const,
      difficulty: 'hard',
      answers: [
        { id: 'a', text: 'The process of comparing virtual DOM trees to update the real DOM', isCorrect: true },
        { id: 'b', text: 'The process of merging components', isCorrect: false },
        { id: 'c', text: 'The process of handling errors', isCorrect: false },
        { id: 'd', text: 'The process of optimizing bundle size', isCorrect: false },
      ],
    },
  ],
}

function ExamContent() {
  const searchParams = useSearchParams()
  const examId = searchParams.get('id')
  
  const [exam, setExam] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [examStartTime, setExamStartTime] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(0)

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) {
        // Use mock exam if no ID provided
        setExam(mockExam)
        setTimeLeft(mockExam.time_limit_minutes * 60)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/exams/${examId}`)
        const data = await response.json()

        if (!data.success) {
          if (data.setupRequired) {
            setError('Database setup required. Please complete the database setup first.')
          } else {
            setError(data.error || 'Failed to load exam')
          }
          return
        }

        setExam(data.data)
        // Ensure exam has a valid time limit, use default if not set
        const timeLimit = data.data.time_limit_minutes || DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES
        setTimeLeft(timeLimit * 60)
      } catch (err) {
        console.error('Error fetching exam:', err)
        setError('Failed to load exam. Using sample exam instead.')
        setExam(mockExam)
        setTimeLeft(DEFAULT_EXAM_SETTINGS.TIME_LIMIT_MINUTES * 60)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId])

  const currentQuestion = exam?.questions[currentQuestionIndex]
  const answeredCount = Object.keys(userAnswers).length
  const flaggedCount = flaggedQuestions.size

  const handleExamComplete = useCallback(async () => {
    if (!exam) return
    
    const endTime = new Date().toISOString()
    const totalTimeSpent = Math.round((Date.now() - examStartTime) / 1000) // in seconds
    
    // Calculate score
    const correctAnswers = exam.questions.filter(question => {
      const userAnswer = userAnswers[question.id]
      if (question.type === 'multiple-choice' && userAnswer) {
        const selectedAnswer = question.answers?.find(a => a.id === userAnswer)
        return selectedAnswer?.isCorrect
      }
      return false
    }).length

    const score = Math.round((correctAnswers / exam.questions.length) * 100)
    
    // Save exam result to database
    try {
      const userId = localStorage.getItem('userId') || 'demo-user'
      const resultData = {
        userId: userId,
        examId: exam.id,
        examTitle: exam.title,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: exam.questions.length,
        timeSpent: totalTimeSpent,
        timeLimitMinutes: exam.time_limit_minutes,
        userAnswers: userAnswers,
        startTime: new Date(examStartTime).toISOString(),
        endTime: endTime
      }

      const response = await fetch('/api/exam-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      })

      if (!response.ok) {
        console.error('Failed to save exam result')
      }
    } catch (error) {
      console.error('Error saving exam result:', error)
    }
    
    setExamCompleted(true)
  }, [exam, examStartTime, userAnswers])

  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleExamComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, examStarted, examCompleted, handleExamComplete])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (!exam) return '#16a34a'
    const percentage = (timeLeft / (exam.time_limit_minutes * 60)) * 100
    if (percentage <= 10) return '#dc2626' // red
    if (percentage <= 25) return '#f59e0b' // yellow
    return '#16a34a' // green
  }

  const handleAnswerSelect = useCallback((questionId: string, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }, [])

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }, [])

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleStartExam = () => {
    setExamStartTime(Date.now())
    setExamStarted(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading exam...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !exam) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="glass rounded-2xl p-8 text-center max-w-md w-full">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Unable to Load Exam
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/setup'}
                className="magnetic flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-glow transition-all duration-300"
              >
                Setup Database
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="magnetic flex-1 glass glass-hover border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!exam) return null

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="glass rounded-2xl p-8 text-center max-w-md w-full"
          >
            <h1 className="text-2xl font-bold gradient-text mb-4">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {exam.description}
              </p>
            )}
            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-8">
              <p>Time Limit: {exam.time_limit_minutes} minutes</p>
              <p>Questions: {exam.questions.length}</p>
              <p>Once you start, the timer cannot be paused.</p>
            </div>
            {error && (
              <div className="glass border-yellow-200 dark:border-yellow-800 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl p-3 mb-4 text-sm text-yellow-800 dark:text-yellow-200">
                {error}
              </div>
            )}
            <button
              onClick={handleStartExam}
              className="magnetic w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-glow transition-all duration-300"
            >
              Start Exam
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Post-exam screen
  if (examCompleted) {
    const correctAnswers = exam.questions.filter(question => {
      const userAnswer = userAnswers[question.id]
      if (question.type === 'multiple-choice' && userAnswer) {
        const selectedAnswer = question.answers?.find(a => a.id === userAnswer)
        return selectedAnswer?.isCorrect
      }
      return false
    }).length

    const score = Math.round((correctAnswers / exam.questions.length) * 100)

    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="glass rounded-2xl p-8 text-center max-w-md w-full"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse-glow">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-4">
              Exam Completed!
            </h1>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 mb-8">
              <p className="text-lg">Score: <span className="font-bold text-slate-900 dark:text-white">{score}%</span> ({correctAnswers}/{exam.questions.length})</p>
              <p>Questions Answered: {answeredCount} of {exam.questions.length}</p>
              <p>Questions Flagged: {flaggedCount}</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="magnetic w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-glow transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main exam interface
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Navbar />
      
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-6 pt-24 pb-8"
      >
        {/* Timer and Header */}
        <div className="glass rounded-2xl p-4 mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            {exam.title}
          </h1>
          
          <div className="flex items-center gap-2" style={{ color: getTimerColor() }}>
            {timeLeft <= 600 ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span className="text-lg font-mono font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Question Area */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            {/* Question Card */}
            {currentQuestion && (
              <div className="glass rounded-xl p-6 mb-4" style={{
                padding: window.innerWidth < 768 ? '1.5rem' : '2.5rem',
                marginBottom: '1rem'
              }}>
                {/* Question Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between', 
                  marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem',
                  flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                  gap: window.innerWidth < 640 ? '1rem' : '0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        borderRadius: '9999px',
                        fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                        fontWeight: '600'
                      }}>
                        Question {currentQuestionIndex + 1} of {exam.questions.length}
                      </span>
                      {userAnswers[currentQuestion.id] && (
                        <CheckSquare style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
                      )}
                    </div>
                    <h3 className="text-foreground" style={{ 
                      fontSize: window.innerWidth < 768 ? '1.125rem' : '1.25rem', 
                      fontWeight: '600', 
                      lineHeight: '1.7',
                      marginBottom: '0.5rem'
                    }}>
                      {currentQuestion.text}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: flaggedQuestions.has(currentQuestion.id) ? '#fef3c7' : '#f9fafb',
                      color: flaggedQuestions.has(currentQuestion.id) ? '#d97706' : '#6b7280',
                      alignSelf: window.innerWidth < 640 ? 'flex-start' : 'auto'
                    }}
                  >
                    <Flag style={{ width: '1.25rem', height: '1.25rem' }} fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Question Content */}
                {currentQuestion.type === 'multiple-choice' && currentQuestion.answers && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth < 768 ? '0.75rem' : '1rem' }}>
                    {currentQuestion.answers.map((answer, index) => {
                      const isSelected = userAnswers[currentQuestion.id] === answer.id
                      
                      return (
                        <button
                          key={answer.id}
                          onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                          style={{
                            width: '100%',
                            padding: '1.25rem',
                            textAlign: 'left',
                            borderRadius: '0.75rem',
                            border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                            backgroundColor: isSelected ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '0.5rem'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              (e.target as HTMLButtonElement).style.borderColor = '#d1d5db'
                              ;(e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              (e.target as HTMLButtonElement).style.borderColor = '#e5e7eb'
                              ;(e.target as HTMLButtonElement).style.backgroundColor = 'white'
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '50%',
                              border: `2px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: isSelected ? '#2563eb' : '#6b7280',
                              backgroundColor: isSelected ? '#dbeafe' : 'transparent',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span style={{ 
                              color: '#111827',
                              fontSize: '1rem',
                              lineHeight: '1.6'
                            }}>
                              {answer.text}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Only multiple-choice questions are supported */}
              </div>
            )}

            {/* Navigation */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginTop: window.innerWidth < 768 ? '1.5rem' : '2rem',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: window.innerWidth < 640 ? '1rem' : '0'
            }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: window.innerWidth < 768 ? '0.75rem 1.25rem' : '1rem 1.75rem',
                  backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                  color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  fontWeight: '500',
                  width: window.innerWidth < 640 ? '100%' : 'auto',
                  justifyContent: window.innerWidth < 640 ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (currentQuestionIndex !== 0) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    ;(e.target as HTMLButtonElement).style.borderColor = '#9ca3af'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentQuestionIndex !== 0) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'white'
                    ;(e.target as HTMLButtonElement).style.borderColor = '#d1d5db'
                  }
                }}
              >
                <ChevronLeft style={{ width: '1.125rem', height: '1.125rem' }} />
                <span className={window.innerWidth < 480 ? 'hidden' : 'inline'}>Previous</span>
              </button>

              <button
                onClick={handleExamComplete}
                style={{
                  padding: window.innerWidth < 768 ? '0.75rem 1.5rem' : '1rem 2rem',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                  width: window.innerWidth < 640 ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'
                  ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                }}
              >
                Submit Exam
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: window.innerWidth < 768 ? '0.75rem 1.25rem' : '1rem 1.75rem',
                  backgroundColor: currentQuestionIndex === exam.questions.length - 1 ? '#f3f4f6' : '#2563eb',
                  color: currentQuestionIndex === exam.questions.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: currentQuestionIndex === exam.questions.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  fontWeight: '500',
                  width: window.innerWidth < 640 ? '100%' : 'auto',
                  justifyContent: window.innerWidth < 640 ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (currentQuestionIndex !== exam.questions.length - 1) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentQuestionIndex !== exam.questions.length - 1) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                  }
                }}
              >
                <span className={window.innerWidth < 480 ? 'hidden' : 'inline'}>Next</span>
                <ChevronRight style={{ width: '1.125rem', height: '1.125rem' }} />
              </button>
            </div>
          </div>

          {/* Sidebar - Progress */}
          <div className="order-1 xl:order-2 space-y-4">
            {/* Bundle Progress Component */}
            {exam.bundle_context && (
              <BundleProgress
                bundleContext={exam.bundle_context}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={exam.questions.length}
                answeredQuestions={Object.keys(userAnswers).map(id => parseInt(id))}
                timeRemaining={timeLeft}
              />
            )}
            
            {/* Regular Progress Panel */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              padding: window.innerWidth < 768 ? '1.5rem' : '2rem',
              height: 'fit-content'
            }}>
            <h3 style={{ 
              fontSize: window.innerWidth < 768 ? '1rem' : '1.125rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: window.innerWidth < 768 ? '1rem' : '1.5rem' 
            }}>
              Exam Progress
            </h3>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Progress</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                  {currentQuestionIndex + 1} of {exam.questions.length}
                </span>
              </div>
              <div style={{ width: '100%', height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                <div style={{
                  width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#2563eb',
                  transition: 'width 0.3s ease',
                  borderRadius: '0.375rem'
                }} />
              </div>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 640 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', 
              gap: window.innerWidth < 768 ? '1rem' : '1.5rem', 
              textAlign: 'center', 
              marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' 
            }}>
              <div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem', 
                  fontWeight: '700', 
                  color: '#16a34a', 
                  marginBottom: '0.25rem' 
                }}>
                  {answeredCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                  Answered
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem', 
                  fontWeight: '700', 
                  color: '#f59e0b', 
                  marginBottom: '0.25rem' 
                }}>
                  {flaggedCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                  Flagged
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem', 
                  fontWeight: '700', 
                  color: '#6b7280', 
                  marginBottom: '0.25rem' 
                }}>
                  {exam.questions.length - answeredCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                  Remaining
                </div>
              </div>
            </div>

            {/* Question Navigation Dots */}
            <div className={window.innerWidth < 768 ? 'hidden' : 'block'}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', fontWeight: '500' }}>
                Quick Navigation
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                {exam.questions.map((question, index) => {
                  const questionNum = index + 1
                  const isAnswered = question ? userAnswers[question.id] : false
                  const isCurrent = index === currentQuestionIndex
                  const isFlagged = question ? flaggedQuestions.has(question.id) : false
                  
                  return (
                    <button
                      key={questionNum}
                      onClick={() => setCurrentQuestionIndex(index)}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        backgroundColor: isCurrent ? '#2563eb' : isAnswered ? '#16a34a' : isFlagged ? '#f59e0b' : '#e5e7eb',
                        color: isCurrent || isAnswered || isFlagged ? 'white' : '#6b7280',
                        boxShadow: isCurrent ? '0 2px 4px rgba(37, 99, 235, 0.3)' : 'none'
                      }}
                      title={`Question ${questionNum}${isCurrent ? ' (current)' : ''}${isAnswered ? ' (answered)' : ''}${isFlagged ? ' (flagged)' : ''}`}
                      onMouseEnter={(e) => {
                        if (!isCurrent) {
                          (e.target as HTMLButtonElement).style.transform = 'scale(1.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) {
                          (e.target as HTMLButtonElement).style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {questionNum}
                    </button>
                  )
                })}
              </div>
            </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading exam...</span>
          </div>
        </div>
      </div>
    }>
      <ExamPageContent />
    </Suspense>
  )
}

function ExamPageContent() {
  return <ExamContent />
}
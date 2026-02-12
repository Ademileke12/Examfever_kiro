'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flag, CheckSquare, Clock, AlertTriangle, Loader2 } from 'lucide-react'
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
              <div className="glass rounded-xl p-5 md:p-10 mb-4 shadow-sm border dark:border-white/5 relative overflow-hidden">
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 md:mb-10 gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {exam.questions.length}
                      </span>
                      {userAnswers[currentQuestion.id] && (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                          <CheckSquare className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="text-[10px] font-bold">ANSWERED</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
                      {currentQuestion.text}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={`p-3 rounded-xl transition-all duration-300 shadow-sm border ${flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 hover:text-amber-500'
                      }`}
                  >
                    <Flag className="w-5 h-5 md:w-6 md:h-6" fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Question Content */}
                {currentQuestion.type === 'multiple-choice' && currentQuestion.answers && (
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {currentQuestion.answers.map((answer, index) => {
                      const isSelected = userAnswers[currentQuestion.id] === answer.id
                      return (
                        <button
                          key={answer.id}
                          onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                          className={`group relative flex items-center p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 text-left ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/10'
                            : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-base border-2 transition-colors duration-300 mr-4 shrink-0 ${isSelected
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 group-hover:border-blue-300 group-hover:text-blue-500'
                            }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className={`text-sm md:text-lg font-medium transition-colors duration-300 ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                            {answer.text}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Only multiple-choice questions are supported */}
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 md:mt-10 gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border ${currentQuestionIndex === 0
                  ? 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-white/5 cursor-not-allowed'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREVIOUS</span>
              </button>

              <button
                onClick={handleExamComplete}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-green-500/20 active:scale-95"
              >
                SUBMIT EXAM
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${currentQuestionIndex === exam.questions.length - 1
                  ? 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                <span>NEXT</span>
                <ChevronRight className="w-4 h-4" />
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
            <div className="bg-white dark:bg-[#111114] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 md:p-8 h-fit">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Exam Progress
              </h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Progress</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentQuestionIndex + 1} of {exam.questions.length}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xl md:text-2xl font-black text-green-500">{answeredCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Done</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl md:text-2xl font-black text-amber-500">{flaggedCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Flagged</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl md:text-2xl font-black text-slate-400 dark:text-slate-600">{exam.questions.length - answeredCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Left</span>
                </div>
              </div>

              {/* Question Navigation Dots */}
              <div className="pt-6 border-t dark:border-white/5">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Quick Jump
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {exam.questions.map((question, index) => {
                    const isAnswered = question ? userAnswers[question.id] : false
                    const isCurrent = index === currentQuestionIndex
                    const isFlagged = question ? flaggedQuestions.has(question.id) : false

                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCurrent
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110 z-10'
                          : isAnswered
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20'
                            : isFlagged
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        title={`Question ${index + 1}${isCurrent ? ' (Current)' : ''}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
                      >
                        {index + 1}
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
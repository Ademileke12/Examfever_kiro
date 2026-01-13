'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

interface Question {
  id: string
  type: string
  text: string
  options?: Array<{
    id: string
    text: string
    isCorrect: boolean
  }>
  correctAnswer?: string
  explanation?: string
  difficulty: string
  points: number
}

interface Answer {
  questionId: string
  answerText?: string
  selectedOptionId?: string
  timeSpent: number
  isFlagged: boolean
}

interface ExamInterfaceProps {
  examId: string
  questions: Question[]
  timeLimit: number // in minutes
  onExamComplete: (answers: Answer[], totalTime: number) => void
}

export default function ExamInterface({ 
  examId, 
  questions, 
  timeLimit, 
  onExamComplete 
}: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // Convert to seconds
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const totalTime = Math.floor((Date.now() - startTime) / 1000)
    const answersArray = Object.values(answers)
    
    onExamComplete(answersArray, totalTime)
  }, [isSubmitting, startTime, answers, onExamComplete])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [handleSubmitExam])

  // Track time spent on each question
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const updateAnswer = useCallback((questionId: string, updates: Partial<Answer>) => {
    setAnswers(prev => {
      const existing = prev[questionId] || { questionId, timeSpent: 0, isFlagged: false }
      return {
        ...prev,
        [questionId]: {
          ...existing,
          ...updates
        }
      }
    })
  }, [])

  const handleAnswerChange = (value: string, isOption = false) => {
    if (!currentQuestion) return
    
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    if (isOption) {
      updateAnswer(currentQuestion.id, {
        selectedOptionId: value,
        timeSpent: (answers[currentQuestion.id]?.timeSpent || 0) + timeSpent
      })
    } else {
      updateAnswer(currentQuestion.id, {
        answerText: value,
        timeSpent: (answers[currentQuestion.id]?.timeSpent || 0) + timeSpent
      })
    }
  }

  const toggleFlag = () => {
    if (!currentQuestion) return
    
    updateAnswer(currentQuestion.id, {
      isFlagged: !answers[currentQuestion.id]?.isFlagged
    })
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const getQuestionStatus = (index: number) => {
    const question = questions[index]
    if (!question) return 'unanswered'
    
    const answer = answers[question.id]
    
    if (!answer) return 'unanswered'
    if (answer.isFlagged) return 'flagged'
    if (answer.answerText || answer.selectedOptionId) return 'answered'
    return 'unanswered'
  }

  const answeredCount = questions.filter(q => {
    const answer = answers[q.id]
    return answer && (answer.answerText || answer.selectedOptionId)
  }).length

  const flaggedCount = questions.filter(q => answers[q.id]?.isFlagged).length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      {!currentQuestion ? (
        <div>Loading...</div>
      ) : (
        <>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        border: '1px solid #e5e7eb', 
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            {answeredCount} answered • {flaggedCount} flagged
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: timeRemaining < 300 ? '#fef2f2' : '#eff6ff',
            borderRadius: '0.375rem',
            border: `1px solid ${timeRemaining < 300 ? '#fecaca' : '#bfdbfe'}`
          }}>
            <Clock style={{ 
              width: '1rem', 
              height: '1rem', 
              color: timeRemaining < 300 ? '#dc2626' : '#2563eb' 
            }} />
            <span style={{ 
              fontWeight: '600', 
              color: timeRemaining < 300 ? '#dc2626' : '#2563eb' 
            }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
        {/* Question Content */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '2rem' 
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {currentQuestion.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: currentQuestion.difficulty === 'easy' ? '#f0fdf4' : 
                                 currentQuestion.difficulty === 'medium' ? '#fefce8' : '#fef2f2',
                  color: currentQuestion.difficulty === 'easy' ? '#166534' : 
                         currentQuestion.difficulty === 'medium' ? '#a16207' : '#dc2626',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                </span>
              </div>
              
              <button
                onClick={toggleFlag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: answers[currentQuestion.id]?.isFlagged ? '#dc2626' : '#6b7280'
                }}
              >
                <Flag 
                  style={{ 
                    width: '1rem', 
                    height: '1rem',
                    fill: answers[currentQuestion.id]?.isFlagged ? 'currentColor' : 'none'
                  }} 
                />
              </button>
            </div>
            
            <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', lineHeight: '1.6' }}>
              {currentQuestion.text}
            </h2>
          </div>

          {/* Answer Input */}
          <div style={{ marginBottom: '2rem' }}>
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      border: '2px solid',
                      borderColor: answers[currentQuestion.id]?.selectedOptionId === option.id ? '#2563eb' : '#e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: answers[currentQuestion.id]?.selectedOptionId === option.id ? '#eff6ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={answers[currentQuestion.id]?.selectedOptionId === option.id}
                      onChange={(e) => handleAnswerChange(e.target.value, true)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#111827' }}>
                      {String.fromCharCode(65 + index)}. {option.text}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[currentQuestion.id]?.answerText || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
              Previous
            </button>

            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
            </span>

            <button
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === questions.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: currentQuestionIndex === questions.length - 1 ? '#f3f4f6' : '#2563eb',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: currentQuestionIndex === questions.length - 1 ? '#9ca3af' : 'white',
                cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '1.5rem',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            Question Navigator
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {questions.map((_, index) => {
              const status = getQuestionStatus(index)
              return (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid',
                    borderColor: index === currentQuestionIndex ? '#2563eb' : '#d1d5db',
                    backgroundColor: 
                      status === 'answered' ? '#dcfce7' :
                      status === 'flagged' ? '#fef3c7' :
                      index === currentQuestionIndex ? '#eff6ff' : 'white',
                    color: 
                      status === 'answered' ? '#166534' :
                      status === 'flagged' ? '#a16207' :
                      index === currentQuestionIndex ? '#2563eb' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.25rem' }} />
              Answered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem' }} />
              Flagged
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
              Unanswered
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
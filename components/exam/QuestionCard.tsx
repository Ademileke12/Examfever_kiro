'use client'

import { motion } from 'framer-motion'
import { Flag, CheckCircle } from 'lucide-react'
import { questionVariants, answerVariants } from '@/lib/animations/variants'

interface Answer {
  id: string
  text: string
  isCorrect?: boolean
}

interface Question {
  id: string
  text: string
  type: 'multiple-choice' // Only support multiple-choice questions
  answers?: Answer[]
  userAnswer?: string
  isFlagged?: boolean
}

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswerSelect: (answerId: string) => void
  onAnswerChange: (answer: string) => void
  onToggleFlag: () => void
  showResults?: boolean
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  onAnswerChange,
  onToggleFlag,
  showResults = false
}: QuestionCardProps) {
  
  const getAnswerState = (answer: Answer) => {
    if (!showResults) {
      return question.userAnswer === answer.id ? 'selected' : 'unselected'
    }
    
    if (question.userAnswer === answer.id) {
      return answer.isCorrect ? 'correct' : 'incorrect'
    }
    
    if (answer.isCorrect) {
      return 'correct'
    }
    
    return 'unselected'
  }

  return (
    <motion.div
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6"
    >
      {/* Question header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.userAnswer && (
              <CheckCircle className="w-5 h-5 text-success-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {question.text}
          </h3>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFlag}
          className={`p-2 rounded-lg transition-colors ${
            question.isFlagged
              ? 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400'
              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-600'
          }`}
        >
          <Flag className="w-5 h-5" fill={question.isFlagged ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      {/* Question content based on type */}
      {question.type === 'multiple-choice' && question.answers && (
        <div className="space-y-3">
          {question.answers.map((answer, index) => {
            const answerState = getAnswerState(answer)
            
            return (
              <motion.button
                key={answer.id}
                variants={answerVariants}
                animate={answerState}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => !showResults && onAnswerSelect(answer.id)}
                disabled={showResults}
                className="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {answer.text}
                  </span>
                  {showResults && answer.isCorrect && (
                    <CheckCircle className="w-5 h-5 text-success-500 ml-auto" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Only multiple-choice questions are supported */}
    </motion.div>
  )
}

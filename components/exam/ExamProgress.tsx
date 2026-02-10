'use client'

import { motion } from 'framer-motion'
import { progressVariants } from '@/lib/animations/variants'

interface ExamProgressProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: number
  flaggedQuestions: number
}

export default function ExamProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions
}: ExamProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100
  const answeredPercentage = (answeredQuestions / totalQuestions) * 100

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Exam Progress
        </h3>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {currentQuestion} of {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-4">
        {/* Answered questions background */}
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={answeredPercentage}
          className="absolute inset-y-0 left-0 bg-success-200 dark:bg-success-800 rounded-full"
        />
        
        {/* Current progress */}
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={progressPercentage}
          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-success-600 dark:text-success-400">
            {answeredQuestions}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Answered
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-semibold text-warning-600 dark:text-warning-400">
            {flaggedQuestions}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Flagged
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
            {totalQuestions - answeredQuestions}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Remaining
          </div>
        </div>
      </div>

      {/* Quick navigation dots */}
      <div className="flex flex-wrap gap-1 mt-4 justify-center">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNum = index + 1
          const isAnswered = questionNum <= answeredQuestions
          const isCurrent = questionNum === currentQuestion
          const isFlagged = false // This would come from question data
          
          return (
            <motion.div
              key={questionNum}
              whileHover={{ scale: 1.2 }}
              className={`w-3 h-3 rounded-full border-2 cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-primary-500 border-primary-500 scale-125'
                  : isAnswered
                  ? 'bg-success-500 border-success-500'
                  : isFlagged
                  ? 'bg-warning-500 border-warning-500'
                  : 'bg-neutral-200 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600'
              }`}
              title={`Question ${questionNum}${isCurrent ? ' (current)' : ''}${isAnswered ? ' (answered)' : ''}${isFlagged ? ' (flagged)' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}

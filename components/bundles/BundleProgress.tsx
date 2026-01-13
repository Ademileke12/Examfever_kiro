'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen,
  CheckCircle,
  Clock
} from 'lucide-react'

interface BundleProgressProps {
  bundleContext?: {
    bundleIds: string[]
    bundleNames: string[]
    bundleDistribution: Record<string, number>
    totalQuestions: number
  }
  currentQuestionIndex: number
  totalQuestions: number
  answeredQuestions: number[]
  timeRemaining?: number
}

export default function BundleProgress({
  bundleContext,
  currentQuestionIndex,
  totalQuestions,
  answeredQuestions,
  timeRemaining
}: BundleProgressProps) {
  if (!bundleContext) {
    return null
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getSubjectColor = (bundleName: string) => {
    // Simple hash function to get consistent colors
    let hash = 0
    for (let i = 0; i < bundleName.length; i++) {
      hash = bundleName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    ]
    
    return colors[Math.abs(hash) % colors.length]
  }

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const answeredPercentage = (answeredQuestions.length / totalQuestions) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Bundle-Based Exam
          </span>
        </div>
        {timeRemaining !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`font-mono ${
              timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{answeredQuestions.length} answered</span>
        </div>
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          {/* Answered progress */}
          <div
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${answeredPercentage}%` }}
          />
          {/* Current progress */}
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Bundle Information */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Source Bundles:
        </div>
        <div className="grid grid-cols-1 gap-2">
          {bundleContext.bundleNames.map((bundleName, index) => {
            const bundleId = bundleContext.bundleIds[index]
            const questionCount = bundleId ? (bundleContext.bundleDistribution[bundleId] || 0) : 0
            
            return (
              <div
                key={bundleId}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(bundleName)}`}>
                    {bundleName}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {questionCount} questions
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {bundleContext.bundleIds.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bundles</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {answeredQuestions.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Answered</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {totalQuestions - answeredQuestions.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
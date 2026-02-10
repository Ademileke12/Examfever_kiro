'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import { timerVariants } from '@/lib/animations/variants'

interface ExamTimerProps {
  totalTimeMinutes: number
  onTimeUp: () => void
  isPaused?: boolean
}

export default function ExamTimer({ totalTimeMinutes, onTimeUp, isPaused = false }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalTimeMinutes * 60) // Convert to seconds
  
  // Calculate timer state based on remaining time
  const getTimerState = () => {
    const percentage = (timeLeft / (totalTimeMinutes * 60)) * 100
    if (percentage <= 10) return 'critical'
    if (percentage <= 25) return 'warning'
    return 'normal'
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, isPaused, onTimeUp])

  const timerState = getTimerState()
  const percentage = (timeLeft / (totalTimeMinutes * 60)) * 100

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <motion.div
        variants={timerVariants}
        animate={timerState}
        className="flex items-center gap-2"
      >
        {timerState === 'critical' ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Clock className="w-5 h-5" />
        )}
        <span className="text-lg font-mono font-semibold">
          {formatTime(timeLeft)}
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            timerState === 'critical' 
              ? 'bg-error-500' 
              : timerState === 'warning'
              ? 'bg-warning-500'
              : 'bg-primary-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Time status text */}
      <span className={`text-sm font-medium ${
        timerState === 'critical' 
          ? 'text-error-600 dark:text-error-400' 
          : timerState === 'warning'
          ? 'text-warning-600 dark:text-warning-400'
          : 'text-neutral-600 dark:text-neutral-400'
      }`}>
        {timerState === 'critical' && 'Time Critical!'}
        {timerState === 'warning' && 'Time Warning'}
        {timerState === 'normal' && 'Time Remaining'}
      </span>
    </div>
  )
}

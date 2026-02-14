'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Upload, Loader2, Sparkles, Brain, FileText, Zap } from 'lucide-react'
import { UploadProgress } from '@/types/upload'
import QuestionGenerationStatus from './QuestionGenerationStatus'
import { motion, AnimatePresence } from 'framer-motion'

interface PDFUploadProgressProps {
  uploads: UploadProgress[]
  questionResults?: Record<string, any> // Question generation results by fileId
}

const statusIcons = {
  idle: Clock,
  validating: Clock,
  uploading: Upload,
  processing: Loader2,
  completed: CheckCircle,
  error: XCircle
}

const statusColors = {
  idle: 'text-gray-500',
  validating: 'text-amber-500',
  uploading: 'text-blue-600',
  processing: 'text-primary',
  completed: 'text-green-600',
  error: 'text-red-600'
}

const getProcessingMessage = (progress: number) => {
  if (progress < 25) return 'Analyzing PDF structure...'
  if (progress < 50) return 'Extracting key concepts...'
  if (progress < 75) return 'Formulating intelligent questions...'
  if (progress < 95) return 'Finalizing exam bundle...'
  return 'Almost done...'
}

const statusMessages = {
  idle: 'Waiting...',
  validating: 'Validating PDF integrity...',
  uploading: 'Uploading to secure server...',
  processing: 'AI is thinking...',
  completed: 'AI Generation Successful!',
  error: 'Processing failed'
}

function SimulatedProgress({
  targetProgress,
  status,
  className
}: {
  targetProgress: number,
  status: string,
  className?: string
}) {
  const [displayProgress, setDisplayProgress] = useState(targetProgress)

  useEffect(() => {
    if (status !== 'processing') {
      setDisplayProgress(targetProgress)
      return
    }

    const interval = setInterval(() => {
      setDisplayProgress((prev: number) => {
        if (prev >= 99) return 99
        // Slow down as it gets closer to 99
        const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.5
        return Math.min(prev + increment, 99)
      })
    }, 1500) // Update every 1.5 seconds

    return () => clearInterval(interval)
  }, [status, targetProgress])

  return (
    <span className={className}>
      {Math.round(displayProgress)}%
    </span>
  )
}

function SimulatedProgressBar({
  progress,
  status
}: {
  progress: number,
  status: string
}) {
  const [displayProgress, setDisplayProgress] = useState(progress)

  useEffect(() => {
    if (status !== 'processing') {
      setDisplayProgress(progress)
      return
    }

    const interval = setInterval(() => {
      setDisplayProgress((prev: number) => {
        if (prev >= 99) return 99
        const increment = prev < 50 ? 1 : prev < 80 ? 0.5 : 0.2
        return Math.min(prev + increment, 99)
      })
    }, 800)

    return () => clearInterval(interval)
  }, [status, progress])

  return (
    <motion.div
      className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-primary ${status === 'processing' ? 'animate-shimmer shadow-glow' : ''
        }`}
      initial={{ width: 0 }}
      animate={{ width: `${displayProgress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ backgroundSize: '200% 100%' }}
    />
  )
}

export default function PDFUploadProgress({ uploads, questionResults }: PDFUploadProgressProps) {
  if (uploads.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {uploads.map((upload) => {
            const Icon = statusIcons[upload.status]
            const colorClass = statusColors[upload.status]
            const message = upload.status === 'processing'
              ? getProcessingMessage(upload.progress)
              : statusMessages[upload.status]

            return (
              <motion.div
                key={upload.fileId}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative glass glass-hover rounded-2xl border border-white/10 dark:border-white/5 p-4 sm:p-6 shadow-xl overflow-hidden"
              >
                {/* Background Sparkle Effect for processing */}
                {upload.status === 'processing' && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 ${colorClass}`}>
                        {upload.status === 'processing' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-readable block truncate text-sm sm:text-base">
                          {upload.fileName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${colorClass}`}>
                            {upload.status}
                          </span>
                          {upload.status === 'processing' && (
                            <motion.div
                              className="flex gap-1"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Sparkles className="w-3 h-3 text-primary" />
                              <Brain className="w-3 h-3 text-primary" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <span className="text-xs text-readable-muted sm:hidden font-medium">Progress</span>
                      <SimulatedProgress
                        targetProgress={upload.progress}
                        status={upload.status}
                        className="text-lg sm:text-2xl font-black text-readable"
                      />
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="relative h-2.5 sm:h-3 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden mb-4 border border-white/5">
                    <SimulatedProgressBar progress={upload.progress} status={upload.status} />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {upload.status === 'processing' ? (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium">
                          <Zap className="w-3.5 h-3.5 sm:w-4 h-4 animate-pulse shrink-0" />
                          <span className="truncate">{message}</span>
                        </div>
                      ) : (
                        <span className={`text-xs sm:text-sm font-medium ${colorClass} truncate`}>
                          {upload.error || message}
                        </span>
                      )}
                    </div>

                    {upload.endTime && (
                      <div className="flex items-center self-end sm:self-auto gap-1.5 text-readable-muted text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg bg-white/5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(upload.startTime, upload.endTime)}
                      </div>
                    )}
                  </div>

                  {/* Question generation status */}
                  {upload.status === 'completed' && questionResults?.[upload.fileId] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-white/10"
                    >
                      <QuestionGenerationStatus
                        result={questionResults[upload.fileId]}
                        fileName={upload.fileName}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatDuration(start: Date, end: Date): string {
  const duration = Math.round((end.getTime() - start.getTime()) / 1000)

  if (duration < 60) {
    return `${duration}s`
  }

  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}m ${seconds}s`
}

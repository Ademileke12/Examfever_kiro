'use client'

import { CheckCircle, XCircle, Clock, Upload } from 'lucide-react'
import { UploadProgress } from '@/types/upload'
import QuestionGenerationStatus from './QuestionGenerationStatus'

interface PDFUploadProgressProps {
  uploads: UploadProgress[]
  questionResults?: Record<string, any> // Question generation results by fileId
}

const statusIcons = {
  idle: Clock,
  validating: Clock,
  uploading: Upload,
  processing: Clock,
  completed: CheckCircle,
  error: XCircle
}

const statusColors = {
  idle: '#6b7280',
  validating: '#f59e0b',
  uploading: '#2563eb',
  processing: '#2563eb',
  completed: '#16a34a',
  error: '#dc2626'
}

const statusMessages = {
  idle: 'Waiting...',
  validating: 'Validating file...',
  uploading: 'Processing...',
  processing: 'Extracting text and generating questions...',
  completed: 'Processing complete',
  error: 'Processing failed'
}

export default function PDFUploadProgress({ uploads, questionResults }: PDFUploadProgressProps) {
  if (uploads.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Upload Progress
      </h3>

      <div className="flex flex-col gap-3">
        {uploads.map((upload) => {
          const Icon = statusIcons[upload.status]
          const colorClass = {
            idle: 'text-gray-500',
            validating: 'text-amber-500',
            uploading: 'text-blue-600',
            processing: 'text-blue-600',
            completed: 'text-green-600',
            error: 'text-red-600'
          }[upload.status]

          const message = statusMessages[upload.status]

          return (
            <div
              key={upload.fileId}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${colorClass}`} />
                  <span className="font-medium text-gray-900 truncate">
                    {upload.fileName}
                  </span>
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {upload.progress}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>

              <div className="flex items-start justify-between text-sm gap-2">
                <span className={`${colorClass} break-words flex-1`}>
                  {upload.error || message}
                </span>
                {upload.endTime && (
                  <span className="text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                    {formatDuration(upload.startTime, upload.endTime)}
                  </span>
                )}
              </div>

              {/* Question generation status */}
              {upload.status === 'completed' && questionResults?.[upload.fileId] && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <QuestionGenerationStatus
                    result={questionResults[upload.fileId]}
                    fileName={upload.fileName}
                  />
                </div>
              )}
            </div>
          )
        })}
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

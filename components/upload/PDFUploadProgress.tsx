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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
        Upload Progress
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {uploads.map((upload) => {
          const Icon = statusIcons[upload.status]
          const color = statusColors[upload.status]
          const message = statusMessages[upload.status]
          
          return (
            <div
              key={upload.fileId}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon style={{ width: '1rem', height: '1rem', color }} />
                  <span style={{ fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {upload.fileName}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {upload.progress}%
                </span>
              </div>
              
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem', marginBottom: '0.5rem' }}>
                <div 
                  style={{ 
                    height: '0.5rem', 
                    backgroundColor: '#2563eb', 
                    borderRadius: '9999px', 
                    width: `${upload.progress}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color }}>
                  {upload.error || message}
                </span>
                {upload.endTime && (
                  <span style={{ color: '#6b7280' }}>
                    {formatDuration(upload.startTime, upload.endTime)}
                  </span>
                )}
              </div>
              
              {/* Question generation status */}
              {upload.status === 'completed' && questionResults?.[upload.fileId] && (
                <QuestionGenerationStatus
                  result={questionResults[upload.fileId]}
                  fileName={upload.fileName}
                />
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

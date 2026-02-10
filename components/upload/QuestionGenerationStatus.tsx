'use client'

import { CheckCircle, XCircle, Wand2, Database, Clock, Zap } from 'lucide-react'

interface QuestionGenerationResult {
  success: boolean
  questionsGenerated: number
  questionsSaved: number
  error?: string
  metadata?: {
    processingTime?: number
    model?: string
  }
}

interface QuestionGenerationStatusProps {
  result: QuestionGenerationResult | null
  fileName: string
  isGenerating?: boolean
  currentBatch?: number
  totalBatches?: number
}

export default function QuestionGenerationStatus({ 
  result, 
  fileName, 
  isGenerating = false,
  currentBatch = 0,
  totalBatches = 0
}: QuestionGenerationStatusProps) {
  if (!result && !isGenerating) return null

  return (
    <div style={{ 
      marginTop: '1rem', 
      padding: '1rem', 
      backgroundColor: '#f9fafb', 
      borderRadius: '0.5rem', 
      border: '1px solid #e5e7eb' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Wand2 style={{ width: '1rem', height: '1rem', color: '#2563eb' }} />
        <span style={{ fontWeight: '500', color: '#111827' }}>
          AI Question Generation
        </span>
      </div>

      {isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb' }}>
            <Clock style={{ width: '1rem', height: '1rem' }} />
            <span style={{ fontSize: '0.875rem' }}>
              Generating questions in batches of 5...
            </span>
          </div>
          
          {totalBatches > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
              <Zap style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontSize: '0.875rem' }}>
                Batch {currentBatch} of {totalBatches} - Using Google Gemini AI (Extended processing time)
              </span>
            </div>
          )}

          <div style={{ 
            marginTop: '0.5rem',
            width: '100%',
            height: '0.5rem',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: totalBatches > 0 ? `${(currentBatch / totalBatches) * 100}%` : '0%',
              height: '100%',
              backgroundColor: '#2563eb',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
        </div>
      )}

      {result && result.success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
            <CheckCircle style={{ width: '1rem', height: '1rem' }} />
            <span style={{ fontSize: '0.875rem' }}>
              Generated {result.questionsGenerated} questions from {fileName}
              {result.metadata?.model && (
                <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                  using {result.metadata.model === 'enhanced-local-generator' ? 'Enhanced Local AI' : result.metadata.model}
                  {result.metadata.model === 'enhanced-local-generator' && (
                    <span style={{ color: '#16a34a', marginLeft: '0.25rem' }}>⚡ (Offline)</span>
                  )}
                </span>
              )}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
            <Database style={{ width: '1rem', height: '1rem' }} />
            <span style={{ fontSize: '0.875rem' }}>
              Saved {result.questionsSaved} questions to your question bank
            </span>
          </div>

          {result.metadata?.processingTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
              <Clock style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontSize: '0.875rem' }}>
                Processing time: {Math.round(result.metadata.processingTime / 1000)}s
              </span>
            </div>
          )}

          <div style={{ 
            marginTop: '0.75rem', 
            padding: '0.75rem', 
            backgroundColor: '#eff6ff', 
            borderRadius: '0.375rem', 
            border: '1px solid #bfdbfe' 
          }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              ✨ Your questions are ready! You can now create exams from your question bank.
            </p>
          </div>
        </div>
      ) : result && !result.success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
            <XCircle style={{ width: '1rem', height: '1rem' }} />
            <span style={{ fontSize: '0.875rem' }}>
              AI question generation failed: {result.error}
            </span>
          </div>
          
          <div style={{ 
            marginTop: '0.75rem', 
            padding: '0.75rem', 
            backgroundColor: '#fef3c7', 
            borderRadius: '0.375rem', 
            border: '1px solid #fbbf24' 
          }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
              📄 PDF processed successfully! Text extracted and ready for manual question creation.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

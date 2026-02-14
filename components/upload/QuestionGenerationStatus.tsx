'use client'

import { CheckCircle, XCircle, Wand2, Database, Clock, Zap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="mt-4 p-4 rounded-2xl glass border border-white/10 dark:border-white/5 shadow-inner">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Wand2 className="w-4 h-4 text-primary" />
        </div>
        <span className="font-bold text-readable text-sm sm:text-base">
          AI Question Generation
        </span>
      </div>

      {isGenerating && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">
              Generating questions in batches...
            </span>
          </div>

          {totalBatches > 0 && (
            <div className="flex items-center gap-2 text-readable-muted">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs">
                Batch {currentBatch} of {totalBatches} • Using Gemini AI
              </span>
            </div>
          )}

          <div className="w-full h-1.5 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-primary shadow-glow"
              initial={{ width: 0 }}
              animate={{ width: totalBatches > 0 ? `${(currentBatch / totalBatches) * 100}%` : '20%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {result && result.success ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-tight mb-1">
                Generated {result.questionsGenerated} questions
              </p>
              <p className="text-[10px] sm:text-xs opacity-80 truncate">
                From: {fileName}
              </p>
              {result.metadata?.model && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20">
                  <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">
                    {result.metadata.model === 'enhanced-local-generator' ? 'Local AI Core' : result.metadata.model}
                  </span>
                  {result.metadata.model === 'enhanced-local-generator' && (
                    <span className="text-[10px]">⚡</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <Database className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Saved {result.questionsSaved} to question bank
            </span>
          </div>

          {result.metadata?.processingTime && (
            <div className="flex items-center gap-3 text-readable-muted">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm">
                Efficiency: {Math.round(result.metadata.processingTime / 1000)}s
              </span>
            </div>
          )}

          <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-xs sm:text-sm text-primary font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your questions are ready for exam creation!
            </p>
          </div>
        </div>
      ) : result && !result.success ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-bold leading-tight">
              Generation failed: {result.error}
            </span>
          </div>

          <div className="mt-2 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium">
              📄 Text extracted successfully. You can still create questions manually.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

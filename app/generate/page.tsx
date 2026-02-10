'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Wand2, FileText, Settings, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { QuestionType, DifficultyLevel, Question } from '@/lib/questions/types'
import { pageVariants } from '@/lib/animations/variants'

interface GenerationOptions {
  questionTypes: QuestionType[]
  difficulty: DifficultyLevel[]
  maxQuestions: number
  content: string
}

export default function GeneratePage() {
  const [options, setOptions] = useState<GenerationOptions>({
    questionTypes: ['multiple-choice'],
    difficulty: ['medium'],
    maxQuestions: 10,
    content: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!options.content.trim()) {
      setError('Please provide content for question generation')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: options.content,
          questionTypes: options.questionTypes,
          difficulty: options.difficulty,
          maxQuestions: options.maxQuestions,
          userId: 'demo-user'
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Generation failed')
      }

      setGeneratedQuestions(result.data.questions)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  const handleOptionChange = useCallback((key: keyof GenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            AI Question Generator
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Generation Options
              </h2>
            </div>

            <div className="space-y-4">
              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Question Types
                </label>
                <div className="space-y-2">
                  {(['multiple-choice'] as QuestionType[]).map(type => ( // Only support multiple-choice
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.questionTypes.includes(type)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...options.questionTypes, type]
                            : options.questionTypes.filter(t => t !== type)
                          handleOptionChange('questionTypes', types)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                        {type.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Levels */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Difficulty Levels
                </label>
                <div className="space-y-2">
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.difficulty.includes(level)}
                        onChange={(e) => {
                          const levels = e.target.checked
                            ? [...options.difficulty, level]
                            : options.difficulty.filter(d => d !== level)
                          handleOptionChange('difficulty', levels)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Questions */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Maximum Questions: {options.maxQuestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={options.maxQuestions}
                  onChange={(e) => handleOptionChange('maxQuestions', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !options.content.trim()}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Questions
              </>
            )}
          </Button>

          {/* Progress */}
          {isGenerating && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                Generating questions...
              </p>
            </div>
          )}
        </div>

        {/* Content Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Content Input
              </h2>
            </div>

            <textarea
              value={options.content}
              onChange={(e) => handleOptionChange('content', e.target.value)}
              placeholder="Paste your study material content here... (minimum 100 characters)"
              className="w-full h-64 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex justify-between items-center mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              <span>{options.content.length} characters</span>
              <span>Minimum: 100 characters</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <p className="text-error-700 dark:text-error-300">{error}</p>
            </div>
          )}

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Generated Questions ({generatedQuestions.length})
                </h2>
              </div>

              <div className="space-y-4">
                {generatedQuestions.map((question, index) => (
                  <div key={question.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        Question {index + 1} • {question.type.replace('-', ' ')} • {question.difficulty}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Score: {(question.metadata.qualityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <p className="text-neutral-900 dark:text-neutral-100 mb-3">
                      {question.text}
                    </p>

                    {question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={option.id} className={`text-sm p-2 rounded ${
                            option.isCorrect 
                              ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200' 
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}. {option.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

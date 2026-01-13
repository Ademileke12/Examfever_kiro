export type QuestionType = 'multiple-choice' // Only support multiple-choice questions
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface Question {
  id: string
  type: QuestionType
  text: string
  options?: QuestionOption[]
  correctAnswer?: string
  explanation?: string
  difficulty: DifficultyLevel
  topic?: string
  keywords: string[]
  sourceContent: string
  metadata: QuestionMetadata
  // Course-specific fields
  file_id?: string
  course_id?: string
  subject_tag?: string
  document_title?: string
}

export interface QuestionMetadata {
  generatedAt: Date
  model: string
  confidence: number // 0-1
  qualityScore: number // 0-1
  processingTime: number // milliseconds
  sourceChunk: string
  contentHash: string
}

export interface QuestionGenerationRequest {
  content: string
  questionTypes: QuestionType[]
  difficulty: DifficultyLevel[]
  maxQuestions: number
  topics?: string[]
  userId: string
  fileId?: string
}

export interface QuestionGenerationResponse {
  success: boolean
  questions: Question[]
  metadata: GenerationMetadata
  error?: string
}

export interface GenerationMetadata {
  totalQuestions: number
  processingTime: number
  model: string
  contentLength: number
  chunksProcessed: number
  qualityStats: {
    averageScore: number
    passedValidation: number
    totalGenerated: number
  }
  deduplicationStats?: {
    originalCount: number
    duplicatesRemoved: number
    finalCount: number
  }
}

export interface QuestionValidationResult {
  isValid: boolean
  score: number // 0-1
  issues: ValidationIssue[]
  suggestions: string[]
}

export interface ValidationIssue {
  type: 'grammar' | 'clarity' | 'relevance' | 'difficulty' | 'structure'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion?: string
}

export interface TopicExtraction {
  topics: string[]
  keywords: string[]
  concepts: string[]
  difficulty: DifficultyLevel
  contentType: 'academic' | 'technical' | 'general'
}

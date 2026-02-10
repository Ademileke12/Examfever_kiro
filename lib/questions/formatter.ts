import { Question, QuestionType, DifficultyLevel, QuestionOption } from './types'
import { generateId } from '@/lib/utils'

export interface RawQuestionData {
  question: string
  options?: Array<{ text: string; correct: boolean }>
  answer?: string
  explanation?: string
  topic?: string
  keywords?: string[]
  guidelines?: string
}

export function formatQuestion(
  rawData: RawQuestionData,
  type: QuestionType,
  difficulty: DifficultyLevel,
  sourceContent: string,
  model: string
): Question {
  const id = generateId()
  const now = new Date()

  // Format options for multiple choice
  let options: QuestionOption[] | undefined
  if (type === 'multiple-choice' && rawData.options) {
    options = rawData.options.map((opt) => {
      const option: QuestionOption = {
        id: generateId(),
        text: opt.text.trim(),
        isCorrect: opt.correct
      }
      
      if (opt.correct && rawData.explanation) {
        option.explanation = rawData.explanation
      }
      
      return option
    })
  }

  // Extract keywords
  const keywords = rawData.keywords || extractKeywordsFromText(rawData.question)

  const question: Question = {
    id,
    type,
    text: cleanQuestionText(rawData.question),
    difficulty,
    topic: rawData.topic || 'General',
    keywords,
    sourceContent: sourceContent.substring(0, 500), // Store first 500 chars
    metadata: {
      generatedAt: now,
      model,
      confidence: calculateConfidence(rawData, type),
      qualityScore: 0, // Will be calculated by validator
      processingTime: 0, // Will be set by generator
      sourceChunk: sourceContent.substring(0, 200),
      contentHash: generateContentHash(sourceContent)
    }
  }
  
  if (options) {
    question.options = options
  }
  
  if (rawData.answer || rawData.guidelines) {
    const answer = rawData.answer || rawData.guidelines
    if (answer) {
      question.correctAnswer = answer
    }
  }
  
  if (rawData.explanation) {
    question.explanation = rawData.explanation
  }
  
  return question
}

export function formatMultipleQuestions(
  rawQuestions: RawQuestionData[],
  type: QuestionType,
  difficulty: DifficultyLevel,
  sourceContent: string,
  model: string
): Question[] {
  return rawQuestions.map(rawData => 
    formatQuestion(rawData, type, difficulty, sourceContent, model)
  )
}

export function parseAIResponse(response: string, questionType: QuestionType): RawQuestionData[] {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response)
    
    if (Array.isArray(parsed)) {
      return parsed.map(item => normalizeRawQuestion(item, questionType))
    } else {
      return [normalizeRawQuestion(parsed, questionType)]
    }
  } catch {
    // Fallback to text parsing
    return parseTextResponse(response, questionType)
  }
}

function normalizeRawQuestion(data: any, questionType: QuestionType): RawQuestionData {
  const normalized: RawQuestionData = {
    question: data.question || data.text || '',
    topic: data.topic || 'General',
    keywords: Array.isArray(data.keywords) ? data.keywords : []
  }

  switch (questionType) {
    case 'multiple-choice':
      normalized.options = data.options || []
      normalized.explanation = data.explanation
      break
    
    // Note: short-answer, essay, and true-false types removed since we only use multiple-choice
  }

  return normalized
}

function parseTextResponse(response: string, questionType: QuestionType): RawQuestionData[] {
  const questions: RawQuestionData[] = []
  
  // Simple text parsing - split by question numbers or double newlines
  const sections = response.split(/\n\s*\n|\d+\.\s*/).filter(s => s.trim())
  
  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(l => l)
    if (lines.length === 0) continue

    const firstLine = lines[0]
    if (!firstLine) continue

    const question: RawQuestionData = {
      question: firstLine.replace(/^\d+\.\s*/, ''),
      keywords: []
    }

    // Extract additional information based on question type
    if (questionType === 'multiple-choice') {
      const options: Array<{ text: string; correct: boolean }> = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (line && /^[A-D]\)/.test(line)) {
          options.push({
            text: line.replace(/^[A-D]\)\s*/, ''),
            correct: line.includes('*') || line.includes('(correct)')
          })
        }
      }
      question.options = options
    }

    questions.push(question)
  }

  return questions
}

function cleanQuestionText(text: string): string {
  return text
    .trim()
    .replace(/^\d+\.\s*/, '') // Remove question numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([.!?])\s*$/, '$1') // Ensure proper punctuation
}

function extractKeywordsFromText(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word))

  // Get unique words, sorted by length (longer words first)
  const uniqueWords = Array.from(new Set(words))
  return uniqueWords
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ])
  return stopWords.has(word.toLowerCase())
}

function calculateConfidence(data: RawQuestionData, type: QuestionType): number {
  let confidence = 0.5 // Base confidence

  // Increase confidence based on completeness
  if (data.question && data.question.length > 20) confidence += 0.2
  if (data.topic && data.topic !== 'General') confidence += 0.1
  if (data.keywords && data.keywords.length > 0) confidence += 0.1

  // Type-specific confidence adjustments
  switch (type) {
    case 'multiple-choice':
      if (data.options && data.options.length >= 4) confidence += 0.1
      if (data.explanation) confidence += 0.1
      break
    
    // Note: short-answer and essay types removed since we only use multiple-choice
  }

  return Math.min(1.0, confidence)
}

function generateContentHash(content: string): string {
  // Simple hash function for content identification
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

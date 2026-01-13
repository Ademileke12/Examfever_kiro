import { Question, DifficultyLevel } from './types'

interface DifficultyMetrics {
  vocabularyComplexity: number
  conceptualDepth: number
  cognitiveLoad: number
  questionLength: number
  overallScore: number
}

export function analyzeDifficulty(question: Question): DifficultyMetrics {
  const vocabularyComplexity = analyzeVocabularyComplexity(question.text)
  const conceptualDepth = analyzeConceptualDepth(question.text, question.type)
  const cognitiveLoad = analyzeCognitiveLoad(question.text)
  const questionLength = analyzeQuestionLength(question.text)

  const overallScore = (
    vocabularyComplexity * 0.3 +
    conceptualDepth * 0.4 +
    cognitiveLoad * 0.2 +
    questionLength * 0.1
  )

  return {
    vocabularyComplexity,
    conceptualDepth,
    cognitiveLoad,
    questionLength,
    overallScore
  }
}

export function suggestDifficulty(question: Question): DifficultyLevel {
  const metrics = analyzeDifficulty(question)
  
  if (metrics.overallScore >= 0.7) return 'hard'
  if (metrics.overallScore >= 0.4) return 'medium'
  return 'easy'
}

export function validateDifficultyAssignment(question: Question): {
  isAccurate: boolean
  suggestedDifficulty: DifficultyLevel
  confidence: number
} {
  const suggestedDifficulty = suggestDifficulty(question)
  const isAccurate = question.difficulty === suggestedDifficulty
  
  const metrics = analyzeDifficulty(question)
  const confidence = calculateConfidence(metrics, question.difficulty)

  return {
    isAccurate,
    suggestedDifficulty,
    confidence
  }
}

function analyzeVocabularyComplexity(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || []
  
  let complexityScore = 0
  let totalWords = words.length

  for (const word of words) {
    // Length-based complexity
    if (word.length > 8) complexityScore += 0.3
    else if (word.length > 6) complexityScore += 0.2
    else if (word.length > 4) complexityScore += 0.1

    // Academic/technical vocabulary
    if (isAcademicWord(word)) complexityScore += 0.4
    if (isTechnicalWord(word)) complexityScore += 0.3
  }

  return totalWords > 0 ? Math.min(1.0, complexityScore / totalWords) : 0
}

function analyzeConceptualDepth(text: string, questionType: string): number {
  let depthScore = 0

  // Bloom's taxonomy keywords
  const bloomsLevels = {
    remember: ['define', 'list', 'name', 'identify', 'recall', 'state'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'classify'],
    apply: ['use', 'demonstrate', 'solve', 'implement', 'execute'],
    analyze: ['analyze', 'compare', 'contrast', 'examine', 'break down'],
    evaluate: ['evaluate', 'judge', 'critique', 'assess', 'justify'],
    create: ['create', 'design', 'develop', 'synthesize', 'generate']
  }

  const lowerText = text.toLowerCase()

  // Check for higher-order thinking keywords
  if (bloomsLevels.create.some(word => lowerText.includes(word))) depthScore += 1.0
  else if (bloomsLevels.evaluate.some(word => lowerText.includes(word))) depthScore += 0.9
  else if (bloomsLevels.analyze.some(word => lowerText.includes(word))) depthScore += 0.8
  else if (bloomsLevels.apply.some(word => lowerText.includes(word))) depthScore += 0.6
  else if (bloomsLevels.understand.some(word => lowerText.includes(word))) depthScore += 0.4
  else if (bloomsLevels.remember.some(word => lowerText.includes(word))) depthScore += 0.2

  // Question type adjustments
  if (questionType === 'essay') depthScore += 0.3
  else if (questionType === 'short-answer') depthScore += 0.2
  else if (questionType === 'multiple-choice') depthScore += 0.1

  // Multi-step or complex reasoning indicators
  if (lowerText.includes('explain why') || lowerText.includes('how does')) depthScore += 0.2
  if (lowerText.includes('relationship') || lowerText.includes('connection')) depthScore += 0.2
  if (lowerText.includes('implication') || lowerText.includes('consequence')) depthScore += 0.3

  return Math.min(1.0, depthScore)
}

function analyzeCognitiveLoad(text: string): number {
  let loadScore = 0

  // Sentence complexity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim())
  const avgWordsPerSentence = text.split(/\s+/).length / sentences.length

  if (avgWordsPerSentence > 20) loadScore += 0.4
  else if (avgWordsPerSentence > 15) loadScore += 0.3
  else if (avgWordsPerSentence > 10) loadScore += 0.2

  // Multiple concepts or conditions
  const conceptIndicators = ['and', 'or', 'but', 'however', 'although', 'while']
  const conceptCount = conceptIndicators.reduce((count, indicator) => 
    count + (text.toLowerCase().split(indicator).length - 1), 0
  )

  loadScore += Math.min(0.4, conceptCount * 0.1)

  // Nested or conditional statements
  if (text.includes('if') && text.includes('then')) loadScore += 0.2
  if (text.includes('given that') || text.includes('assuming')) loadScore += 0.2

  return Math.min(1.0, loadScore)
}

function analyzeQuestionLength(text: string): number {
  const wordCount = text.split(/\s+/).length
  
  if (wordCount > 50) return 0.8
  if (wordCount > 30) return 0.6
  if (wordCount > 20) return 0.4
  if (wordCount > 10) return 0.2
  return 0.1
}

function isAcademicWord(word: string): boolean {
  const academicWords = new Set([
    'analyze', 'concept', 'theory', 'hypothesis', 'methodology', 'paradigm',
    'phenomenon', 'empirical', 'correlation', 'significant', 'variable',
    'framework', 'perspective', 'interpretation', 'implication', 'criterion',
    'fundamental', 'comprehensive', 'substantial', 'considerable', 'relevant',
    'specific', 'particular', 'individual', 'appropriate', 'consistent'
  ])
  
  return academicWords.has(word.toLowerCase())
}

function isTechnicalWord(word: string): boolean {
  // This would ideally be domain-specific
  const technicalWords = new Set([
    'algorithm', 'database', 'protocol', 'interface', 'architecture',
    'implementation', 'optimization', 'configuration', 'authentication',
    'encryption', 'synchronization', 'polymorphism', 'inheritance',
    'abstraction', 'encapsulation', 'recursion', 'iteration'
  ])
  
  return technicalWords.has(word.toLowerCase())
}

function calculateConfidence(metrics: DifficultyMetrics, assignedDifficulty: DifficultyLevel): number {
  const thresholds = {
    easy: { min: 0, max: 0.4 },
    medium: { min: 0.3, max: 0.7 },
    hard: { min: 0.6, max: 1.0 }
  }

  const threshold = thresholds[assignedDifficulty]
  const score = metrics.overallScore

  // Calculate how well the score fits within the expected range
  if (score >= threshold.min && score <= threshold.max) {
    // Score is within expected range
    const rangeSize = threshold.max - threshold.min
    const distanceFromCenter = Math.abs(score - (threshold.min + threshold.max) / 2)
    return 1.0 - (distanceFromCenter / (rangeSize / 2)) * 0.3
  } else {
    // Score is outside expected range
    const distanceFromRange = score < threshold.min 
      ? threshold.min - score 
      : score - threshold.max
    return Math.max(0.3, 1.0 - distanceFromRange * 2)
  }
}

export function getDifficultyDistribution(questions: Question[]): Record<DifficultyLevel, number> {
  const distribution: Record<DifficultyLevel, number> = {
    easy: 0,
    medium: 0,
    hard: 0
  }

  questions.forEach(question => {
    distribution[question.difficulty]++
  })

  return distribution
}

export function recommendDifficultyBalance(totalQuestions: number): Record<DifficultyLevel, number> {
  // Recommended distribution: 40% easy, 40% medium, 20% hard
  return {
    easy: Math.round(totalQuestions * 0.4),
    medium: Math.round(totalQuestions * 0.4),
    hard: Math.round(totalQuestions * 0.2)
  }
}

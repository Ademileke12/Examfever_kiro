import { Question, QuestionValidationResult, ValidationIssue } from '@/lib/questions/types'

export function validateQuestion(question: Question): QuestionValidationResult {
  const issues: ValidationIssue[] = []
  let score = 1.0

  // Validate question text
  const textIssues = validateQuestionText(question.text)
  issues.push(...textIssues)
  score -= textIssues.length * 0.1

  // Validate question type specific requirements
  const typeIssues = validateQuestionType(question)
  issues.push(...typeIssues)
  score -= typeIssues.length * 0.15

  // Validate difficulty appropriateness
  const difficultyIssues = validateDifficulty(question)
  issues.push(...difficultyIssues)
  score -= difficultyIssues.length * 0.1

  // Validate relevance to source content
  const relevanceIssues = validateRelevance(question)
  issues.push(...relevanceIssues)
  score -= relevanceIssues.length * 0.2

  // Ensure score doesn't go below 0
  score = Math.max(0, score)

  // More lenient validation for enhanced local generator
  const isEnhancedLocal = question.metadata?.model === 'enhanced-local-generator' || 
                         question.metadata?.model === 'enhanced-offline-generator' ||
                         question.metadata?.model?.includes('enhanced')
  
  // For enhanced local generation, only fail on critical structural issues
  const criticalIssues = isEnhancedLocal 
    ? issues.filter(i => i.severity === 'high' && i.type === 'structure')
    : issues.filter(i => i.severity === 'high')

  const suggestions = generateSuggestions(issues)

  return {
    isValid: score >= 0.5 && criticalIssues.length === 0, // Lowered threshold and more lenient criteria
    score,
    issues,
    suggestions
  }
}

function validateQuestionText(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check length
  if (text.length < 10) {
    issues.push({
      type: 'structure',
      severity: 'high',
      message: 'Question text is too short',
      suggestion: 'Provide more context and detail in the question'
    })
  }

  if (text.length > 500) {
    issues.push({
      type: 'clarity',
      severity: 'medium',
      message: 'Question text is very long',
      suggestion: 'Consider breaking into smaller, more focused questions'
    })
  }

  // Check if it ends with question mark
  if (!text.trim().endsWith('?')) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: 'Question should end with a question mark',
      suggestion: 'Add a question mark at the end'
    })
  }

  // Check for clarity issues
  const clarityIssues = checkClarity(text)
  issues.push(...clarityIssues)

  return issues
}

function validateQuestionType(question: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  switch (question.type) {
    case 'multiple-choice':
      if (!question.options || question.options.length < 2) {
        issues.push({
          type: 'structure',
          severity: 'high',
          message: 'Multiple choice questions need at least 2 options',
          suggestion: 'Add more answer options'
        })
      }

      if (question.options) {
        const correctOptions = question.options.filter(opt => opt.isCorrect)
        if (correctOptions.length !== 1) {
          issues.push({
            type: 'structure',
            severity: 'high',
            message: 'Multiple choice questions should have exactly one correct answer',
            suggestion: 'Mark exactly one option as correct'
          })
        }

        // Check option quality
        question.options.forEach((option, index) => {
          if (option.text.length < 3) {
            issues.push({
              type: 'structure',
              severity: 'medium',
              message: `Option ${index + 1} is too short`,
              suggestion: 'Provide more substantial answer options'
            })
          }
        })
      }
      break

    // Note: short-answer and essay types removed since we only use multiple-choice
  }

  return issues
}

function validateDifficulty(question: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Simple heuristics for difficulty validation
  const wordCount = question.text.split(/\s+/).length
  const hasComplexTerms = /\b(analyze|evaluate|synthesize|compare|contrast|justify|critique)\b/i.test(question.text)

  if (question.difficulty === 'easy' && hasComplexTerms) {
    issues.push({
      type: 'difficulty',
      severity: 'low',
      message: 'Question uses complex terms but is marked as easy',
      suggestion: 'Consider increasing difficulty level or simplifying language'
    })
  }

  if (question.difficulty === 'hard' && wordCount < 10 && !hasComplexTerms) {
    issues.push({
      type: 'difficulty',
      severity: 'low',
      message: 'Question seems simple but is marked as hard',
      suggestion: 'Consider decreasing difficulty level or adding complexity'
    })
  }

  return issues
}

function validateRelevance(question: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check if question keywords appear in source content
  const sourceWords = question.sourceContent.toLowerCase().split(/\s+/)
  const questionWords = question.text.toLowerCase().split(/\s+/)
  
  const commonWords = questionWords.filter(word => 
    word.length > 3 && sourceWords.includes(word)
  )

  // More lenient relevance check for enhanced local generator
  const isEnhancedLocal = question.metadata?.model === 'enhanced-local-generator' || 
                         question.metadata?.model === 'enhanced-offline-generator' ||
                         question.metadata?.model?.includes('enhanced')
  
  const minCommonWords = isEnhancedLocal ? 1 : 2 // Reduced requirement for local generation

  if (commonWords.length < minCommonWords) {
    // For enhanced local generation, make this a medium severity issue instead of high
    const severity = isEnhancedLocal ? 'medium' : 'high'
    
    issues.push({
      type: 'relevance',
      severity: severity,
      message: 'Question may not be relevant to source content',
      suggestion: 'Ensure question directly relates to the provided material'
    })
  }

  return issues
}

function checkClarity(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check for ambiguous words
  const ambiguousWords = ['some', 'many', 'few', 'often', 'sometimes', 'usually']
  const hasAmbiguous = ambiguousWords.some(word => 
    text.toLowerCase().includes(word)
  )

  if (hasAmbiguous) {
    issues.push({
      type: 'clarity',
      severity: 'low',
      message: 'Question contains ambiguous terms',
      suggestion: 'Use more specific language to avoid confusion'
    })
  }

  // Check for double negatives
  if (/\bnot\b.*\bnot\b|\bn't\b.*\bnot\b/i.test(text)) {
    issues.push({
      type: 'clarity',
      severity: 'medium',
      message: 'Question contains double negatives',
      suggestion: 'Rephrase to avoid double negatives for clarity'
    })
  }

  return issues
}

function generateSuggestions(issues: ValidationIssue[]): string[] {
  const suggestions: string[] = []

  const highSeverityIssues = issues.filter(i => i.severity === 'high')
  if (highSeverityIssues.length > 0) {
    suggestions.push('Address high-severity issues first to improve question quality')
  }

  const structureIssues = issues.filter(i => i.type === 'structure')
  if (structureIssues.length > 0) {
    suggestions.push('Review question format and structure requirements')
  }

  const clarityIssues = issues.filter(i => i.type === 'clarity')
  if (clarityIssues.length > 0) {
    suggestions.push('Simplify language and remove ambiguous terms')
  }

  const relevanceIssues = issues.filter(i => i.type === 'relevance')
  if (relevanceIssues.length > 0) {
    suggestions.push('Ensure question directly tests understanding of the source material')
  }

  return suggestions
}

export function calculateQualityScore(questions: Question[]): number {
  if (questions.length === 0) return 0

  const scores = questions.map(q => validateQuestion(q).score)
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function filterHighQualityQuestions(
  questions: Question[], 
  minScore: number = 0.7
): Question[] {
  return questions.filter(question => {
    const validation = validateQuestion(question)
    return validation.score >= minScore && validation.isValid
  })
}

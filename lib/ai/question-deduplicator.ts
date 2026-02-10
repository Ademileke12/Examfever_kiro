import { Question } from '@/lib/questions/types'

/**
 * Advanced question deduplication system
 * Prevents duplicate questions using multiple similarity checks
 */

export interface DeduplicationResult {
  uniqueQuestions: Question[]
  duplicatesRemoved: number
  duplicateGroups: Array<{
    representative: Question
    duplicates: Question[]
    similarityScore: number
  }>
}

export class QuestionDeduplicator {
  private readonly SIMILARITY_THRESHOLD = 0.65 // Lowered from 0.8 to 0.65 for stricter deduplication

  /**
   * Remove duplicate questions using multiple similarity algorithms
   * Enhanced with more aggressive duplicate detection
   */
  deduplicateQuestions(questions: Question[]): DeduplicationResult {
    console.log(`🔍 Starting enhanced deduplication of ${questions.length} questions...`)
    
    // Check if we have mock questions - use more lenient threshold
    const hasMockQuestions = questions.some(q => 
      q.metadata.model.includes('offline') || 
      q.metadata.model.includes('mock') ||
      q.metadata.model.includes('enhanced-diverse-offline-generator') ||
      q.metadata.model.includes('enhanced-local-generator')
    )
    
    const threshold = hasMockQuestions ? 0.98 : this.SIMILARITY_THRESHOLD // Very lenient for local questions (98% similarity required for duplicate)
    console.log(`Using similarity threshold: ${(threshold * 100).toFixed(1)}% (local questions: ${hasMockQuestions})`)
    
    const uniqueQuestions: Question[] = []
    const duplicateGroups: Array<{
      representative: Question
      duplicates: Question[]
      similarityScore: number
    }> = []
    
    for (const question of questions) {
      let isDuplicate = false
      let bestMatch: Question | null = null
      let highestSimilarity = 0
      
      // Check against all existing unique questions
      for (const existingQuestion of uniqueQuestions) {
        const similarity = this.calculateQuestionSimilarity(question, existingQuestion)
        
        // Also check for semantic duplicates (same meaning, different words)
        const semanticSimilarity = this.calculateSemanticSimilarity(question, existingQuestion)
        const maxSimilarity = Math.max(similarity, semanticSimilarity)
        
        if (maxSimilarity > threshold) {
          isDuplicate = true
          if (maxSimilarity > highestSimilarity) {
            highestSimilarity = maxSimilarity
            bestMatch = existingQuestion
          }
          console.log(`🚨 DUPLICATE DETECTED: ${(maxSimilarity * 100).toFixed(1)}% similarity`)
          console.log(`  Original: "${existingQuestion.text.substring(0, 60)}..."`)
          console.log(`  Duplicate: "${question.text.substring(0, 60)}..."`)
        }
      }
      
      if (isDuplicate && bestMatch) {
        // Find or create duplicate group
        let group = duplicateGroups.find(g => g.representative.id === bestMatch!.id)
        if (!group) {
          group = {
            representative: bestMatch,
            duplicates: [],
            similarityScore: highestSimilarity
          }
          duplicateGroups.push(group)
        }
        group.duplicates.push(question)
        group.similarityScore = Math.max(group.similarityScore, highestSimilarity)
      } else {
        uniqueQuestions.push(question)
        console.log(`✅ UNIQUE: "${question.text.substring(0, 60)}..." (${question.type}, ${question.difficulty})`)
      }
    }
    
    const duplicatesRemoved = questions.length - uniqueQuestions.length
    
    console.log(`🎯 Deduplication complete: ${uniqueQuestions.length} unique questions, ${duplicatesRemoved} duplicates removed`)
    
    return {
      uniqueQuestions,
      duplicatesRemoved,
      duplicateGroups
    }
  }

  /**
   * Calculate semantic similarity between questions (same meaning, different words)
   */
  private calculateSemanticSimilarity(q1: Question, q2: Question): number {
    // Extract key concepts from questions
    const concepts1 = this.extractKeyConcepts(q1.text)
    const concepts2 = this.extractKeyConcepts(q2.text)
    
    // Check for concept overlap
    const conceptOverlap = this.calculateConceptOverlap(concepts1, concepts2)
    
    // Check for similar question intent
    const intentSimilarity = this.calculateIntentSimilarity(q1.text, q2.text)
    
    // Combine semantic indicators
    return Math.max(conceptOverlap, intentSimilarity)
  }

  /**
   * Extract key concepts from question text
   */
  private extractKeyConcepts(text: string): string[] {
    // Remove common question words and extract meaningful terms
    const questionWords = new Set(['what', 'how', 'why', 'when', 'where', 'which', 'who', 'does', 'is', 'are', 'can', 'will', 'would', 'should'])
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !questionWords.has(word))
      .slice(0, 10) // Top 10 meaningful words
    
    return Array.from(new Set(words))
  }

  /**
   * Calculate overlap between key concepts
   */
  private calculateConceptOverlap(concepts1: string[], concepts2: string[]): number {
    if (concepts1.length === 0 || concepts2.length === 0) return 0
    
    const set1 = new Set(concepts1)
    const set2 = new Set(concepts2)
    
    const intersection = new Set(Array.from(set1).filter(c => set2.has(c)))
    const union = new Set([...Array.from(set1), ...Array.from(set2)])
    
    return intersection.size / union.size
  }

  /**
   * Calculate similarity in question intent/structure
   */
  private calculateIntentSimilarity(text1: string, text2: string): number {
    // Extract question patterns
    const pattern1 = this.extractQuestionPattern(text1)
    const pattern2 = this.extractQuestionPattern(text2)
    
    if (pattern1 === pattern2) {
      // Same question pattern - check if they're asking about similar things
      const subject1 = this.extractQuestionSubject(text1)
      const subject2 = this.extractQuestionSubject(text2)
      
      return this.calculateTextSimilarity(subject1, subject2)
    }
    
    return 0
  }

  /**
   * Extract question pattern (What is, How does, Why is, etc.)
   */
  private extractQuestionPattern(text: string): string {
    const patterns = [
      /^what\s+(is|are|does|do|can|will)/i,
      /^how\s+(does|do|can|will|is|are)/i,
      /^why\s+(is|are|does|do|can|will)/i,
      /^when\s+(does|do|is|are|can|will)/i,
      /^where\s+(does|do|is|are|can|will)/i,
      /^which\s+(of|is|are|does|do)/i,
      /^who\s+(is|are|does|do|can|will)/i
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[0]) {
        return match[0].toLowerCase()
      }
    }
    
    return 'other'
  }

  /**
   * Extract the main subject of the question
   */
  private extractQuestionSubject(text: string): string {
    // Remove question words and extract the main subject
    const cleaned = text.replace(/^(what|how|why|when|where|which|who)\s+(is|are|does|do|can|will|of)\s+/i, '')
    const parts = cleaned.split(/[.?!]/)
    return parts[0]?.trim() || cleaned.trim()
  }

  /**
   * Calculate similarity between two questions using multiple metrics
   * Made public for external diversity validation
   */
  calculateQuestionSimilarity(q1: Question, q2: Question): number {
    // Different question types are never duplicates
    if (q1.type !== q2.type) {
      return 0
    }

    // Calculate text similarity
    const textSimilarity = this.calculateTextSimilarity(q1.text, q2.text)
    
    // For multiple choice, also compare options
    let optionsSimilarity = 0
    if (q1.type === 'multiple-choice' && q1.options && q2.options) {
      optionsSimilarity = this.calculateOptionsSimilarity(q1.options, q2.options)
    }
    
    // For multiple-choice questions, we already compared options above
    // No need for additional answer comparison since we only use multiple-choice
    let answerSimilarity = 0
    
    // Calculate topic and keyword similarity
    const topicSimilarity = this.calculateTopicSimilarity(q1, q2)
    const keywordSimilarity = this.calculateKeywordSimilarity(q1.keywords || [], q2.keywords || [])
    
    // Weighted average of all similarity metrics
    const weights = {
      text: 0.5,
      options: 0.2,
      answer: 0.2,
      topic: 0.05,
      keywords: 0.05
    }
    
    return (
      textSimilarity * weights.text +
      optionsSimilarity * weights.options +
      answerSimilarity * weights.answer +
      topicSimilarity * weights.topic +
      keywordSimilarity * weights.keywords
    )
  }

  /**
   * Calculate text similarity using multiple algorithms
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0
    
    // Normalize texts
    const norm1 = this.normalizeText(text1)
    const norm2 = this.normalizeText(text2)
    
    // Exact match
    if (norm1 === norm2) return 1.0
    
    // Jaccard similarity (word-based)
    const jaccardSim = this.calculateJaccardSimilarity(norm1, norm2)
    
    // Levenshtein distance similarity
    const editSim = this.calculateEditDistanceSimilarity(norm1, norm2)
    
    // Cosine similarity (character n-grams)
    const cosineSim = this.calculateCosineSimilarity(norm1, norm2)
    
    // Return weighted average
    return (jaccardSim * 0.4 + editSim * 0.3 + cosineSim * 0.3)
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Calculate Jaccard similarity between two texts
   */
  private calculateJaccardSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 2))
    const words2 = new Set(text2.split(' ').filter(w => w.length > 2))
    
    const words1Array = Array.from(words1)
    const words2Array = Array.from(words2)
    const intersection = new Set(words1Array.filter(w => words2.has(w)))
    const union = new Set([...words1Array, ...words2Array])
    
    return union.size === 0 ? 0 : intersection.size / union.size
  }

  /**
   * Calculate edit distance similarity
   */
  private calculateEditDistanceSimilarity(text1: string, text2: string): number {
    const distance = this.levenshteinDistance(text1, text2)
    const maxLength = Math.max(text1.length, text2.length)
    
    return maxLength === 0 ? 1 : 1 - (distance / maxLength)
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0]![i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j]![0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length]![str1.length]!
  }

  /**
   * Calculate cosine similarity using character n-grams
   */
  private calculateCosineSimilarity(text1: string, text2: string): number {
    const ngrams1 = this.generateNGrams(text1, 3)
    const ngrams2 = this.generateNGrams(text2, 3)
    
    const vector1 = this.createVector(ngrams1)
    const vector2 = this.createVector(ngrams2)
    
    return this.cosineSimilarity(vector1, vector2)
  }

  /**
   * Generate character n-grams
   */
  private generateNGrams(text: string, n: number): string[] {
    const ngrams: string[] = []
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n))
    }
    return ngrams
  }

  /**
   * Create frequency vector from n-grams
   */
  private createVector(ngrams: string[]): Map<string, number> {
    const vector = new Map<string, number>()
    for (const ngram of ngrams) {
      vector.set(ngram, (vector.get(ngram) || 0) + 1)
    }
    return vector
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number {
    const keys1 = Array.from(vector1.keys())
    const keys2 = Array.from(vector2.keys())
    const keys = new Set([...keys1, ...keys2])
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (const key of Array.from(keys)) {
      const val1 = vector1.get(key) || 0
      const val2 = vector2.get(key) || 0
      
      dotProduct += val1 * val2
      norm1 += val1 * val1
      norm2 += val2 * val2
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
    return denominator === 0 ? 0 : dotProduct / denominator
  }

  /**
   * Calculate similarity between multiple choice options
   */
  private calculateOptionsSimilarity(options1: any[], options2: any[]): number {
    if (options1.length !== options2.length) return 0
    
    let totalSimilarity = 0
    const used = new Set<number>()
    
    // Find best matching for each option
    for (const opt1 of options1) {
      let bestSimilarity = 0
      let bestIndex = -1
      
      for (let i = 0; i < options2.length; i++) {
        if (used.has(i)) continue
        
        const similarity = this.calculateTextSimilarity(opt1.text, options2[i].text)
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          bestIndex = i
        }
      }
      
      if (bestIndex >= 0) {
        used.add(bestIndex)
        totalSimilarity += bestSimilarity
      }
    }
    
    return totalSimilarity / options1.length
  }

  /**
   * Calculate topic similarity
   */
  private calculateTopicSimilarity(q1: Question, q2: Question): number {
    if (!q1.topic || !q2.topic) return 0
    return this.calculateTextSimilarity(q1.topic, q2.topic)
  }

  /**
   * Calculate keyword similarity
   */
  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 1
    if (keywords1.length === 0 || keywords2.length === 0) return 0
    
    const set1 = new Set(keywords1.map(k => k.toLowerCase()))
    const set2 = new Set(keywords2.map(k => k.toLowerCase()))
    
    const set1Array = Array.from(set1)
    const set2Array = Array.from(set2)
    const intersection = new Set(set1Array.filter(k => set2.has(k)))
    const union = new Set([...set1Array, ...set2Array])
    
    return intersection.size / union.size
  }

  /**
   * Generate unique content hash for a question
   */
  generateContentHash(question: Question): string {
    const content = [
      question.text,
      question.type,
      question.difficulty,
      question.topic || '',
      ...(question.keywords || []),
      ...(question.options?.map(o => o.text) || []),
      question.correctAnswer || ''
    ].join('|').toLowerCase()
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * Check if questions are semantically similar (for final validation)
   */
  areQuestionsSimilar(q1: Question, q2: Question): boolean {
    return this.calculateQuestionSimilarity(q1, q2) > this.SIMILARITY_THRESHOLD
  }
}

export const questionDeduplicator = new QuestionDeduplicator()
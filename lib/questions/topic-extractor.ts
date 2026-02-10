import { TopicExtraction, DifficultyLevel } from './types'

export function extractTopics(content: string): TopicExtraction {
  const topics = extractMainTopics(content)
  const keywords = extractKeywords(content)
  const concepts = extractConcepts(content)
  const difficulty = estimateContentDifficulty(content)
  const contentType = classifyContentType(content)

  return {
    topics,
    keywords,
    concepts,
    difficulty,
    contentType
  }
}

function extractMainTopics(content: string): string[] {
  const topics: string[] = []
  
  // Look for chapter/section headings
  const headings = content.match(/^[A-Z][^.!?]*$/gm) || []
  topics.push(...headings.slice(0, 5))

  // Look for repeated important terms
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
  const wordFreq = new Map<string, number>()
  
  words.forEach(word => {
    if (!isStopWord(word) && isLikelyTopic(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }
  })

  // Get most frequent topic-like words
  const frequentWords = Array.from(wordFreq.entries())
    .filter(([_, freq]) => freq >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => capitalizeFirst(word))

  topics.push(...frequentWords)

  // Remove duplicates and return top topics
  return Array.from(new Set(topics)).slice(0, 8)
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  const wordFreq = new Map<string, number>()
  
  words.forEach(word => {
    if (!isStopWord(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }
  })

  // Get keywords based on frequency and importance
  return Array.from(wordFreq.entries())
    .filter(([word, freq]) => freq >= 2 && isImportantWord(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word)
}

function extractConcepts(content: string): string[] {
  const concepts: string[] = []
  
  // Look for definition patterns
  const definitionPatterns = [
    /(\w+)\s+is\s+defined\s+as/gi,
    /(\w+)\s+refers\s+to/gi,
    /(\w+)\s+means/gi,
    /the\s+concept\s+of\s+(\w+)/gi,
    /(\w+)\s+can\s+be\s+understood\s+as/gi
  ]

  definitionPatterns.forEach(pattern => {
    const matches = Array.from(content.matchAll(pattern))
    for (const match of matches) {
      if (match[1] && match[1].length > 3) {
        concepts.push(capitalizeFirst(match[1]))
      }
    }
  })

  // Look for academic/technical terms
  const academicTerms = content.match(/\b[a-z]+tion\b|\b[a-z]+ism\b|\b[a-z]+ology\b/gi) || []
  concepts.push(...academicTerms.map(term => capitalizeFirst(term)))

  // Remove duplicates and return top concepts
  return Array.from(new Set(concepts)).slice(0, 10)
}

function estimateContentDifficulty(content: string): DifficultyLevel {
  let difficultyScore = 0
  
  // Vocabulary complexity
  const words = content.toLowerCase().match(/\b[a-z]+\b/g) || []
  const longWords = words.filter(word => word.length > 7).length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  
  difficultyScore += (longWords / words.length) * 0.3
  difficultyScore += Math.min(0.2, (avgWordLength - 4) * 0.05)

  // Sentence complexity
  const sentences = content.split(/[.!?]+/).filter(s => s.trim())
  const avgSentenceLength = words.length / sentences.length
  
  if (avgSentenceLength > 20) difficultyScore += 0.3
  else if (avgSentenceLength > 15) difficultyScore += 0.2
  else if (avgSentenceLength > 10) difficultyScore += 0.1

  // Technical/academic indicators
  const technicalIndicators = [
    'hypothesis', 'methodology', 'analysis', 'correlation', 'significant',
    'empirical', 'theoretical', 'paradigm', 'framework', 'phenomenon'
  ]
  
  const technicalCount = technicalIndicators.reduce((count, term) => 
    count + (content.toLowerCase().includes(term) ? 1 : 0), 0
  )
  
  difficultyScore += Math.min(0.3, technicalCount * 0.05)

  // Mathematical/scientific notation
  if (/\b\d+\.\d+\b|\b[A-Z]{2,}\b|\b[a-z]+\d+\b/.test(content)) {
    difficultyScore += 0.1
  }

  if (difficultyScore >= 0.7) return 'hard'
  if (difficultyScore >= 0.4) return 'medium'
  return 'easy'
}

function classifyContentType(content: string): 'academic' | 'technical' | 'general' {
  const academicIndicators = [
    'research', 'study', 'theory', 'hypothesis', 'methodology', 'analysis',
    'literature', 'findings', 'conclusion', 'evidence', 'data', 'results'
  ]
  
  const technicalIndicators = [
    'system', 'process', 'method', 'procedure', 'implementation', 'algorithm',
    'protocol', 'specification', 'configuration', 'architecture', 'interface'
  ]

  const lowerContent = content.toLowerCase()
  
  const academicScore = academicIndicators.reduce((score, term) => 
    score + (lowerContent.includes(term) ? 1 : 0), 0
  )
  
  const technicalScore = technicalIndicators.reduce((score, term) => 
    score + (lowerContent.includes(term) ? 1 : 0), 0
  )

  if (academicScore >= 3 && academicScore > technicalScore) return 'academic'
  if (technicalScore >= 3) return 'technical'
  return 'general'
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'can',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'have', 'has', 'had', 'do', 'does', 'did', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'get', 'got', 'getting', 'make', 'made', 'making'
  ])
  return stopWords.has(word.toLowerCase())
}

function isLikelyTopic(word: string): boolean {
  // Words that are likely to be topics/subjects
  return word.length >= 4 && 
         !word.match(/^\d+$/) && // Not just numbers
         !word.match(/^[a-z]+ing$/) && // Not gerunds
         !word.match(/^[a-z]+ed$/) // Not past tense verbs
}

function isImportantWord(word: string): boolean {
  // Filter out common but unimportant words
  const unimportantWords = new Set([
    'said', 'says', 'way', 'ways', 'time', 'times', 'year', 'years',
    'day', 'days', 'thing', 'things', 'people', 'person', 'place',
    'places', 'work', 'works', 'part', 'parts', 'number', 'numbers'
  ])
  
  return !unimportantWords.has(word) && word.length >= 4
}

function capitalizeFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function getTopicSimilarity(topics1: string[], topics2: string[]): number {
  const set1 = new Set(topics1.map(t => t.toLowerCase()))
  const set2 = new Set(topics2.map(t => t.toLowerCase()))
  
  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
  const union = new Set([...Array.from(set1), ...Array.from(set2)])
  
  return union.size > 0 ? intersection.size / union.size : 0
}

export function suggestQuestionTypes(extraction: TopicExtraction): string[] {
  const suggestions: string[] = []
  
  // Based on content type
  if (extraction.contentType === 'academic') {
    suggestions.push('essay', 'short-answer', 'multiple-choice')
  } else if (extraction.contentType === 'technical') {
    suggestions.push('short-answer', 'multiple-choice', 'true-false')
  } else {
    suggestions.push('multiple-choice', 'true-false', 'short-answer')
  }

  // Based on difficulty
  if (extraction.difficulty === 'hard') {
    suggestions.unshift('essay') // Prioritize essay for hard content
  } else if (extraction.difficulty === 'easy') {
    suggestions.unshift('true-false', 'multiple-choice') // Prioritize simpler formats
  }

  return Array.from(new Set(suggestions)) // Remove duplicates
}

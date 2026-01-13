import { GENERATION_CONFIG } from './config'

export interface ContentChunk {
  id: string
  text: string
  startIndex: number
  endIndex: number
  wordCount: number
  sentences: number
}

export function chunkContent(text: string): ContentChunk[] {
  const { chunkSize, chunkOverlap } = GENERATION_CONFIG
  
  if (text.length <= chunkSize) {
    return [{
      id: 'chunk-0',
      text: text.trim(),
      startIndex: 0,
      endIndex: text.length,
      wordCount: countWords(text),
      sentences: countSentences(text)
    }]
  }

  const chunks: ContentChunk[] = []
  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + chunkSize, text.length)
    
    // Try to end at a sentence boundary
    if (endIndex < text.length) {
      const sentenceEnd = findSentenceEnd(text, endIndex)
      if (sentenceEnd > startIndex + chunkSize * 0.7) {
        endIndex = sentenceEnd
      }
    }

    const chunkText = text.slice(startIndex, endIndex).trim()
    
    if (chunkText.length > 0) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        text: chunkText,
        startIndex,
        endIndex,
        wordCount: countWords(chunkText),
        sentences: countSentences(chunkText)
      })
    }

    // Move start index with overlap
    startIndex = Math.max(endIndex - chunkOverlap, startIndex + 1)
    chunkIndex++
  }

  return chunks
}

export function preprocessContent(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Clean up common PDF artifacts
    .replace(/\f/g, '\n') // Form feed to newline
    .replace(/[\u00A0\u2000-\u200B\u2028-\u2029]/g, ' ') // Various unicode spaces
    // Remove page numbers and headers/footers (simple heuristic)
    .replace(/^\d+\s*$/gm, '') // Lines with just numbers
    .replace(/^Page \d+.*$/gm, '') // Page headers
    .trim()
}

export function extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
  // Simple keyword extraction - in production, consider using NLP libraries
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)

  // Count word frequency
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  // Get most frequent words
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([word]) => word)
}

export function estimateReadingLevel(text: string): 'easy' | 'medium' | 'hard' {
  const sentences = countSentences(text)
  const words = countWords(text)
  const syllables = estimateSyllables(text)

  if (sentences === 0 || words === 0) return 'easy'

  // Flesch Reading Ease Score
  const avgSentenceLength = words / sentences
  const avgSyllablesPerWord = syllables / words
  
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)

  if (fleschScore >= 60) return 'easy'
  if (fleschScore >= 30) return 'medium'
  return 'hard'
}

function findSentenceEnd(text: string, startIndex: number): number {
  const sentenceEnders = /[.!?]/g
  sentenceEnders.lastIndex = startIndex

  const match = sentenceEnders.exec(text)
  if (match) {
    return match.index + 1
  }

  // Fallback to paragraph break
  const paragraphEnd = text.indexOf('\n\n', startIndex)
  return paragraphEnd > 0 ? paragraphEnd : startIndex
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function countSentences(text: string): number {
  return (text.match(/[.!?]+/g) || []).length
}

function estimateSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || []
  
  return words.reduce((total, word) => {
    // Simple syllable estimation
    let syllables = word.match(/[aeiouy]+/g)?.length || 1
    
    // Adjust for common patterns
    if (word.endsWith('e')) syllables--
    if (word.endsWith('le') && word.length > 2) syllables++
    if (syllables === 0) syllables = 1
    
    return total + syllables
  }, 0)
}

export function validateContentLength(text: string): boolean {
  return text.length >= 100 && text.length <= GENERATION_CONFIG.maxContentLength
}

export function getContentStats(text: string) {
  return {
    characters: text.length,
    words: countWords(text),
    sentences: countSentences(text),
    paragraphs: text.split(/\n\s*\n/).length,
    readingLevel: estimateReadingLevel(text),
    keyPhrases: extractKeyPhrases(text, 5)
  }
}

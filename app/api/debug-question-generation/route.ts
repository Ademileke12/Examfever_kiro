import { NextRequest, NextResponse } from 'next/server'
import { questionGenerator } from '@/lib/ai/question-generator'
import { questionDeduplicator } from '@/lib/ai/question-deduplicator'
import { QuestionGenerationRequest } from '@/lib/questions/types'

export async function POST(request: NextRequest) {
  try {
    const { content, maxQuestions = 15 } = await request.json()

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    console.log('🔍 DEBUGGING QUESTION GENERATION')
    console.log(`Content length: ${content.length} characters`)
    console.log(`Requested questions: ${maxQuestions}`)

    // Create generation request - ONLY multiple-choice questions
    const generationRequest: QuestionGenerationRequest = {
      content,
      questionTypes: ['multiple-choice'], // Only generate multiple-choice questions
      difficulty: ['easy', 'medium', 'hard'],
      maxQuestions,
      userId: 'debug-user',
      fileId: 'debug-file'
    }

    // Generate questions with detailed logging
    console.log('📝 Starting question generation...')
    const result = await questionGenerator.generateQuestions(generationRequest)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        debug: {
          contentLength: content.length,
          requestedQuestions: maxQuestions
        }
      })
    }

    // Analyze the generated questions for duplicates
    console.log('🔍 Analyzing generated questions for duplicates...')
    const questions = result.questions
    const duplicateAnalysis = []

    // Check each question against every other question
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const q1 = questions[i]
        const q2 = questions[j]
        
        if (q1 && q2) {
          const similarity = questionDeduplicator.calculateQuestionSimilarity(q1, q2)
          
          if (similarity > 0.4) { // Log similarities above 40%
            duplicateAnalysis.push({
              question1Index: i,
              question2Index: j,
              similarity: Math.round(similarity * 100),
              question1Text: q1.text.substring(0, 100) + '...',
              question2Text: q2.text.substring(0, 100) + '...',
              question1Type: q1.type,
              question2Type: q2.type,
              question1Difficulty: q1.difficulty,
              question2Difficulty: q2.difficulty
            })
          }
        }
      }
    }

    // Group questions by similarity patterns
    const textPatterns = new Map<string, number[]>()
    questions.forEach((q, index) => {
      if (q) {
        // Extract key words from question text
        const keyWords = q.text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5) // First 5 significant words
          .sort()
          .join(' ')
        
        if (!textPatterns.has(keyWords)) {
          textPatterns.set(keyWords, [])
        }
        textPatterns.get(keyWords)!.push(index)
      }
    })

    const patternAnalysis = Array.from(textPatterns.entries())
      .filter(([_, indices]) => indices.length > 1)
      .map(([pattern, indices]) => ({
        pattern,
        questionCount: indices.length,
        questionIndices: indices,
        questions: indices.map(i => ({
          index: i,
          text: questions[i]?.text.substring(0, 100) + '...',
          type: questions[i]?.type,
          difficulty: questions[i]?.difficulty
        }))
      }))

    // Analyze question stems (beginnings)
    const stemAnalysis = new Map<string, number[]>()
    questions.forEach((q, index) => {
      if (q) {
        const stem = q.text.substring(0, 30).toLowerCase().trim()
        if (!stemAnalysis.has(stem)) {
          stemAnalysis.set(stem, [])
        }
        stemAnalysis.get(stem)!.push(index)
      }
    })

    const stemDuplicates = Array.from(stemAnalysis.entries())
      .filter(([_, indices]) => indices.length > 1)
      .map(([stem, indices]) => ({
        stem,
        count: indices.length,
        questions: indices.map(i => questions[i]?.text.substring(0, 80) + '...')
      }))

    return NextResponse.json({
      success: true,
      debug: {
        totalGenerated: questions.length,
        requestedQuestions: maxQuestions,
        contentLength: content.length,
        metadata: result.metadata,
        duplicateAnalysis: {
          totalComparisons: duplicateAnalysis.length,
          highSimilarityPairs: duplicateAnalysis.filter(d => d.similarity > 65),
          mediumSimilarityPairs: duplicateAnalysis.filter(d => d.similarity > 40 && d.similarity <= 65),
          allSimilarities: duplicateAnalysis
        },
        patternAnalysis: {
          totalPatterns: patternAnalysis.length,
          duplicatePatterns: patternAnalysis
        },
        stemAnalysis: {
          totalStems: stemDuplicates.length,
          duplicateStems: stemDuplicates
        },
        questionSample: questions.slice(0, 5).map(q => ({
          type: q?.type,
          difficulty: q?.difficulty,
          text: q?.text,
          topic: q?.topic,
          keywords: q?.keywords
        }))
      },
      questions: questions.map(q => ({
        id: q?.id,
        type: q?.type,
        difficulty: q?.difficulty,
        text: q?.text,
        topic: q?.topic,
        keywords: q?.keywords
      }))
    })

  } catch (error) {
    console.error('Debug question generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Debug failed',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
'use client'

import { useState } from 'react'

export default function DebugQuestionsPage() {
  const [content, setContent] = useState('')
  const [maxQuestions, setMaxQuestions] = useState(15)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testSampleContent = `
React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta and the open-source community. React allows developers to create reusable UI components and manage application state efficiently.

Key features of React include:

1. Component-Based Architecture: React applications are built using components, which are reusable pieces of code that return JSX (JavaScript XML) to describe what should appear on the screen.

2. Virtual DOM: React uses a virtual representation of the DOM in memory. When state changes occur, React compares the virtual DOM with the real DOM and updates only the parts that have changed, making applications faster.

3. JSX Syntax: JSX is a syntax extension for JavaScript that allows you to write HTML-like code within JavaScript. It makes React components more readable and easier to write.

4. State Management: React provides built-in state management through the useState hook for functional components and setState for class components. This allows components to manage and update their own data.

5. Props: Props (properties) are a way to pass data from parent components to child components. They are read-only and help make components reusable.

6. Lifecycle Methods: React components have lifecycle methods that allow developers to hook into different phases of a component's life, such as mounting, updating, and unmounting.

7. Hooks: Introduced in React 16.8, hooks allow functional components to use state and other React features without writing class components. Common hooks include useState, useEffect, and useContext.

React has become one of the most popular frontend frameworks due to its flexibility, performance, and strong ecosystem. It's used by many major companies including Netflix, Airbnb, Instagram, and WhatsApp.
  `.trim()

  const handleTest = async () => {
    if (!content.trim()) {
      alert('Please enter some content to test')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/debug-question-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          maxQuestions
        })
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Debug test failed:', error)
      setResults({
        success: false,
        error: 'Failed to test question generation'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSampleContent = () => {
    setContent(testSampleContent)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        🔍 Question Generation Debugger
      </h1>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Test Content:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to generate questions from..."
            style={{
              width: '100%',
              height: '200px',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Max Questions:
          </label>
          <input
            type="number"
            value={maxQuestions}
            onChange={(e) => setMaxQuestions(parseInt(e.target.value) || 15)}
            min="1"
            max="30"
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              width: '100px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={loadSampleContent}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Load Sample Content
          </button>
          
          <button
            onClick={handleTest}
            disabled={loading || !content.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Testing...' : 'Test Question Generation'}
          </button>
        </div>
      </div>

      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Debug Results
          </h2>

          {!results.success ? (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626'
            }}>
              <strong>Error:</strong> {results.error}
              {results.stack && (
                <pre style={{ marginTop: '1rem', fontSize: '0.75rem', overflow: 'auto' }}>
                  {results.stack}
                </pre>
              )}
            </div>
          ) : (
            <div>
              {/* Summary */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 Summary</h3>
                <p><strong>Generated:</strong> {results.debug.totalGenerated} questions</p>
                <p><strong>Requested:</strong> {results.debug.requestedQuestions} questions</p>
                <p><strong>Content Length:</strong> {results.debug.contentLength} characters</p>
                <p><strong>Processing Time:</strong> {results.debug.metadata?.processingTime}ms</p>
                <p><strong>Model Used:</strong> {results.debug.metadata?.model}</p>
              </div>

              {/* Duplicate Analysis */}
              {results.debug.duplicateAnalysis.totalComparisons > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: results.debug.duplicateAnalysis.highSimilarityPairs.length > 0 ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${results.debug.duplicateAnalysis.highSimilarityPairs.length > 0 ? '#fecaca' : '#bbf7d0'}`,
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    🔍 Duplicate Analysis
                  </h3>
                  <p><strong>High Similarity Pairs (&gt;65%):</strong> {results.debug.duplicateAnalysis.highSimilarityPairs.length}</p>
                  <p><strong>Medium Similarity Pairs (40-65%):</strong> {results.debug.duplicateAnalysis.mediumSimilarityPairs.length}</p>
                  
                  {results.debug.duplicateAnalysis.highSimilarityPairs.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>High Similarity Pairs:</h4>
                      {results.debug.duplicateAnalysis.highSimilarityPairs.map((pair: any, index: number) => (
                        <div key={index} style={{
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.5)',
                          borderRadius: '0.25rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          <p><strong>Similarity: {pair.similarity}%</strong></p>
                          <p><strong>Q{pair.question1Index + 1}:</strong> {pair.question1Text}</p>
                          <p><strong>Q{pair.question2Index + 1}:</strong> {pair.question2Text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pattern Analysis */}
              {results.debug.patternAnalysis.duplicatePatterns.length > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    🔄 Pattern Analysis
                  </h3>
                  <p><strong>Duplicate Patterns Found:</strong> {results.debug.patternAnalysis.duplicatePatterns.length}</p>
                  
                  {results.debug.patternAnalysis.duplicatePatterns.map((pattern: any, index: number) => (
                    <div key={index} style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      borderRadius: '0.25rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <p><strong>Pattern:</strong> "{pattern.pattern}"</p>
                      <p><strong>Questions:</strong> {pattern.questionCount}</p>
                      {pattern.questions.map((q: any, qIndex: number) => (
                        <p key={qIndex} style={{ marginLeft: '1rem' }}>
                          Q{q.index + 1}: {q.text}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Stem Analysis */}
              {results.debug.stemAnalysis.duplicateStems.length > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fdf2f8',
                  border: '1px solid #f9a8d4',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    📝 Question Stem Analysis
                  </h3>
                  <p><strong>Duplicate Stems Found:</strong> {results.debug.stemAnalysis.duplicateStems.length}</p>
                  
                  {results.debug.stemAnalysis.duplicateStems.map((stem: any, index: number) => (
                    <div key={index} style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      borderRadius: '0.25rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <p><strong>Stem:</strong> "{stem.stem}"</p>
                      <p><strong>Count:</strong> {stem.count}</p>
                      {stem.questions.map((q: string, qIndex: number) => (
                        <p key={qIndex} style={{ marginLeft: '1rem' }}>
                          {q}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Questions */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem'
              }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📋 Sample Generated Questions
                </h3>
                {results.debug.questionSample.map((q: any, index: number) => (
                  <div key={index} style={{
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '0.25rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p><strong>Q{index + 1} ({q.type} - {q.difficulty}):</strong></p>
                    <p style={{ marginTop: '0.25rem' }}>{q.text}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Topic: {q.topic} | Keywords: {q.keywords?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
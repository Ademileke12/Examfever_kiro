import { NextRequest, NextResponse } from 'next/server'
import { XrouteClient } from '@/lib/ai/xroute-client'

export async function GET(request: NextRequest) {
  try {
    const xrouteClient = new XrouteClient()
    
    // Test connection
    const isConnected = await xrouteClient.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Xroute API'
      }, { status: 500 })
    }

    // Test question generation
    const testPrompt = `Generate 2 multiple choice questions about JavaScript basics. Format as JSON with this structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": [
            {"text": "Option A", "correct": false},
            {"text": "Option B", "correct": true},
            {"text": "Option C", "correct": false},
            {"text": "Option D", "correct": false}
          ],
          "explanation": "Why the correct answer is right"
        }
      ]
    }`

    const response = await xrouteClient.generateContent(testPrompt)
    
    return NextResponse.json({
      success: true,
      message: 'Xroute API is working correctly',
      model: process.env.XROUTE_MODEL,
      response: response.substring(0, 500) + '...' // Truncate for display
    })

  } catch (error) {
    console.error('Xroute API test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
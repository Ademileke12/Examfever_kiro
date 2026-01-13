import { NextRequest, NextResponse } from 'next/server'
import { getAvailableModels } from '@/lib/ai/config'
import { groqClient } from '@/lib/ai/groq-client'

export async function GET(request: NextRequest) {
  try {
    const availableModels = getAvailableModels()
    
    if (availableModels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No AI models available',
        models: [],
        details: 'Check your API keys and model configuration'
      })
    }

    // Test the first available Groq model
    const groqModels = availableModels.filter(m => m.type === 'groq')
    let testResult = null
    
    if (groqModels.length > 0 && process.env.GROQ_API_KEY && groqModels[0]) {
      try {
        const testPrompt = "Generate a simple test question about mathematics. Keep it short."
        const response = await groqClient.generateContent(testPrompt, groqModels[0].name)
        testResult = {
          success: true,
          model: groqModels[0].name,
          response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
          message: 'AI model is working correctly'
        }
      } catch (error) {
        testResult = {
          success: false,
          model: groqModels[0].name,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'AI model test failed'
        }
      }
    }

    return NextResponse.json({
      success: true,
      models: availableModels.map(model => ({
        name: model.name,
        type: model.type,
        priority: model.priority,
        maxTokens: model.maxTokens,
        available: model.type === 'groq' ? !!model.apiKey : !!model.endpoint
      })),
      testResult,
      environment: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      models: []
    }, { status: 500 })
  }
}
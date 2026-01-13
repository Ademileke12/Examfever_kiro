import { NextRequest, NextResponse } from 'next/server'
import { groqClient } from '@/lib/ai/groq-client'
import { FireworksClient } from '@/lib/ai/fireworks-client'
import { getAvailableModels } from '@/lib/ai/config'

export async function GET(request: NextRequest) {
  try {
    const availableModels = getAvailableModels()
    const groqModels = availableModels.filter(m => m.type === 'groq')
    const fireworksModels = availableModels.filter(m => m.type === 'fireworks')
    
    // Test Groq availability
    const groqAvailable = await groqClient.isAvailable()
    
    // Initialize Fireworks client if API key is available
    let fireworksClient: FireworksClient | null = null
    if (process.env.FIREWORKS_API_KEY) {
      fireworksClient = new FireworksClient(process.env.FIREWORKS_API_KEY)
    }
    
    // Test each model individually
    const modelTests = []
    
    // Test Fireworks models
    for (const model of fireworksModels) {
      let testResult = null
      let testError = null
      
      try {
        if (fireworksClient) {
          testResult = await fireworksClient.generateContent(
            model,
            "Say 'Hello' and nothing else."
          )
        } else {
          testError = 'Fireworks API key not configured'
        }
      } catch (error) {
        testError = error instanceof Error ? error.message : 'Unknown error'
      }
      
      modelTests.push({
        modelName: model.name,
        type: 'fireworks',
        success: !!testResult,
        result: testResult,
        error: testError
      })
    }
    
    // Test Groq models
    for (const model of groqModels) {
      let testResult = null
      let testError = null
      
      try {
        testResult = await groqClient.generateContent(
          "Say 'Hello' and nothing else.",
          model.name
        )
      } catch (error) {
        testError = error instanceof Error ? error.message : 'Unknown error'
      }
      
      modelTests.push({
        modelName: model.name,
        type: 'groq',
        success: !!testResult,
        result: testResult,
        error: testError
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        availableModels: availableModels.map(m => ({
          name: m.name,
          type: m.type,
          priority: m.priority,
          hasApiKey: m.type === 'fireworks' ? !!process.env.FIREWORKS_API_KEY : 
                     m.type === 'groq' ? !!m.apiKey : true
        })),
        groqAvailable,
        fireworksAvailable: !!fireworksClient,
        modelTests,
        apiKeys: {
          groq: {
            present: !!process.env.GROQ_API_KEY,
            length: process.env.GROQ_API_KEY?.length || 0
          },
          fireworks: {
            present: !!process.env.FIREWORKS_API_KEY,
            length: process.env.FIREWORKS_API_KEY?.length || 0
          }
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    })
  }
}
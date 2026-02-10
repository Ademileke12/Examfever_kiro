import { NextRequest, NextResponse } from 'next/server'
import { questionGenerator } from '@/lib/ai/question-generator'
import { getAvailableModels } from '@/lib/ai/config'

export async function GET(request: NextRequest) {
  try {
    const availableModels = getAvailableModels()
    const modelStatus = await questionGenerator.getModelStatus()
    const usageStats = questionGenerator.getUsageStats()

    const status = {
      timestamp: new Date().toISOString(),
      models: availableModels.map(model => ({
        name: model.name,
        type: model.type,
        available: modelStatus[model.name] || false,
        priority: model.priority,
        rateLimit: model.rateLimit,
        maxTokens: model.maxTokens
      })),
      usage: usageStats,
      summary: {
        totalModels: availableModels.length,
        availableModels: Object.values(modelStatus).filter(Boolean).length,
        primaryModelAvailable: availableModels[0]?.name ? (modelStatus[availableModels[0].name] || false) : false
      }
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Model status check error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Status check failed' 
      },
      { status: 500 }
    )
  }
}

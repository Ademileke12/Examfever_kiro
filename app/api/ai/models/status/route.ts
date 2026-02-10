import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { questionGenerator } from '@/lib/ai/question-generator'
import { getAvailableModels } from '@/lib/ai/config'
import { withTimeout, Timeouts } from '@/lib/security/timeout'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const availableModels = getAvailableModels()

    // Get status with timeout
    const modelStatus = await withTimeout(
      questionGenerator.getModelStatus(),
      Timeouts.NORMAL,
      'Model status check timed out'
    )

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
      { success: false, error: 'Status check failed' },
      { status: 500 }
    )
  }
}

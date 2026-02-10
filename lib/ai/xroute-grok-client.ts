import axios from 'axios'

interface GrokMessage {
  content: string
  role: 'user' | 'assistant' | 'system'
}

interface GrokRequestBody {
  stream: boolean
  model: string
  messages: GrokMessage[]
}

interface GrokResponse {
  choices: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class XrouteGrokClient {
  private apiKey: string
  private apiUrl = 'https://api.xroute.ai/grok/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.XROUTE_API_KEY || ''
    if (!this.apiKey) {
      console.warn('XROUTE_API_KEY not found in environment variables')
    }
  }

  async generateContent(prompt: string, model: string = 'grok-3-mini'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Xroute API key not configured')
    }

    console.log(`🚀 Xroute Grok API call: {model: '${model}', hasApiKey: ${!!this.apiKey}}`)

    const requestBody: GrokRequestBody = {
      stream: false, // Disable streaming for simpler response handling
      model: model,
      messages: [{
        content: prompt,
        role: 'user'
      }]
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    }

    try {
      const response = await axios.post(this.apiUrl, requestBody, { 
        headers,
        timeout: 120000 // 2 minutes timeout - Grok is typically faster
      })

      if (!response.data) {
        throw new Error('Empty response from Xroute Grok API')
      }

      const grokResponse = response.data as GrokResponse
      
      if (!grokResponse.choices || grokResponse.choices.length === 0) {
        throw new Error('No choices in Xroute Grok API response')
      }

      const choice = grokResponse.choices[0]
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('No content in Xroute Grok API response')
      }

      const generatedText = choice.message.content
      
      console.log(`✅ Xroute Grok API response received: ${generatedText.length} characters`)
      return generatedText

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const statusText = error.response?.statusText
        const errorData = error.response?.data
        
        console.error(`❌ Xroute Grok API error: ${status} ${statusText}`, errorData)
        throw new Error(`Xroute Grok API error: ${status} - ${JSON.stringify(errorData)}`)
      } else {
        console.error('❌ Xroute Grok API request failed:', error)
        throw new Error(`Xroute Grok API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  getUsage(): Record<string, unknown> {
    return {
      provider: 'xroute-grok',
      model: 'grok-3-mini',
      hasApiKey: !!this.apiKey
    }
  }
}

export const xrouteGrokClient = new XrouteGrokClient()

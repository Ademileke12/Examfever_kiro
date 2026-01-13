import { AIModelConfig } from './config'

interface FireworksResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class FireworksClient {
  private apiKey: string
  private baseUrl = 'https://api.fireworks.ai/inference/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateContent(
    model: AIModelConfig,
    prompt: string,
    maxTokens?: number
  ): Promise<string> {
    try {
      const url = `${this.baseUrl}/chat/completions`
      
      // Ensure we don't exceed Fireworks AI's non-streaming limit
      const requestTokens = Math.min(maxTokens || model.maxTokens, 4096)

      const requestBody = {
        model: model.name,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: requestTokens,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000) // 15 second timeout for Fireworks (reduced from 30s)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Fireworks AI API error: ${response.status} - ${errorText}`)
      }

      const data: FireworksResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from Fireworks AI')
      }

      const choice = data.choices[0]
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('Invalid response structure from Fireworks AI')
      }

      return choice.message.content

    } catch (error) {
      console.error('Fireworks AI API error:', error)
      throw error
    }
  }

  async testConnection(model: AIModelConfig): Promise<boolean> {
    try {
      const testPrompt = "Say 'Hello' if you can understand this message."
      const response = await this.generateContent(model, testPrompt, 50)
      return response.toLowerCase().includes('hello')
    } catch (error) {
      console.error('Fireworks AI connection test failed:', error)
      return false
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }
}
import { rateLimiter } from './rate-limiter'
import { getModelByName } from './config'

interface OllamaResponse {
  response: string
  done: boolean
}

export class LocalModelClient {
  private ollamaHost: string

  constructor(ollamaHost: string = 'http://localhost:11434') {
    this.ollamaHost = ollamaHost
  }

  async generateWithOllama(prompt: string, modelName: string = 'llama3.2'): Promise<string> {
    const model = getModelByName(modelName)
    if (!model) {
      throw new Error(`Model ${modelName} configuration not found`)
    }

    // Check rate limit
    const hasQuota = await rateLimiter.checkQuota(model.name, model.rateLimit)
    if (!hasQuota) {
      throw new Error('Rate limit exceeded for local model')
    }

    try {
      const response = await fetch(`${this.ollamaHost}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: model.maxTokens
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data: OllamaResponse = await response.json()
      
      // Consume quota on successful request
      await rateLimiter.consumeQuota(model.name, model.rateLimit)
      
      return data.response

    } catch (error) {
      throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaHost}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch {
      return false
    }
  }

  async getAvailableOllamaModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaHost}/api/tags`)
      if (!response.ok) return []
      
      const data = await response.json()
      return data.models?.map((model: any) => model.name) || []
    } catch {
      return []
    }
  }

  async pullOllamaModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaHost}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName })
      })
      
      return response.ok
    } catch {
      return false
    }
  }
}

export const localModelClient = new LocalModelClient(process.env.OLLAMA_HOST)

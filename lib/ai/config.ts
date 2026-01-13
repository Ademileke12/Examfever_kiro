export interface AIModelConfig {
  name: string
  type: 'fireworks' | 'groq' | 'ollama' | 'xroute'
  endpoint?: string
  apiKey?: string | undefined
  maxTokens: number
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  priority: number // Lower number = higher priority
}

export const AI_MODELS: AIModelConfig[] = [
  // Groq models - Primary choice (fast and free)
  {
    name: 'llama-3.3-70b-versatile',
    type: 'groq',
    apiKey: process.env.GROQ_API_KEY,
    maxTokens: 8192,
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerDay: 14400
    },
    priority: 1  // Primary choice - Groq Llama 3.3 70B (fast, high quality)
  },
  {
    name: 'llama-3.1-8b-instant',
    type: 'groq',
    apiKey: process.env.GROQ_API_KEY,
    maxTokens: 8192,
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerDay: 14400
    },
    priority: 2  // Fallback - Groq Llama 3.1 8B (very fast)
  },
  {
    name: 'enhanced-local-generator',
    type: 'ollama', // Using ollama type but will use enhanced mock generation
    endpoint: 'local',
    maxTokens: 4096,
    rateLimit: {
      requestsPerMinute: 1000, // No limits for local generation
      requestsPerDay: 100000
    },
    priority: 3  // Third choice - Local fallback
  },
  {
    name: 'grok-3-mini',
    type: 'xroute',
    apiKey: process.env.XROUTE_API_KEY,
    maxTokens: 8192,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000
    },
    priority: 4  // Fourth choice - Grok via Xroute
  },
  {
    name: 'google/gemini-3-flash-preview',
    type: 'xroute',
    apiKey: process.env.XROUTE_API_KEY,
    maxTokens: 8192,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000
    },
    priority: 5  // Fifth choice - Google Gemini via Xroute
  },
  // Groq models disabled due to rate limiting issues
  // {
  //   name: 'llama-3.1-8b-instant',
  //   type: 'groq',
  //   apiKey: process.env.GROQ_API_KEY,
  //   maxTokens: 8192,
  //   rateLimit: {
  //     requestsPerMinute: 30,
  //     requestsPerDay: 14400
  //   },
  //   priority: 4  // Disabled - Rate limited
  // },
  // {
  //   name: 'mixtral-8x7b-32768',
  //   type: 'groq',
  //   apiKey: process.env.GROQ_API_KEY,
  //   maxTokens: 32768,
  //   rateLimit: {
  //     requestsPerMinute: 30,
  //     requestsPerDay: 14400
  //   },
  //   priority: 5  // Disabled - Rate limited
  // },
  // {
  //   name: 'llama-3.1-70b-versatile',
  //   type: 'groq',
  //   apiKey: process.env.GROQ_API_KEY,
  //   maxTokens: 8192,
  //   rateLimit: {
  //     requestsPerMinute: 30,
  //     requestsPerDay: 14400
  //   },
  //   priority: 6  // Disabled - Model decommissioned
  // }
]

export const GENERATION_CONFIG = {
  maxContentLength: 15000, // characters - increased for more content processing
  chunkSize: 2500, // characters per chunk - increased for better context
  chunkOverlap: 300, // character overlap between chunks - increased for continuity
  maxQuestionsPerChunk: 8, // increased from 5 to 8 for more questions per chunk
  minQuestionQuality: 0.7, // 0-1 scale
  retryAttempts: 3,
  timeoutMs: 30000 // Reduced to 30 seconds to fail fast and use local generator
}

export function getAvailableModels(): AIModelConfig[] {
  return AI_MODELS.filter(model => {
    switch (model.type) {
      case 'xroute':
        return !!model.apiKey
      case 'fireworks':
        return !!model.apiKey
      case 'groq':
        return !!model.apiKey
      case 'ollama':
        return !!model.endpoint
      default:
        return false
    }
  }).sort((a, b) => a.priority - b.priority)
}

export function getModelByName(name: string): AIModelConfig | undefined {
  return AI_MODELS.find(model => model.name === name)
}

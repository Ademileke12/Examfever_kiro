import axios from 'axios'

interface RequestBody {
  contents: {
    role: string
    parts: {
      text: string
    }[]
  }[]
  model: string
  generationConfig: Record<string, unknown>
}

interface GoogleResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

export class XrouteGoogleClient {
  private apiKey: string
  private apiUrl = 'https://api.xroute.ai/google/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.XROUTE_API_KEY || ''
    if (!this.apiKey) {
      console.warn('XROUTE_API_KEY not found in environment variables')
    }
  }

  async generateContent(prompt: string, model: string = 'google/gemini-3-flash-preview'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Xroute API key not configured')
    }

    console.log(`🚀 Xroute Google API call: {model: '${model}', hasApiKey: ${!!this.apiKey}}`)

    const requestBody: RequestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      model: model,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.9,
        topK: 40
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    }

    try {
      const response = await axios.post(this.apiUrl, requestBody, { 
        headers,
        timeout: 240000 // Increased to 4 minutes timeout to match processing time
      })

      if (!response.data) {
        throw new Error('Empty response from Xroute Google API')
      }

      const googleResponse = response.data as GoogleResponse
      
      if (!googleResponse.candidates || googleResponse.candidates.length === 0) {
        throw new Error('No candidates in Xroute Google API response')
      }

      const candidate = googleResponse.candidates[0]
      if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content parts in Xroute Google API response')
      }

      const firstPart = candidate.content.parts[0]
      const generatedText = firstPart?.text
      
      if (!generatedText) {
        throw new Error('Empty text in Xroute Google API response')
      }

      console.log(`✅ Xroute Google API response received: ${generatedText.length} characters`)
      return generatedText

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const statusText = error.response?.statusText
        const errorData = error.response?.data
        
        console.error(`❌ Xroute Google API error: ${status} ${statusText}`, errorData)
        throw new Error(`Xroute Google API error: ${status} - ${JSON.stringify(errorData)}`)
      } else {
        console.error('❌ Xroute Google API request failed:', error)
        throw new Error(`Xroute Google API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  getUsage(): Record<string, any> {
    return {
      provider: 'xroute-google',
      model: 'google/gemini-3-flash-preview',
      hasApiKey: !!this.apiKey
    }
  }
}

export const xrouteGoogleClient = new XrouteGoogleClient()
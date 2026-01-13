interface XrouteResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class XrouteClient {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.XROUTE_API_KEY || ''
    this.model = process.env.XROUTE_MODEL || 'doubao-1-5-pro-32k-250115'
    this.baseUrl = 'https://api.xroute.ai/doubao/v1'
    
    if (!this.apiKey) {
      throw new Error('XROUTE_API_KEY environment variable is required')
    }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      console.log('Xroute API call:', {
        url: `${this.baseUrl}/chat/completions`,
        model: this.model,
        hasApiKey: !!this.apiKey
      })

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      })

      console.log('Xroute API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Xroute API error response:', errorText)
        throw new Error(`Xroute API error: ${response.status} - ${errorText}`)
      }

      const data: XrouteResponse = await response.json()
      console.log('Xroute API response received successfully')
      
      if (!data.choices || data.choices.length === 0 || !data.choices[0]?.message?.content) {
        throw new Error('No response from Xroute API')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('Xroute API error:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateContent('Hello, this is a test message. Please respond with "Hello".')
      return true
    } catch (error) {
      console.error('Xroute connection test failed:', error)
      return false
    }
  }
}
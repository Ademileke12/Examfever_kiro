interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerDay: number
}

export class RateLimiter {
  private minuteCounters = new Map<string, RateLimitEntry>()
  private dayCounters = new Map<string, RateLimitEntry>()

  async checkQuota(modelName: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now()
    
    // Check minute limit
    const minuteKey = `${modelName}:minute:${Math.floor(now / 60000)}`
    const minuteEntry = this.minuteCounters.get(minuteKey) || { count: 0, resetTime: now + 60000 }
    
    if (minuteEntry.count >= config.requestsPerMinute) {
      return false
    }

    // Check day limit
    const dayKey = `${modelName}:day:${Math.floor(now / 86400000)}`
    const dayEntry = this.dayCounters.get(dayKey) || { count: 0, resetTime: now + 86400000 }
    
    if (dayEntry.count >= config.requestsPerDay) {
      return false
    }

    return true
  }

  async consumeQuota(modelName: string, config: RateLimitConfig): Promise<void> {
    const now = Date.now()
    
    // Update minute counter
    const minuteKey = `${modelName}:minute:${Math.floor(now / 60000)}`
    const minuteEntry = this.minuteCounters.get(minuteKey) || { count: 0, resetTime: now + 60000 }
    minuteEntry.count++
    this.minuteCounters.set(minuteKey, minuteEntry)

    // Update day counter
    const dayKey = `${modelName}:day:${Math.floor(now / 86400000)}`
    const dayEntry = this.dayCounters.get(dayKey) || { count: 0, resetTime: now + 86400000 }
    dayEntry.count++
    this.dayCounters.set(dayKey, dayEntry)

    // Cleanup expired entries
    this.cleanup()
  }

  async waitForQuota(modelName: string, config: RateLimitConfig): Promise<number> {
    const now = Date.now()
    
    const minuteKey = `${modelName}:minute:${Math.floor(now / 60000)}`
    const minuteEntry = this.minuteCounters.get(minuteKey)
    
    if (minuteEntry && minuteEntry.count >= config.requestsPerMinute) {
      return minuteEntry.resetTime - now
    }

    return 0
  }

  private cleanup(): void {
    const now = Date.now()
    
    // Cleanup minute counters
    Array.from(this.minuteCounters.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.minuteCounters.delete(key)
      }
    })

    // Cleanup day counters
    Array.from(this.dayCounters.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.dayCounters.delete(key)
      }
    })
  }

  getUsage(modelName: string): { minute: number; day: number } {
    const now = Date.now()
    
    const minuteKey = `${modelName}:minute:${Math.floor(now / 60000)}`
    const dayKey = `${modelName}:day:${Math.floor(now / 86400000)}`
    
    const minuteEntry = this.minuteCounters.get(minuteKey)
    const dayEntry = this.dayCounters.get(dayKey)
    
    return {
      minute: minuteEntry?.count || 0,
      day: dayEntry?.count || 0
    }
  }
}

export const rateLimiter = new RateLimiter()

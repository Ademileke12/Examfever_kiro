export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

interface IRateLimiter {
    check(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult>
}

/**
 * In-memory sliding window rate limiter.
 * This is suitable for single-node deployments and development.
 * Note: For production with multiple nodes, use a Redis-backed limiter.
 */
class MemoryRateLimiter implements IRateLimiter {
    private instances = new Map<string, number[]>()

    async check(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
        const now = Date.now()
        const windowStart = now - windowMs

        // Get timestamps for this identifier
        let timestamps = this.instances.get(identifier) || []

        // Remove timestamps outside the sliding window
        timestamps = timestamps.filter(t => t > windowStart)

        const remaining = Math.max(0, limit - timestamps.length)
        const success = timestamps.length < limit

        if (success) {
            timestamps.push(now)
        }

        this.instances.set(identifier, timestamps)

        // Calculate reset time (when the first request in the window expires)
        const reset = (timestamps.length > 0 && timestamps[0] !== undefined)
            ? timestamps[0] + windowMs
            : now + windowMs

        return {
            success,
            limit,
            remaining,
            reset
        }
    }
}

// Singleton instances for different types of limiting
export const authRateLimiter = new MemoryRateLimiter()
export const generalApiRateLimiter = new MemoryRateLimiter()
export const expensiveApiRateLimiter = new MemoryRateLimiter()

/**
 * Helper to get rate limit configuration based on route
 */
export function getRateLimitConfig(pathname: string) {
    if (pathname.startsWith('/api/auth')) {
        return {
            limiter: authRateLimiter,
            limit: 10,       // 10 attempts
            windowMs: 60000  // per minute
        }
    }

    if (pathname.startsWith('/api/ai') || pathname.startsWith('/api/pdf')) {
        return {
            limiter: expensiveApiRateLimiter,
            limit: 5,        // 5 expensive operations
            windowMs: 60000  // per minute
        }
    }

    return {
        limiter: generalApiRateLimiter,
        limit: 5,        // 5 requests (adjusted for verification stability)
        windowMs: 60000  // per minute
    }
}

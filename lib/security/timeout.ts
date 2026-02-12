/**
 * Error thrown when an operation exceeds the specified timeout
 */
export class TimeoutError extends Error {
    constructor(message: string = 'Operation timed out') {
        super(message)
        this.name = 'TimeoutError'
    }
}

/**
 * Wraps a promise with a timeout.
 * If the promise doesn't resolve/reject within the timeout period, 
 * it rejects with a TimeoutError.
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage?: string
): Promise<T> {
    let timeoutId: NodeJS.Timeout

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new TimeoutError(errorMessage))
        }, timeoutMs)
    })

    try {
        const result = await Promise.race([promise, timeoutPromise])
        return result
    } finally {
        clearTimeout(timeoutId!)
    }
}

/**
 * Common timeout constants (in milliseconds)
 */
export const Timeouts = {
    FAST: 5000,      // 5 seconds
    NORMAL: 30000,   // 30 seconds
    SLOW: 180000,    // 180 seconds (3 minutes) - Increased for 40-question generation
    DRAG: 300000     // 300 seconds (5 minutes)
}

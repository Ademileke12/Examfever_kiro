'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimeoutOptions {
    timeoutMs?: number
    onTimeout: () => void
    enabled?: boolean
}

/**
 * Hook to track user inactivity and trigger an action after a timeout.
 * Default timeout is 30 minutes (1,800,000 ms).
 */
export function useInactivityTimeout({
    timeoutMs = 30 * 60 * 1000, // 30 minutes
    onTimeout,
    enabled = true
}: UseInactivityTimeoutOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        if (enabled) {
            timeoutRef.current = setTimeout(() => {
                console.log('[InactivityTimeout] User inactive for too long. Triggering timeout.')
                onTimeout()
            }, timeoutMs)
        }
    }, [enabled, onTimeout, timeoutMs])

    useEffect(() => {
        if (!enabled) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            return
        }

        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ]

        const handleActivity = () => {
            resetTimer()
        }

        // Initialize timer
        resetTimer()

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        return () => {
            // Cleanup
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [enabled, resetTimer])

    return { resetTimer }
}

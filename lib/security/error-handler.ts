import { NextResponse } from 'next/server'

/**
 * PRODUCTION-GRADE ERROR MASKING
 * This utility ensures that sensitive technical information (stack traces, SQL errors)
 * is never sent to the client in production environments.
 */
export function handleApiError(error: unknown, context: string = 'API Error') {
    // Log the full error to the server console for debugging
    console.error(`[${context}]`, error)

    const isProduction = process.env.NODE_ENV === 'production'

    // Default generic message
    let message = 'An unexpected error occurred. Please try again later.'
    let status = 500

    if (error instanceof Error) {
        // We can expose some specific, safe error messages even in production
        if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
            message = 'You must be logged in to perform this action.'
            status = 401
        } else if (error.message.includes('not found')) {
            message = 'The requested resource was not found.'
            status = 404
        } else if (error.message.includes('Rate limit')) {
            message = 'Too many requests. Please slow down.'
            status = 429
        } else if (!isProduction) {
            // In development, we can show more detail
            message = error.message
        }
    }

    return NextResponse.json(
        {
            success: false,
            error: message,
            // Never include stack trace in production
            timestamp: new Date().toISOString()
        },
        { status }
    )
}

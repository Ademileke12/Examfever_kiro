/**
 * Fraud Detection Utilities for Affiliate System
 * 
 * Prevents self-referrals and gaming of the affiliate system by:
 * - Tracking IP addresses
 * - Generating device fingerprints
 * - Comparing referrer vs referred user data
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Extract client IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string | null {
    const headers = request.headers

    // Try various header formats
    const forwardedFor = headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    const realIP = headers.get('x-real-ip')
    if (realIP) return realIP

    const cfConnectingIP = headers.get('cf-connecting-ip')
    if (cfConnectingIP) return cfConnectingIP

    return null
}

/**
 * Generate a device fingerprint from request headers
 * Uses User-Agent, Accept-Language, and other identifying headers
 */
export function getDeviceFingerprint(request: Request): string {
    const headers = request.headers

    const components = [
        headers.get('user-agent') || '',
        headers.get('accept-language') || '',
        headers.get('accept-encoding') || '',
        headers.get('accept') || ''
    ]

    const fingerprint = components.join('|')

    // Create a simple hash (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36)
}

/**
 * Check if a referral attempt looks fraudulent
 * Compares IP addresses and device fingerprints
 */
export async function checkFraudRisk(
    referrerId: string,
    referredUserId: string,
    currentIP: string | null,
    currentDevice: string
): Promise<{ isFraudulent: boolean; reason?: string }> {
    const supabase = createClient()

    // Get referrer's recent fraud logs
    const { data: referrerLogs } = await supabase
        .from('affiliate_fraud_logs')
        .select('ip_address, device_id')
        .eq('user_id', referrerId)
        .order('created_at', { ascending: false })
        .limit(10)

    // Get referred user's signup logs
    const { data: referredLogs } = await supabase
        .from('affiliate_fraud_logs')
        .select('ip_address, device_id')
        .eq('user_id', referredUserId)
        .eq('event_type', 'signup_attempt')
        .limit(1)

    if (!referrerLogs || !referredLogs || referredLogs.length === 0) {
        return { isFraudulent: false }
    }

    const referredLog = referredLogs[0]

    // Check if IP matches
    if (currentIP && referrerLogs.some(log => log.ip_address === referredLog.ip_address)) {
        return {
            isFraudulent: true,
            reason: 'Matching IP address detected between referrer and referred user'
        }
    }

    // Check if device matches
    if (referrerLogs.some(log => log.device_id === referredLog.device_id)) {
        return {
            isFraudulent: true,
            reason: 'Matching device fingerprint detected between referrer and referred user'
        }
    }

    return { isFraudulent: false }
}

/**
 * Log a fraud attempt to the database
 */
export async function logFraudAttempt(
    userId: string,
    eventType: string,
    ipAddress: string | null,
    deviceId: string,
    isFlagged: boolean = false,
    metadata: Record<string, any> = {}
) {
    const supabase = createClient()

    await supabase
        .from('affiliate_fraud_logs')
        .insert({
            user_id: userId,
            ip_address: ipAddress,
            device_id: deviceId,
            event_type: eventType,
            is_flagged: isFlagged,
            metadata
        })
}

/**
 * Log signup attempt for fraud tracking
 */
export async function logSignupAttempt(
    request: Request,
    userId: string
) {
    const ipAddress = getClientIP(request)
    const deviceId = getDeviceFingerprint(request)

    await logFraudAttempt(
        userId,
        'signup_attempt',
        ipAddress,
        deviceId,
        false,
        {
            user_agent: request.headers.get('user-agent') || '',
            timestamp: new Date().toISOString()
        }
    )
}

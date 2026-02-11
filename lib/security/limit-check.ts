import { createClient } from '@/lib/supabase/server'

export interface LimitCheckResult {
    allowed: boolean
    remaining?: number
    total?: number
    error?: string
}

/**
 * Server-side utility to check if a user has remaining capacity for uploads or exams.
 * This MUST be called before allowing any upload or exam creation.
 */
export async function checkSubscriptionLimit(
    type: 'upload' | 'exam'
): Promise<LimitCheckResult> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { allowed: false, error: 'User not authenticated', remaining: 0, total: 0 }
        }

        // Fetch current subscription
        const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error || !subscription) {
            return {
                allowed: false,
                error: 'Subscription not found'
            }
        }

        // Check limits
        const field = type === 'upload' ? 'uploads' : 'exams'
        const used = subscription[`${field}_used`]
        const allowed = subscription[`${field}_allowed`]
        const remaining = allowed - used

        if (remaining <= 0) {
            return {
                allowed: false,
                remaining: 0,
                total: allowed,
                error: `You have exhausted your ${type} limit. Please upgrade your plan.`
            }
        }

        return {
            allowed: true,
            remaining,
            total: allowed
        }

    } catch (error) {
        console.error('Limit check error:', error)
        return {
            allowed: false,
            error: 'Internal server error'
        }
    }
}

/**
 * Increment the usage counter after a successful upload or exam creation.
 * This should be called AFTER the operation succeeds.
 */
export async function incrementUsage(type: 'upload' | 'exam'): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('User not authenticated for usage increment')
            return false
        }

        const userId = user.id
        const field = type === 'upload' ? 'uploads_used' : 'exams_used'

        // Get current value first
        const { data: current } = await supabase
            .from('user_subscriptions')
            .select(field)
            .eq('user_id', userId)
            .single()

        if (!current) return false

        // Increment the value
        const currentValue = (current as any)[field] || 0
        const { error } = await supabase
            .from('user_subscriptions')
            .update({ [field]: currentValue + 1 })
            .eq('user_id', userId)

        return !error
    } catch (error) {
        console.error('Increment usage error:', error)
        return false
    }
}

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

        if (error && error.code !== 'PGRST116') {
            // Real error, not just "no rows found"
            return {
                allowed: false,
                error: 'Failed to fetch subscription'
            }
        }

        // If no subscription found, create a default FREE subscription
        if (!subscription || error?.code === 'PGRST116') {
            const { data: newSubscription, error: createError } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id: user.id,
                    plan_tier: 'free',
                    uploads_allowed: 2,
                    exams_allowed: 2,
                    uploads_used: 0,
                    exams_used: 0,
                    is_active: true
                })
                .select()
                .single()

            if (createError || !newSubscription) {
                console.error('Failed to create default subscription:', createError)
                return {
                    allowed: false,
                    error: 'Failed to initialize subscription'
                }
            }

            // Use the newly created subscription
            const field = type === 'upload' ? 'uploads' : 'exams'
            const used = newSubscription[`${field}_used`]
            const allowed = newSubscription[`${field}_allowed`]
            const remaining = allowed - used

            return {
                allowed: remaining > 0,
                remaining,
                total: allowed
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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch subscription details
        const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching subscription:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch subscription status' },
                { status: 500 }
            )
        }

        // If no subscription found, default to FREE if we want to ensure row exists
        // (Though the handle_new_user function should have created it)
        if (!subscription) {
            return NextResponse.json({
                success: true,
                data: {
                    plan_tier: 'free',
                    uploads_allowed: 2,
                    exams_allowed: 2,
                    uploads_used: 0,
                    exams_used: 0,
                    is_active: true
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: subscription
        })

    } catch (error) {
        console.error('Subscription status error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

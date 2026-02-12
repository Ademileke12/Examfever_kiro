import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Downgrade to Free
        // This resets limits to 2/2 and changes plan to Free immediately.
        // In a real system, you might want to wait until end of billing cycle.
        // for MVP, we do it immediately.

        const { error: updateError } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: user.id,
                plan_tier: 'free',
                uploads_allowed: 2,
                exams_allowed: 2,
                uploads_used: 0, // Reset usage? Or keep? 
                // If they exhausted 2 already, they will be blocked immediately.
                // If they had 15 usages on Premium and downgrade to Free (2), they will be over limit.
                // This is correct behavior (they should stop using).
                // So we don't reset usage unless it's a new cycle?
                // Let's keep usage as is, so if they have 10 used, they are now 10/2 and blocked.

                // sub_end_date: null? or Keep current?
                // Free plan usually doesn't expire, or expires never.
                sub_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(), // 10 years
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Downgrade error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

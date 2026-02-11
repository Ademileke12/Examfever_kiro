import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth/user' // We might need to handle auth manually if this is called from client
// Actually, for API routes, we should use supabase.auth.getUser() as we just fixed.

interface VerifyPayload {
    reference: string
    plan: 'standard' | 'premium'
}

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

        const { reference, plan, type, id } = await request.json() as any

        if (!reference) {
            return NextResponse.json(
                { success: false, error: 'Missing reference' },
                { status: 400 }
            )
        }

        // 1. Verify with Paystack
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
        if (!paystackSecretKey) {
            throw new Error('PAYSTACK_SECRET_KEY not configured')
        }

        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`
            }
        })

        const paystackData = await paystackResponse.json()

        if (!paystackResponse.ok || !paystackData.status || paystackData.data.status !== 'success') {
            return NextResponse.json(
                { success: false, error: 'Payment verification failed' },
                { status: 400 }
            )
        }

        const amountPaid = paystackData.data.amount / 100

        // 2. Logic based on Type
        if (type === 'plan' || (!type && plan)) {
            // Plan Logic
            const planName = type === 'plan' ? id : plan
            let uploads = 2
            let exams = 2

            if (planName === 'standard') {
                uploads = 10
                exams = 10
            } else if (planName === 'premium') {
                uploads = 15
                exams = 15
            }

            const startDate = new Date()
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 30)

            const { error: subError } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: user.id,
                    plan_tier: planName,
                    uploads_allowed: uploads,
                    exams_allowed: exams,
                    uploads_used: 0,
                    exams_used: 0,
                    sub_start_date: startDate.toISOString(),
                    sub_end_date: endDate.toISOString(),
                    is_active: true,
                    updated_at: new Date().toISOString()
                })

            if (subError) throw subError

        } else if (type === 'addon') {
            // Addon Logic
            const { data: currentSub } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single()

            let newUploadsAllowed = (currentSub?.uploads_allowed || 2)
            let newExamsAllowed = (currentSub?.exams_allowed || 2)

            if (id === 'package_1') {
                newUploadsAllowed += 10
                newExamsAllowed += 10
            } else if (id === 'package_2') {
                newUploadsAllowed += 14
                newExamsAllowed += 10
            } else if (id === 'package_3') {
                newUploadsAllowed += 20
                newExamsAllowed += 20
            }

            const { error: subError } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: user.id,
                    plan_tier: currentSub?.plan_tier || 'free',
                    uploads_allowed: newUploadsAllowed,
                    exams_allowed: newExamsAllowed,
                    uploads_used: currentSub?.uploads_used || 0,
                    exams_used: currentSub?.exams_used || 0,
                    sub_start_date: currentSub?.sub_start_date || new Date().toISOString(),
                    sub_end_date: currentSub?.sub_end_date || new Date().toISOString(),
                    is_active: true,
                    updated_at: new Date().toISOString()
                })

            if (subError) throw subError
        }

        // 3. Log Transaction
        const { error: txError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                reference,
                amount: amountPaid,
                status: 'success',
                plan_tier: type === 'plan' ? id : (type === 'addon' ? (type + '-' + id) : plan),
                metadata: paystackData.data
            })

        if (txError) console.error('Transaction log error:', txError)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

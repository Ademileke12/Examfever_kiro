import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { affiliateManager } from '@/lib/affiliate/affiliate-manager'
import { paymentVerifySchema } from '@/lib/validation/schemas'
import { handleApiError } from '@/lib/security/error-handler'

/**
 * Subscription Verification API
 * 
 * POST /api/subscription/verify
 * Validates Paystack payment and updates user subscription status.
 */

const PRICE_MAP: Record<string, number> = {
    'standard': 3500,
    'premium': 6300,
    'package_1': 3000,
    'package_2': 5500,
    'package_3': 8500
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Secure Identity Verification
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Input Validation
        const body = await request.json()
        const validation = paymentVerifySchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: validation.error.errors },
                { status: 400 }
            )
        }

        const { reference, plan, type, id } = validation.data

        // 3. Verify with Paystack
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

        // 4. Security Check: Verify amount and customer email matches
        const amountPaid = paystackData.data.amount / 100 // Convert from kobo to Naira
        const paystackCustomerEmail = paystackData.data.customer.email

        // Ensure the payment belongs to the authenticated user
        if (paystackCustomerEmail.toLowerCase() !== user.email?.toLowerCase()) {
            console.error(`[SECURITY] Email mismatch. User: ${user.email}, Paystack: ${paystackCustomerEmail}`)
            return NextResponse.json(
                { success: false, error: 'Payment email mismatch. Please use your account email.' },
                { status: 400 }
            )
        }

        // Enforce strict price checking
        const requestedId = type === 'plan' ? id : (type === 'addon' ? id : plan)
        if (!requestedId) {
            return NextResponse.json({ success: false, error: 'Invalid plan or addon selection' }, { status: 400 })
        }

        const expectedPrice = PRICE_MAP[requestedId]
        if (!expectedPrice) {
            console.error(`[SECURITY] Unknown item ID: ${requestedId}`)
            return NextResponse.json({ success: false, error: 'Invalid item selected' }, { status: 400 })
        }

        if (amountPaid < expectedPrice) {
            console.error(`[SECURITY] Price manipulation detected. Paid: ${amountPaid}, Expected: ${expectedPrice} for ${requestedId}`)
            return NextResponse.json(
                { success: false, error: 'Payment amount mismatch. Please contact support.' },
                { status: 400 }
            )
        }

        // 5. Subscription/Addon Logic
        if (type === 'plan' || (!type && plan)) {
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
                }, {
                    onConflict: 'user_id'
                })

            if (subError) throw subError

            // Award Commissions
            try {
                await affiliateManager.awardCommissionIfEligible(user.id, amountPaid, reference, request)
            } catch (affError) {
                console.error('Affiliate commission awarding failed:', affError)
            }

        } else if (type === 'addon') {
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
                }, {
                    onConflict: 'user_id'
                })

            if (subError) throw subError
        }

        // 6. Log Transaction
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
        return handleApiError(error, 'SubscriptionVerify')
    }
}

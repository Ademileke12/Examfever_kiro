'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Loader2, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Define types clearly
type PurchaseItem = {
    amount: number
    name: string
    type: 'plan' | 'addon'
    description: string
    uploadLimit: number
    examLimit: number
}

const PLANS: Record<string, PurchaseItem> = {
    standard: {
        amount: 3500,
        name: 'Standard Plan',
        type: 'plan',
        description: 'Monthly Subscription',
        uploadLimit: 10,
        examLimit: 10
    },
    premium: {
        amount: 6300,
        name: 'Premium Plan',
        type: 'plan',
        description: 'Monthly Subscription',
        uploadLimit: 15,
        examLimit: 15
    }
}

const ADDONS: Record<string, PurchaseItem> = {
    package_1: {
        amount: 3000,
        name: 'Package 1',
        type: 'addon',
        description: '10 Uploads + 10 Exams',
        uploadLimit: 10,
        examLimit: 10
    },
    package_2: {
        amount: 5500,
        name: 'Package 2',
        type: 'addon',
        description: '14 Uploads + 10 Exams',
        uploadLimit: 14,
        examLimit: 10
    },
    package_3: {
        amount: 8500,
        name: 'Package 3',
        type: 'addon',
        description: '20 Uploads + 20 Exams',
        uploadLimit: 20,
        examLimit: 20
    }
}

export default function CheckoutPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan')
    const addon = searchParams.get('addon')

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Determine selected item
    const selectedItem: PurchaseItem | null = (plan && PLANS[plan]) || (addon && ADDONS[addon]) || null

    useEffect(() => {
        if (!selectedItem) {
            router.push('/subscription')
            return
        }

        const getUserEmail = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setEmail(user.email)
            }
            setLoading(false)
        }
        getUserEmail()
    }, [selectedItem, router])


    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: selectedItem ? selectedItem.amount * 100 : 0,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        currency: 'NGN',
    }

    const PaymentButton = dynamic(
        () => import('@/components/checkout/PaymentButton').then((mod) => mod.PaymentButton),
        { ssr: false }
    )

    const onSuccess = async (reference: any) => {
        setVerifying(true)
        try {
            const response = await fetch('/api/subscription/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reference: reference.reference,
                    type: selectedItem?.type,
                    id: plan || addon
                })
            })

            const result = await response.json()

            if (result.success) {
                router.push('/subscription?success=true')
            } else {
                setError(result.error || 'Verification failed. Please contact support.')
            }
        } catch (err) {
            console.error('Verify error:', err)
            setError('Network error during verification.')
        } finally {
            setVerifying(false)
        }
    }

    const onClose = () => {
        console.log('Payment closed')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!selectedItem) return null

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
                <ParticleBackground />
                <Navbar />

                <div className="relative z-10 pt-32 px-4 max-w-2xl mx-auto">
                    <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black mb-2 gradient-text">Checkout</h1>
                            <p className="text-readable-muted">Secure your subscription upgrade</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                            <h3 className="text-lg font-bold text-readable mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Order Summary
                            </h3>

                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-readable-muted">{selectedItem.name}</span>
                                <span className="font-bold text-readable">₦{selectedItem.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-readable-muted">Type</span>
                                <span className="font-bold text-readable">{selectedItem.type === 'plan' ? 'Monthly Subscription' : 'One-time Purchase'}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 text-lg">
                                <span className="font-bold text-readable">Total</span>
                                <span className="font-black text-primary text-2xl">₦{selectedItem.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {selectedItem.uploadLimit > 0 && (
                                <div className="flex items-center gap-3 text-sm text-readable-muted">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>{selectedItem.type === 'plan' ? `${selectedItem.uploadLimit} PDF Uploads per month` : `+${selectedItem.uploadLimit} PDF Uploads`}</span>
                                </div>
                            )}
                            {selectedItem.examLimit > 0 && (
                                <div className="flex items-center gap-3 text-sm text-readable-muted">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>{selectedItem.type === 'plan' ? `${selectedItem.examLimit} Generated Exams per month` : `+${selectedItem.examLimit} Generated Exams`}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-readable-muted">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Secured by Paystack</span>
                            </div>
                        </div>

                        <PaymentButton
                            config={config}
                            onSuccess={onSuccess}
                            onClose={onClose}
                            verifying={verifying}
                            amount={selectedItem.amount}
                            disabled={verifying}
                        />

                        <div className="text-center mt-6">
                            <button onClick={() => router.back()} className="text-sm text-readable-muted hover:text-readable transition-colors">
                                Cancel & Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

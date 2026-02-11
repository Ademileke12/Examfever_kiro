'use client'

import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface PaymentButtonProps {
    config: any
    onSuccess: (reference: any) => void
    onClose: () => void
    verifying: boolean
    amount: number
    disabled?: boolean
}

export const PaymentButton = ({ config, onSuccess, onClose, verifying, amount, disabled }: PaymentButtonProps) => {
    const [scriptLoaded, setScriptLoaded] = useState(false)

    useEffect(() => {
        const scriptId = 'paystack-script'
        if (document.getElementById(scriptId)) {
            setScriptLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        script.onload = () => setScriptLoaded(true)
        script.onerror = () => console.error('Failed to load Paystack script')
        document.body.appendChild(script)
    }, [])

    const handlePay = () => {
        if (!scriptLoaded) {
            console.warn('Paystack script not loaded yet')
            return
        }

        const PaystackPop = (window as any).PaystackPop
        if (!PaystackPop) {
            console.error('PaystackPop is not available on window')
            return
        }

        const handler = PaystackPop.setup({
            key: config.publicKey,
            email: config.email,
            amount: config.amount,
            currency: 'NGN',
            ref: config.reference,
            callback: (response: any) => {
                onSuccess(response)
            },
            onClose: () => {
                onClose()
            },
        })

        handler.openIframe()
    }

    if (verifying) {
        return (
            <button
                disabled
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying Payment...
            </button>
        )
    }

    return (
        <button
            onClick={handlePay}
            disabled={disabled || verifying || !scriptLoaded}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {`Pay ₦${amount.toLocaleString()}`}
        </button>
    )
}

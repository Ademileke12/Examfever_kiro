'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Package, Loader2, Sparkles, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AddOnProps {
    id: string
    amount: number
    name: string
    uploads: number
    exams: number
    popular?: boolean
}

const AddOnCard = ({ id, amount, name, uploads, exams, popular, onPurchase, loading }: AddOnProps & { onPurchase: () => void, loading: boolean }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative glass p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${popular ? 'border-primary shadow-glow bg-primary/5' : 'border-white/10 hover:bg-white/5'
            }`}
    >
        {popular && (
            <div className="absolute -top-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Best Value
            </div>
        )}

        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-readable'
            }`}>
            <Package className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-readable mb-1">{name}</h3>
        <div className="text-2xl font-black text-readable mb-6">₦{amount.toLocaleString()}</div>

        <div className="w-full space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                <span className="text-readable-muted">PDF Uploads</span>
                <span className="font-bold text-readable">+{uploads}</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                <span className="text-readable-muted">Generated Exams</span>
                <span className="font-bold text-readable">+{exams}</span>
            </div>
        </div>

        <button
            onClick={onPurchase}
            disabled={loading}
            className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${popular
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-readable'
                }`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Purchase Bundle'}
        </button>
    </motion.div>
)

export const AddOnStore = () => {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const addOns: AddOnProps[] = [
        {
            id: 'package_1',
            name: 'Starter Bundle',
            amount: 3000,
            uploads: 10,
            exams: 10
        },
        {
            id: 'package_2',
            name: 'Pro Bundle',
            amount: 5500,
            uploads: 14,
            exams: 10,
            popular: true
        },
        {
            id: 'package_3',
            name: 'Ultimate Bundle',
            amount: 8500,
            uploads: 20,
            exams: 20
        }
    ]

    const handlePurchase = async (addOn: AddOnProps) => {
        setLoading(addOn.id)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user?.email) {
                alert('Please sign in to purchase add-ons')
                setLoading(null)
                return
            }

            router.push(`/checkout?addon=${addOn.id}`)

        } catch (error) {
            console.error('Purchase error:', error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="mt-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
                    <ShoppingBag className="w-8 h-8" />
                    Credit Store
                </h2>
                <p className="text-readable-muted">Top up your account with credit bundles. No subscription required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {addOns.map((addOn) => (
                    <AddOnCard
                        key={addOn.id}
                        {...addOn}
                        onPurchase={() => handlePurchase(addOn)}
                        loading={loading === addOn.id}
                    />
                ))}
            </div>
        </div>
    )
}

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Zap, Crown, Rocket } from 'lucide-react'

interface PlanProps {
    name: string
    price: string
    uploads: number
    exams: number
    features: string[]
    icon: React.ElementType
    color: string
    recommended?: boolean
    onSelect: () => void
}

const PlanCard = ({
    name,
    price,
    uploads,
    exams,
    features,
    icon: Icon,
    color,
    recommended,
    onSelect
}: PlanProps) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative p-8 rounded-3xl glass glass-hover border-2 ${recommended ? 'border-primary shadow-glow' : 'border-transparent'
            }`}
    >
        {recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
            </div>
        )}

        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-readable mb-2">{name}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-readable">{price}</span>
            {price !== 'Free' && <span className="text-readable-muted ml-1">/mo</span>}
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-readable"><span className="font-bold">{uploads}</span> PDF Uploads</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-readable"><span className="font-bold">{exams}</span> Exams</span>
            </div>
            {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-readable-muted">{feature}</span>
                </div>
            ))}
        </div>

        <button
            onClick={onSelect}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${recommended
                    ? 'bg-primary text-white shadow-glow hover:opacity-90'
                    : 'bg-readable/5 hover:bg-readable/10 text-readable'
                }`}
        >
            {price === 'Free' ? 'Current Plan' : 'Upgrade Now'}
        </button>
    </motion.div>
)

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    onUpgrade: (plan: string) => void
}

export const SubscriptionModal = ({ isOpen, onClose, onUpgrade }: SubscriptionModalProps) => {
    const plans = [
        {
            name: 'Free Mode',
            price: 'Free',
            uploads: 2,
            exams: 2,
            icon: Zap,
            color: 'from-blue-500 to-indigo-600',
            features: ['Basic AI Analysis', 'Standard Support']
        },
        {
            name: 'Standard',
            price: '₦3,500',
            uploads: 10,
            exams: 10,
            icon: Rocket,
            color: 'from-purple-500 to-pink-600',
            recommended: true,
            features: ['Priority Generation', 'Expanded Question Bank', 'Performance Tracking']
        },
        {
            name: 'Premium',
            price: '₦6,300',
            uploads: 15,
            exams: 15,
            icon: Crown,
            color: 'from-amber-500 to-orange-600',
            features: ['Unlimited History', 'Personalized AI Coach', 'Early Access To Features']
        }
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl bg-background rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-full hover:bg-readable/5 text-readable-muted transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-16">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-5xl font-black mb-4 gradient-text">Choose Your Path</h2>
                                <p className="text-readable-muted max-w-xl mx-auto">
                                    Unlock more power, more exams, and faster results with our premium plans.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {plans.map((plan) => (
                                    <PlanCard
                                        key={plan.name}
                                        {...plan}
                                        onSelect={() => onUpgrade(plan.name)}
                                    />
                                ))}
                            </div>

                            <p className="text-center text-xs text-readable-light mt-12 italic">
                                All monthly recurring access. Subscription can be canceled at any time.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

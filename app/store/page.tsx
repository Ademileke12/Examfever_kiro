'use client'

import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { AddOnStore } from '@/components/subscription/AddOnStore'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function StorePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C]">
                <ParticleBackground />

                <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                    <AddOnStore />
                </div>
            </div>
        </ProtectedRoute>
    )
}

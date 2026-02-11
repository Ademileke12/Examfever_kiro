'use client'

import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { AddOnStore } from '@/components/subscription/AddOnStore'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function StorePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C]">
                <ParticleBackground />
                <Navbar />

                <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
                            Credit Store
                        </h1>
                        <p className="text-readable-muted text-lg max-w-2xl mx-auto">
                            Purchase additional uploads and exam generations to boost your productivity.
                        </p>
                    </motion.div>

                    <AddOnStore />
                </div>
            </div>
        </ProtectedRoute>
    )
}

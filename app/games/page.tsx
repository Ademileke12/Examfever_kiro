'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Timer, Brain, Keyboard, Trophy, Lock, BookOpen, HelpCircle, Cpu } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useSubscription } from '@/components/providers/SubscriptionProvider'
import Link from 'next/link'

interface Game {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    color: string
    ready?: boolean
}

const games: Game[] = [
    {
        id: 'chess',
        title: 'Chess Strategy',
        description: 'Master the board with advanced tactical maneuvers against a medium-level AI.',
        icon: <Cpu className="w-8 h-8" />,
        color: 'from-slate-600 to-slate-800',
        ready: true
    },
    {
        id: 'speed-type',
        title: 'Speed Type',
        description: 'How fast can you type educational terms? Test your WPM and accuracy!',
        icon: <Keyboard className="w-8 h-8" />,
        color: 'from-blue-500 to-indigo-600',
        ready: true
    },
    {
        id: 'math-sprint',
        title: 'Math Sprint',
        description: 'Solve arithmetic problems under pressure. Speed and precision are key.',
        icon: <Timer className="w-8 h-8" />,
        color: 'from-purple-500 to-pink-600',
        ready: true
    },
    {
        id: 'memory-matrix',
        title: 'Memory Matrix',
        description: 'Observe the pattern and repeat it. Sharpen your spatial memory.',
        icon: <Brain className="w-8 h-8" />,
        color: 'from-emerald-500 to-teal-600',
        ready: true
    },
    {
        id: 'lexi-link',
        title: 'Lexi-Link',
        description: 'Unscramble educational terms to improve your vocabulary and logic.',
        icon: <BookOpen className="w-8 h-8" />,
        color: 'from-amber-500 to-orange-600',
        ready: true
    },
    {
        id: 'formula-match',
        title: 'Formula Match',
        description: 'Match terms with their corresponding formulas in this memory challenge.',
        icon: <HelpCircle className="w-8 h-8" />,
        color: 'from-indigo-500 to-violet-600',
        ready: true
    }
]

export default function GameCenterPage() {
    const { isPaid } = useSubscription()

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] relative overflow-hidden">
                <ParticleBackground />

                <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4"
                        >
                            <Gamepad2 className="w-4 h-4" />
                            Game Center
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black gradient-text mb-6"
                        >
                            Train Your Brain
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-readable-muted text-lg max-w-2xl mx-auto"
                        >
                            Exclusive educational games to sharpen your mind and have fun between study sessions.
                        </motion.p>
                    </div>

                    {!isPaid ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center border border-white/10 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                                <Lock className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-readable mb-4">Premium Access Only</h2>
                            <p className="text-readable-muted mb-8 text-lg">
                                The Game Center is an exclusive benefit for our **Standard** and **Premium** users.
                                Upgrade your plan to unlock all brain-training games!
                            </p>
                            <Link
                                href="/subscription"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                View Plans
                                <Trophy className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {games.map((game, index) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-2xl transition-opacity duration-500" />

                                    <div className="relative glass rounded-3xl p-8 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {game.icon}
                                        </div>

                                        <h3 className="text-2xl font-bold text-readable mb-3 group-hover:text-primary transition-colors">
                                            {game.title}
                                        </h3>
                                        <p className="text-readable-muted mb-8 flex-grow">
                                            {game.description}
                                        </p>

                                        {game.ready ? (
                                            <Link
                                                href={`/games/${game.id}`}
                                                className="w-full py-4 text-center bg-white/5 hover:bg-primary text-readable hover:text-white font-bold rounded-xl transition-all duration-300 border border-white/10"
                                            >
                                                Play Now
                                            </Link>
                                        ) : (
                                            <div className="w-full py-4 text-center bg-white/5 text-readable-muted font-bold rounded-xl border border-white/5 cursor-not-allowed">
                                                Coming Soon
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

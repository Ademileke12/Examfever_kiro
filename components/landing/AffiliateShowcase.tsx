'use client'

import { motion } from 'framer-motion'
import { Users, Gift, TrendingUp, Zap, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function AffiliateShowcase() {
    const benefits = [
        {
            title: "Invite Friends",
            description: "Share your unique referral link from your profile dashboard with your network.",
            icon: Users,
            color: "blue"
        },
        {
            title: "They Subscribe",
            description: "When your referral signs up and pays for any subscription plan successfully.",
            icon: Zap,
            color: "purple"
        },
        {
            title: "Earn 13% Commission",
            description: "Receive a one-time 13% commission instantly credited to your affiliate balance.",
            icon: Gift,
            color: "gold"
        },
        {
            title: "Real-time Payouts",
            description: "Track your earnings in real-time and watch your balance grow as you invite more users.",
            icon: TrendingUp,
            color: "green"
        }
    ]

    return (
        <section className="w-full max-w-7xl py-24 md:py-32 px-6 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Side: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                        <Gift className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Affiliate Program</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-[#111114] dark:text-white leading-[1.1] tracking-tight">
                        Invite friends. <br />
                        <span className="gradient-text">Earn rewards.</span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-xl font-medium">
                        Join the ExamFever Affiliate Program and earn a premium commission for every student you bring to the platform.
                        Help others master their exams while you build your earnings.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-110`}>
                                    <benefit.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{benefit.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/register"
                        className="btn-primary group inline-flex items-center justify-center gap-2 px-8 py-4"
                    >
                        Start Earning Now
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {/* Right Side: Showcase Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
                    className="relative"
                >
                    <div className="relative z-10 p-4 md:p-8 glass rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                            src="/affiliate-showcase.png"
                            alt="Affiliate Program"
                            width={800}
                            height={800}
                            className="rounded-[2rem] w-full h-auto shadow-sm"
                        />

                        {/* Overlay Info Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-12 left-12 right-12 p-6 glass rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl hidden md:block"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Commission</p>
                                    <p className="text-3xl font-black text-white">13% <span className="text-sm font-medium text-gray-400 ml-1">Per User</span></p>
                                </div>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-purple-500 bg-gray-800 flex items-center justify-center overflow-hidden">
                                            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" width={40} height={40} />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-purple-500 bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                        +1k
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating Accents */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500 rounded-full blur-[60px] opacity-40 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-30" />
                </motion.div>
            </div>
        </section>
    )
}

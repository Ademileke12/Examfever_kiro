'use client'

import React from 'react'
import { Users, TrendingUp, Wallet, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function AffiliateShowcase() {
    const benefits = [
        {
            icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            title: "Invite Friends",
            description: "Share your unique link",
            color: "bg-blue-500/10",
        },
        {
            icon: <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
            title: "They Subscribe",
            description: "Upgrade to paid plan",
            color: "bg-purple-500/10",
        },
        {
            icon: <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />,
            title: "You Earn 13%",
            description: "Instant cash payout",
            color: "bg-green-500/10",
        }
    ]

    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Content */}
                    <div className="flex-1 max-w-2xl lg:max-w-none text-center lg:text-left mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-8 border border-green-500/20 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 fill-green-500/20" />
                            <span>New Affiliate Program</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            Earn money while <br className="hidden sm:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                                you help others.
                            </span>
                        </h2>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                            Join thousands of students earning passive income.
                            Refer friends to ExamFever and get <span className="font-semibold text-foreground">13% commission</span> instantly for every subscription.
                        </p>

                        {/* Benefit Cards - Mobile: Vertical, Desktop: Horizontal or Grid */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex flex-col items-center lg:items-start p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-center lg:text-left group">
                                    <div className={`p-3 rounded-xl ${benefit.color} mb-3 group-hover:scale-110 transition-transform`}>
                                        {benefit.icon}
                                    </div>
                                    <h3 className="font-semibold text-foreground text-sm mb-1">{benefit.title}</h3>
                                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Start Earning Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/affiliate"
                                className="inline-flex items-center justify-center gap-2 bg-background border border-input hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-xl font-semibold transition-all"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Right Visual - Interactive Card Mockup */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none mx-auto perspective-1000">
                        <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-[4/3] transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2">

                            {/* Dashboard Card - Main */}
                            <div className="absolute inset-4 md:inset-8 bg-[#0F172A] dark:bg-[#0A0A0B] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden z-10">
                                {/* Glow effect */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

                                <div>
                                    <div className="flex justify-between items-start mb-auto">
                                        <div>
                                            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Total Earnings</p>
                                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">₦45,500</h3>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                                            <Wallet className="w-6 h-6 text-emerald-400" />
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between group cursor-default hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                    JD
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">John Doe</p>
                                                    <p className="text-slate-400 text-xs">New Referral</p>
                                                </div>
                                            </div>
                                            <span className="text-emerald-400 font-bold text-sm">+₦455</span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between opacity-60">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                                                    AS
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">Alice Smith</p>
                                                    <p className="text-slate-400 text-xs">Commission</p>
                                                </div>
                                            </div>
                                            <span className="text-emerald-400 font-bold text-sm">+₦455</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-slate-700" />
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                                            +42
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">Active Referrals</p>
                                </div>
                            </div>

                            {/* Floating Elements for Depth */}
                            <div className="absolute -top-2 -left-2 sm:-top-6 sm:-left-6 p-4 bg-white dark:bg-[#1A1A1E] rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 z-20 animate-bounce-slow max-w-[180px] hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Payout Sent!</p>
                                        <p className="text-[10px] text-muted-foreground">To your balance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 -z-10 w-full h-full rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-purple-500/20 blur-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

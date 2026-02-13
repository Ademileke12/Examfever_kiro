'use client'

import { motion } from 'framer-motion'

export function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-2 group ${className}`}>
            <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-violet-500/25 overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                {/* Icon */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white relative z-10"
                >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                        ExamFever
                    </span>
                    {/* Optional Tagline or "Camp" if applicable */}
                    {/* <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
            AI SIMULATOR
          </span> */}
                </div>
            )}
        </div>
    )
}

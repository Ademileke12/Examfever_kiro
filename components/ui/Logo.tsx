'use client'

import { motion } from 'framer-motion'

export function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-3 group ${className}`}>
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#d946ef] via-[#8b5cf6] to-[#0ea5e9] rounded-[14px] flex items-center justify-center shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-violet-500/40 overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 z-20" />

                {/* Icon */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white relative z-10 drop-shadow-sm"
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

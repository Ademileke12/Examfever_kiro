'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function PhoneMockup({ children }: { children: ReactNode }) {
    return (
        <div
            className="relative mx-auto w-full max-w-[300px] md:max-w-[320px]"
            style={{ aspectRatio: '9/19', minHeight: '600px' }}
        >
            <motion.div
                initial={{ rotateY: -10, rotateX: 5 }}
                whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden ring-1 ring-white/10"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
            >
                {/* Screen Content */}
                <div className="absolute inset-0 bg-white dark:bg-black overflow-hidden rounded-[2.5rem]">
                    {children}
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20 flex justify-center items-center">
                    <div className="w-16 h-1 bg-gray-800 rounded-full opacity-50"></div>
                </div>

                {/* Status Bar Mock */}
                <div className="absolute top-2 right-5 z-20 flex gap-1">
                    <div className="w-4 h-4 rounded-full border border-gray-500/30"></div>
                    <div className="w-4 h-4 rounded-full border border-gray-500/30"></div>
                </div>
            </motion.div>

            {/* Glare/Reflection */}
            <div className="absolute inset-0 rounded-[3rem] pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-30" />
        </div>
    )
}

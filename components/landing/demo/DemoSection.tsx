'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'
import { PhoneMockup } from './PhoneMockup'
import { MiniExam } from './MiniExam'

export function DemoSection() {
    const [isOpen, setIsOpen] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    // Auto-collapse when scrolling away
    // threshold: 0.1 means if less than 10% is visible, it's considered "out of view"
    const isInView = useInView(sectionRef, { amount: 0.1 })

    // Track previous inView state to detect "scrolling away"
    useEffect(() => {
        if (!isInView && isOpen) {
            setIsOpen(false)
        }
    }, [isInView, isOpen])

    return (
        <div ref={sectionRef} className="w-full flex flex-col items-center">

            {/* Trigger */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col items-center gap-4 group cursor-pointer outline-none focus:scale-105 transition-transform"
                animate={{ opacity: isOpen ? 0.5 : 1 }}
                whileHover={{ scale: 1.05 }}
            >
                <span className="text-[10px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase group-hover:text-[#7C3AED] transition-colors">
                    {isOpen ? 'Close Demo' : 'Learn More'}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    {isOpen ? (
                        <X className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#7C3AED] animate-bounce" />
                    )}
                </motion.div>
            </motion.button>

            {/* Expandable Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
                        className="overflow-hidden w-full"
                    >
                        <div className="pt-16 pb-8 px-4 flex flex-col items-center">
                            <div className="absolute left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#7C3AED]/0 via-[#7C3AED]/20 to-[#7C3AED] -mt-16" />

                            <div className="mb-8 text-center space-y-2">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    Try it right now
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-gray-500 max-w-md mx-auto"
                                >
                                    Experience our AI-generated questions in a live simulator. No signup required.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="perspective-1000"
                            >
                                <PhoneMockup>
                                    <MiniExam />
                                </PhoneMockup>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

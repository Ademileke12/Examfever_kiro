'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ExamExitModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ExamExitModal({ isOpen, onClose, onConfirm }: ExamExitModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#111114] rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                            Exit Exam?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
                            Your progress will be lost and this session will end. Are you sure you want to exit?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/20"
                            >
                                YES, EXIT EXAM
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all duration-300"
                            >
                                NO, CONTINUE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

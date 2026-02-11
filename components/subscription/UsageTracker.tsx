'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Award, Calendar } from 'lucide-react'

interface UsageTrackerProps {
    uploadsRemaining: number
    uploadsTotal: number
    examsRemaining: number
    examsTotal: number
    expiryDate?: string
    loading?: boolean
}

export const UsageTracker = ({
    uploadsRemaining,
    uploadsTotal,
    examsRemaining,
    examsTotal,
    expiryDate,
    loading
}: UsageTrackerProps) => {
    const getProgress = (remaining: number, total: number) => {
        if (total === 0) return 0
        return Math.min(((total - remaining) / total) * 100, 100)
    }

    const uploadProgress = getProgress(uploadsRemaining, uploadsTotal)
    const examProgress = getProgress(examsRemaining, examsTotal)

    if (loading) {
        return (
            <div className="glass rounded-3xl p-6 animate-pulse space-y-4">
                <div className="h-4 bg-readable/10 rounded w-1/3"></div>
                <div className="space-y-2">
                    <div className="h-8 bg-readable/5 rounded"></div>
                    <div className="h-2 bg-readable/5 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="glass rounded-3xl p-6 border border-white/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calendar className="w-24 h-24" />
            </div>

            <h3 className="text-sm font-semibold text-readable-muted mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Subscription Usage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Uploads Counter */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-readable">PDF Uploads</span>
                        </div>
                        <span className="text-lg font-bold text-readable">
                            {uploadsRemaining} <span className="text-readable-muted text-xs font-normal">/ {uploadsTotal}</span>
                        </span>
                    </div>
                    <div className="h-2 bg-readable/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - uploadProgress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        />
                    </div>
                </div>

                {/* Exams Counter */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Award className="w-4 h-4 text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-readable">Exams Remaining</span>
                        </div>
                        <span className="text-lg font-bold text-readable">
                            {examsRemaining} <span className="text-readable-muted text-xs font-normal">/ {examsTotal}</span>
                        </span>
                    </div>
                    <div className="h-2 bg-readable/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - examProgress}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {expiryDate && (
                <div className="mt-6 pt-4 border-t border-readable/5 flex items-center justify-between">
                    <span className="text-xs text-readable-light">Subscription Expiry</span>
                    <span className="text-xs font-bold text-readable">
                        {new Date(expiryDate).toLocaleDateString()}
                    </span>
                </div>
            )}
        </div>
    )
}

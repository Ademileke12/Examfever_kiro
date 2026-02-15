'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, RotateCcw, Zap, CheckCircle2, XCircle, ChevronLeft, Percent } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Problem {
    text: string
    answer: number
}

export default function MathSprintGame() {
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
    const [userInput, setUserInput] = useState("")
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const [isActive, setIsActive] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [multiplier, setMultiplier] = useState(1)
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
    const [totalAttempted, setTotalAttempted] = useState(0)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const generateProblem = useCallback(() => {
        const operators = ['+', '-', '*']
        const operator = operators[Math.floor(Math.random() * operators.length)]

        let a, b
        if (operator === '+') {
            a = Math.floor(Math.random() * 50) + 1
            b = Math.floor(Math.random() * 50) + 1
        } else if (operator === '-') {
            a = Math.floor(Math.random() * 50) + 20
            b = Math.floor(Math.random() * a) + 1
        } else {
            a = Math.floor(Math.random() * 12) + 1
            b = Math.floor(Math.random() * 12) + 1
        }

        const answer = operator === '+' ? a + b : operator === '-' ? a - b : a * b
        setCurrentProblem({ text: `${a} ${operator} ${b}`, answer })
        setUserInput("")
    }, [])

    const startGame = () => {
        setScore(0)
        setTimeLeft(60)
        setIsActive(true)
        setIsFinished(false)
        setMultiplier(1)
        setConsecutiveCorrect(0)
        setTotalAttempted(0)
        setCorrectAnswers(0)
        generateProblem()
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    useEffect(() => {
        let interval: any
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            setIsFinished(true)
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setUserInput(val)

        if (currentProblem && parseInt(val) === currentProblem.answer) {
            // Correct!
            const points = 10 * multiplier
            setScore((prev) => prev + points)
            setCorrectAnswers((prev) => prev + 1)
            setTotalAttempted((prev) => prev + 1)

            const newConsecutive = consecutiveCorrect + 1
            setConsecutiveCorrect(newConsecutive)

            // Multiplier logic
            if (newConsecutive >= 10) setMultiplier(3)
            else if (newConsecutive >= 5) setMultiplier(2)

            generateProblem()
        } else if (currentProblem && val.length >= currentProblem.answer.toString().length && parseInt(val) !== currentProblem.answer) {
            // Potentially wrong if length matches but value doesn't
            // However, we only mark as wrong if they enter enough digits
            if (val.length > currentProblem.answer.toString().length) {
                setTotalAttempted((prev) => prev + 1)
                setConsecutiveCorrect(0)
                setMultiplier(1)
                generateProblem()
            }
        }
    }

    const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 100

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] relative overflow-hidden flex flex-col">
                <ParticleBackground />

                {/* Header */}
                <div className="relative z-10 px-6 pt-24 pb-8 max-w-4xl mx-auto w-full">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-readable-muted hover:text-primary transition-colors mb-8 font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Game Center
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <Timer className="w-6 h-6 text-purple-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Math Sprint</h1>
                            </div>
                            <p className="text-readable-muted">How many problems can you solve in 60 seconds?</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
                                <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">Time</span>
                                <span className={`text-xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-readable'}`}>{timeLeft}s</span>
                            </div>
                            <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex flex-col items-center min-w-[100px] bg-primary/5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Score</span>
                                <span className="text-xl font-black text-primary">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Area */}
                    {!isActive && !isFinished ? (
                        <div className="glass rounded-3xl p-12 border border-white/10 shadow-2xl text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                                <Zap className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-readable mb-4">Ready to Sprint?</h2>
                            <p className="text-readable-muted mb-8 max-w-md mx-auto">
                                Solve arithmetic problems quickly. Correct streaks increase your multiplier!
                            </p>
                            <button
                                onClick={startGame}
                                className="px-12 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Start Game
                            </button>
                        </div>
                    ) : isActive ? (
                        <div className="relative glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl mb-8">
                            {/* Multiplier Badge */}
                            <div className="absolute top-6 right-6 flex flex-col items-end">
                                <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter transition-all ${multiplier > 1 ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/5 text-readable-muted'}`}>
                                    {multiplier}x Combo
                                </div>
                                <div className="flex gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${i < (consecutiveCorrect % 5) ? 'bg-primary' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center py-12">
                                <motion.div
                                    key={currentProblem?.text}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-6xl md:text-8xl font-black text-readable mb-12 tabular-nums"
                                >
                                    {currentProblem?.text}
                                </motion.div>

                                <input
                                    ref={inputRef}
                                    type="number"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className="w-full max-w-xs bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-4xl text-readable focus:outline-none focus:border-primary/50 transition-all text-center tabular-nums"
                                    placeholder="?"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    ) : null}

                    {isFinished && (
                        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Trophy className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-black text-readable mb-2">Time's Up!</h2>
                            <p className="text-readable-muted mb-8">Fantastic effort in the Math Sprint!</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <span className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Final Score</span>
                                    <span className="text-3xl font-black text-readable">{score}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <span className="block text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Answered</span>
                                    <span className="text-3xl font-black text-readable">{correctAnswers}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Accuracy</span>
                                    <span className="text-3xl font-black text-readable">{accuracy}%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={startGame}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                >
                                    Try Again
                                </button>
                                <Link
                                    href="/games"
                                    className="w-full py-4 glass glass-hover border border-white/10 text-readable rounded-xl font-bold transition-all"
                                >
                                    Back to Library
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

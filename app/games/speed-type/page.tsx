'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, Trophy, RotateCcw, Timer, Zap, CheckCircle2, ChevronLeft } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

const EDUCATIONAL_SENTENCES = [
    "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients.",
    "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
    "Mitosis is a type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
    "The Great Depression was a severe worldwide economic depression that took place mostly during the 1930s, beginning in the United States.",
    "In chemistry, a covalent bond is a chemical bond that involves the sharing of electron pairs between atoms.",
    "Elasticity in economics is a measure of the responsiveness of quantity demanded or quantity supplied to a change in one of its determinants.",
    "Stalactites are icicle-shaped formations that hang from the ceiling of a cave and are produced by precipitation of minerals from water.",
    "Kinetic energy is the energy that an object possesses due to its motion, defined as the work needed to accelerate a body of a given mass from rest.",
    "The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth following the Middle Ages.",
    "Binary search is an efficient algorithm for finding an item from a sorted list of items by repeatedly dividing the search interval in half."
]

export default function SpeedTypeGame() {
    const [targetSentence, setTargetSentence] = useState("")
    const [userInput, setUserInput] = useState("")
    const [timeLeft, setTimeLeft] = useState(60)
    const [isActive, setIsActive] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [totalCorrectChars, setTotalCorrectChars] = useState(0)
    const [totalTypedChars, setTotalTypedChars] = useState(0)
    const [score, setScore] = useState(0)
    const [accuracy, setAccuracy] = useState(100)
    const [wpm, setWpm] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const startNewGame = useCallback(() => {
        const randomSentence = EDUCATIONAL_SENTENCES[Math.floor(Math.random() * EDUCATIONAL_SENTENCES.length)] || ""
        setTargetSentence(randomSentence)
        setUserInput("")
        setTimeLeft(60)
        setIsActive(false)
        setIsFinished(false)
        setTotalCorrectChars(0)
        setTotalTypedChars(0)
        setScore(0)
        setAccuracy(100)
        setWpm(0)
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    const nextSentence = useCallback(() => {
        const randomSentence = EDUCATIONAL_SENTENCES[Math.floor(Math.random() * EDUCATIONAL_SENTENCES.length)] || ""
        setTargetSentence(randomSentence)
        setUserInput("")
        setTimeout(() => inputRef.current?.focus(), 10)
    }, [])

    useEffect(() => {
        startNewGame()
    }, [startNewGame])

    useEffect(() => {
        let interval: any
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false)
            setIsFinished(true)
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        if (isFinished) return

        if (!isActive && val.length > 0) {
            setIsActive(true)
        }

        setUserInput(val)

        // Calculate stats for the entire session
        const newTotalTyped = totalTypedChars + 1
        setTotalTypedChars(newTotalTyped)

        if (val[val.length - 1] === targetSentence[val.length - 1]) {
            setTotalCorrectChars(prev => prev + 1)
        }

        // Calculate accuracy
        const currentAccuracy = Math.round((totalCorrectChars / Math.max(1, totalTypedChars)) * 100)
        setAccuracy(currentAccuracy)

        // Calculate WPM (5 chars = 1 word)
        const timeElapsed = (60 - timeLeft) / 60
        if (timeElapsed > 0) {
            const currentWpm = Math.round((totalCorrectChars / 5) / timeElapsed)
            setWpm(currentWpm)
        }

        // Check if current sentence is finished
        if (val === targetSentence) {
            setScore(prev => prev + targetSentence.split(' ').length * 10)
            nextSentence()
        }
    }

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
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Keyboard className="w-6 h-6 text-blue-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Speed Type</h1>
                            </div>
                            <p className="text-readable-muted">Type as many sentences as possible in 60 seconds.</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
                                <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">Time Left</span>
                                <span className={`text-xl font-black ${timeLeft < 10 && isActive ? 'text-red-500 animate-pulse' : 'text-readable'}`}>
                                    {timeLeft}s
                                </span>
                            </div>
                            <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex flex-col items-center min-w-[100px] bg-primary/5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">WPM</span>
                                <span className="text-xl font-black text-primary">{wpm}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="relative glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl mb-8">
                        <div className="relative mb-8 min-h-[140px] flex items-center justify-center">
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-readable tracking-wide text-center">
                                {targetSentence.split("").map((char, i) => {
                                    let color = "text-readable-muted"
                                    if (i < userInput.length) {
                                        color = userInput[i] === char ? "text-primary font-bold" : "text-red-500 bg-red-500/10 rounded"
                                    }
                                    return (
                                        <span key={i} className={`${color} transition-colors duration-200`}>
                                            {char}
                                        </span>
                                    )
                                })}
                            </p>
                        </div>

                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                disabled={isFinished}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-xl text-readable focus:outline-none focus:border-primary/50 transition-all text-center placeholder:text-readable-muted/30"
                                placeholder={!isActive && !isFinished ? "Start typing to begin..." : ""}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={startNewGame}
                            className="px-8 py-4 glass glass-hover border border-white/10 rounded-2xl font-bold text-readable flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset Game
                        </button>
                    </div>
                </div>

                {/* Results Modal */}
                <AnimatePresence>
                    {isFinished && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md bg-white dark:bg-[#111114] rounded-3xl p-8 border border-white/10 shadow-2xl text-center"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Trophy className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-readable mb-2">Well Done!</h2>
                                <p className="text-readable-muted mb-8">You've successfully completed the brain trainer.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center justify-center gap-2 text-primary mb-1">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Speed</span>
                                        </div>
                                        <div className="text-2xl font-black text-readable">{wpm} WPM</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy</span>
                                        </div>
                                        <div className="text-2xl font-black text-readable">{accuracy}%</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={startNewGame}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        Play Again
                                    </button>
                                    <Link
                                        href="/games"
                                        className="w-full py-4 glass glass-hover border border-white/10 text-readable rounded-xl font-bold transition-all"
                                    >
                                        Back to Selection
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    )
}

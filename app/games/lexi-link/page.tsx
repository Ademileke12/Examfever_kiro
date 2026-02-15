'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Trophy, RotateCcw, Zap, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

const EDUCATIONAL_WORDS = [
    { word: "PHOTOSYSTEM", hint: "Component of photosynthesis containing chlorophyll." },
    { word: "HYPOTENUSE", hint: "The longest side of a right-angled triangle." },
    { word: "MITOCHONDRIA", hint: "The powerhouse of the cell." },
    { word: "RENAISSANCE", hint: "Period of cultural rebirth in Europe." },
    { word: "CAPITALISM", hint: "Economic system based on private ownership." },
    { word: "OSMOSIS", hint: "Movement of water across a semi-permeable membrane." },
    { word: "ALGORITHM", hint: "A sequence of instructions for a computer." },
    { word: "DEMOCRACY", hint: "Government by the people." },
    { word: "VELOCITY", hint: "Speed of an object in a specific direction." },
    { word: "METAPHOR", hint: "A figure of speech comparing two unlike things." }
]

export default function LexiLinkGame() {
    const [currentWord, setCurrentWord] = useState({ word: "", hint: "" })
    const [scrambled, setScrambled] = useState("")
    const [userInput, setUserInput] = useState("")
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [isFinished, setIsFinished] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [message, setMessage] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const scrambleWord = (word: string) => {
        return word
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("")
    }

    const nextWord = useCallback(() => {
        const wordObj = EDUCATIONAL_WORDS[Math.floor(Math.random() * EDUCATIONAL_WORDS.length)]
        if (!wordObj) return
        setCurrentWord(wordObj)
        setScrambled(scrambleWord(wordObj.word))
        setUserInput("")
        setShowHint(false)
        setMessage("")
        setIsFinished(false)
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    useEffect(() => {
        nextWord()
    }, [nextWord])

    const handleCheck = () => {
        if (userInput.toUpperCase() === currentWord.word) {
            setScore((prev) => prev + (showHint ? 5 : 10))
            setLevel((prev) => prev + 1)
            setMessage("Correct! +10 Points")
            setTimeout(nextWord, 1000)
        } else {
            setMessage("Try again!")
            setTimeout(() => setMessage(""), 2000)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] relative overflow-hidden flex flex-col font-sans">
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
                                <div className="p-3 bg-amber-500/10 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-amber-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Lexi-Link</h1>
                            </div>
                            <p className="text-readable-muted">Unscramble the educational term to win points.</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">Level</span>
                                <span className="text-xl font-black text-readable">{level}</span>
                            </div>
                            <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex flex-col items-center min-w-[100px] bg-primary/5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Score</span>
                                <span className="text-xl font-black text-primary">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="relative glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl mb-8 flex flex-col items-center">
                        <motion.div
                            key={scrambled}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-wrap gap-2 md:gap-4 justify-center mb-12"
                        >
                            {scrambled.split("").map((char, i) => (
                                <div
                                    key={i}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-readable shadow-lg"
                                >
                                    {char}
                                </div>
                            ))}
                        </motion.div>

                        <div className="w-full max-w-md space-y-6">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-2xl text-readable focus:outline-none focus:border-primary/50 transition-all text-center placeholder:text-readable-muted/30 uppercase tracking-[0.2em]"
                                    placeholder="Your Answer..."
                                    autoComplete="off"
                                />

                                <AnimatePresence>
                                    {message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute -bottom-10 left-0 right-0 text-center font-bold ${message.includes("Correct") ? 'text-green-500' : 'text-red-500'}`}
                                        >
                                            {message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleCheck}
                                    className="flex-grow py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Check Answer
                                </button>
                                <button
                                    onClick={() => setShowHint(true)}
                                    disabled={showHint}
                                    className="px-6 py-4 glass border border-white/10 text-readable rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 hover:text-amber-500"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Hint
                                </button>
                            </div>

                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center"
                                >
                                    <p className="text-amber-600 dark:text-amber-500 text-sm font-medium">
                                        <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">Clue</span>
                                        "{currentWord.hint}"
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={nextWord}
                            className="px-8 py-4 glass glass-hover border border-white/10 rounded-2xl font-bold text-readable flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Skip Word
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

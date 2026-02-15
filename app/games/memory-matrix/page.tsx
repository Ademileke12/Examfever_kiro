'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Trophy, RotateCcw, Zap, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

const GRID_SIZE = 4
const INITIAL_TILES = 3

export default function MemoryMatrixGame() {
    const [grid, setGrid] = useState<number[]>([])
    const [targetPattern, setTargetPattern] = useState<Set<number>>(new Set())
    const [userPattern, setUserPattern] = useState<Set<number>>(new Set())
    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)
    const [isShowingPattern, setIsShowingPattern] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'wrong' | 'next' | 'finished'>('idle')
    const [tilesToShow, setTilesToShow] = useState(INITIAL_TILES)

    const generatePattern = useCallback((numTiles: number) => {
        const newPattern = new Set<number>()
        while (newPattern.size < numTiles) {
            newPattern.add(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)))
        }
        setTargetPattern(newPattern)
        setUserPattern(new Set())
        setIsShowingPattern(true)
        setGameStatus('playing')

        setTimeout(() => {
            setIsShowingPattern(false)
        }, 1500 + (numTiles * 200)) // Give more time for harder patterns
    }, [])

    const startGame = () => {
        setLevel(1)
        setScore(0)
        setTilesToShow(INITIAL_TILES)
        setIsFinished(false)
        generatePattern(INITIAL_TILES)
    }

    const handleTileClick = (index: number) => {
        if (isShowingPattern || isFinished || gameStatus !== 'playing') return

        if (targetPattern.has(index)) {
            const newUserPattern = new Set(userPattern).add(index)
            setUserPattern(newUserPattern)

            if (newUserPattern.size === targetPattern.size) {
                // Level Complete!
                setScore((prev) => prev + (level * 10))
                setGameStatus('next')

                setTimeout(() => {
                    const nextLevel = level + 1
                    const nextTiles = INITIAL_TILES + Math.floor(nextLevel / 2)
                    const cappedTiles = Math.min(nextTiles, (GRID_SIZE * GRID_SIZE) - 2)

                    setLevel(nextLevel)
                    setTilesToShow(cappedTiles)
                    generatePattern(cappedTiles)
                }, 1000)
            }
        } else {
            // Wrong Tile!
            setGameStatus('wrong')
            setIsFinished(true)
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
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <Brain className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Memory Matrix</h1>
                            </div>
                            <p className="text-readable-muted">Memorize the pattern and repeat it. Don't miss a tile!</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
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
                    <div className="flex flex-col items-center justify-center py-8">
                        {gameStatus === 'idle' ? (
                            <div className="glass rounded-3xl p-12 border border-white/10 shadow-2xl text-center max-w-md w-full">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                                    <Zap className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-readable mb-4">Focus Up!</h2>
                                <p className="text-readable-muted mb-8 text-lg">
                                    Watch the tiles light up, and then tap the exact same ones.
                                </p>
                                <button
                                    onClick={startGame}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                >
                                    Start Game
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Status Overlay */}
                                <AnimatePresence>
                                    {gameStatus === 'next' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
                                        >
                                            <div className="bg-green-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
                                                <CheckCircle2 className="w-8 h-8" />
                                                <span className="text-2xl font-black uppercase italic">Perfect!</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    {gameStatus === 'wrong' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
                                        >
                                            <div className="bg-red-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
                                                <XCircle className="w-8 h-8" />
                                                <span className="text-2xl font-black uppercase italic">Wrong!</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div
                                    className={`grid grid-cols-4 gap-3 md:gap-4 glass p-6 md:p-8 rounded-[2.5rem] border transition-all duration-300 select-none ${gameStatus === 'wrong' ? 'border-red-500 shadow-lg shadow-red-500/20 translate-x-1' : 'border-white/10 active:scale-95'
                                        }`}
                                    style={{ width: 'min(90vw, 450px)', height: 'min(90vw, 450px)' }}
                                >
                                    {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
                                        const isTarget = targetPattern.has(i)
                                        const isCorrect = userPattern.has(i)

                                        let tileColor = 'bg-white/5 dark:bg-white/5 border-white/5'
                                        if (isShowingPattern && isTarget) {
                                            tileColor = 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
                                        } else if (!isShowingPattern && isCorrect) {
                                            tileColor = 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                        } else if (gameStatus === 'wrong' && isTarget) {
                                            tileColor = 'bg-emerald-500/40 border-emerald-500/20'
                                        }

                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={{ scale: !isShowingPattern && !isFinished ? 1.05 : 1 }}
                                                whileTap={{ scale: !isShowingPattern && !isFinished ? 0.95 : 1 }}
                                                onClick={() => handleTileClick(i)}
                                                className={`w-full h-full rounded-2xl md:rounded-3xl border transition-all duration-300 relative overflow-hidden ${tileColor}`}
                                                disabled={isShowingPattern || isFinished || isCorrect}
                                            >
                                                {isShowingPattern && isTarget && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1.5, opacity: 0 }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                        className="absolute inset-0 bg-white/40 rounded-full"
                                                    />
                                                )}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={startGame}
                            className="px-8 py-4 glass glass-hover border border-white/10 rounded-2xl font-bold text-readable flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset Level
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
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Trophy className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black text-readable mb-2">Memory Expired</h2>
                                <p className="text-readable-muted mb-8">You reached level {level} with a score of {score}.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Final Score</span>
                                        <div className="text-2xl font-black text-readable">{score}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Max Level</span>
                                        <div className="text-2xl font-black text-readable">{level}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={startGame}
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

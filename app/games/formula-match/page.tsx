'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, RotateCcw, ChevronLeft, HelpCircle, CheckCircle2 } from 'lucide-react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Card {
    id: string
    content: string
    matchId: string
    isFlipped: boolean
    isMatched: boolean
}

const PAIRS = [
    { term: "Force", formula: "F = ma" },
    { term: "Energy", formula: "E = mc²" },
    { term: "Circle Area", formula: "πr²" },
    { term: "Density", formula: "ρ = m/V" },
    { term: "Ohm's Law", formula: "V = IR" },
    { term: "Slope", formula: "y = mx + b" }
]

export default function FormulaMatchGame() {
    const [cards, setCards] = useState<Card[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [matches, setMatches] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [score, setScore] = useState(0)

    const initializeGame = useCallback(() => {
        const gameCards: Card[] = []
        PAIRS.forEach((pair, index) => {
            // Add term card
            gameCards.push({
                id: `term-${index}`,
                content: pair.term,
                matchId: `pair-${index}`,
                isFlipped: false,
                isMatched: false
            })
            // Add formula card
            gameCards.push({
                id: `formula-${index}`,
                content: pair.formula,
                matchId: `pair-${index}`,
                isFlipped: false,
                isMatched: false
            })
        })

        // Shuffle
        const shuffledCards = gameCards
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, index }))

        setCards(shuffledCards)
        setFlippedCards([])
        setMoves(0)
        setMatches(0)
        setIsFinished(false)
        setScore(0)
    }, [])

    useEffect(() => {
        initializeGame()
    }, [initializeGame])

    const handleCardClick = (index: number) => {
        const card = cards[index]
        if (!card || flippedCards.length === 2 || card.isFlipped || card.isMatched) return

        const newCards = [...cards]
        const targetCard = newCards[index]
        if (targetCard) {
            targetCard.isFlipped = true
            setCards(newCards)
        }

        const newFlipped = [...flippedCards, index]
        setFlippedCards(newFlipped)

        if (newFlipped.length === 2) {
            setMoves((prev) => prev + 1)
            const firstIndex = newFlipped[0]
            const secondIndex = newFlipped[1]

            if (typeof firstIndex === 'number' && typeof secondIndex === 'number') {
                const firstCard = cards[firstIndex]
                const secondCard = cards[secondIndex]

                if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
                    // Match!
                    setTimeout(() => {
                        const matchedCards = [...cards]
                        if (matchedCards[firstIndex]) matchedCards[firstIndex].isMatched = true
                        if (matchedCards[secondIndex]) matchedCards[secondIndex].isMatched = true
                        setCards(matchedCards)
                        setFlippedCards([])
                        setMatches((prev) => prev + 1)
                        setScore((prev) => prev + 20)

                        if (matches + 1 === PAIRS.length) {
                            setIsFinished(true)
                        }
                    }, 600)
                } else {
                    // No match
                    setTimeout(() => {
                        const resetCards = [...cards]
                        if (resetCards[firstIndex]) resetCards[firstIndex].isFlipped = false
                        if (resetCards[secondIndex]) resetCards[secondIndex].isFlipped = false
                        setCards(resetCards)
                        setFlippedCards([])
                    }, 1200)
                }
            }
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
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <HelpCircle className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Formula Match</h1>
                            </div>
                            <p className="text-readable-muted">Test your memory and match terms with their academic formulas.</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">Moves</span>
                                <span className="text-xl font-black text-readable">{moves}</span>
                            </div>
                            <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex flex-col items-center min-w-[100px] bg-primary/5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Matches</span>
                                <span className="text-xl font-black text-primary">{matches}/{PAIRS.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 mb-12 select-none">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                whileHover={{ scale: !card.isMatched ? 1.05 : 1 }}
                                whileTap={{ scale: !card.isMatched ? 0.95 : 1 }}
                                onClick={() => handleCardClick(index)}
                                className="perspective-1000 aspect-[3/4] md:aspect-square cursor-pointer"
                            >
                                <div
                                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                                        }`}
                                >
                                    {/* Front (Back of card) */}
                                    <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl backface-hidden flex items-center justify-center p-4">
                                        <Zap className="w-6 h-6 md:w-10 md:h-10 text-slate-300 dark:text-slate-700" />
                                    </div>

                                    {/* Back (Content face) */}
                                    <div className={`absolute inset-0 border-2 rounded-2xl md:rounded-3xl backface-hidden rotate-y-180 flex items-center justify-center p-4 text-center ${card.isMatched
                                        ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400'
                                        : 'bg-white dark:bg-[#111114] border-primary text-primary'
                                        }`}>
                                        <span className="text-xs md:text-sm font-black uppercase tracking-tight leading-tight">
                                            {card.content}
                                        </span>
                                        {card.isMatched && (
                                            <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={initializeGame}
                            className="px-8 py-4 glass glass-hover border border-white/10 rounded-2xl font-bold text-readable flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset Cards
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
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Trophy className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h2 className="text-3xl font-black text-readable mb-2">Genius Level!</h2>
                                <p className="text-readable-muted mb-8">You matched all formulas in {moves} moves.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Final Score</span>
                                        <div className="text-2xl font-black text-readable">{score}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <span className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Moves</span>
                                        <div className="text-2xl font-black text-readable">{moves}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={initializeGame}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        Play Again
                                    </button>
                                    <Link
                                        href="/games"
                                        className="w-full py-4 glass glass-hover border border-white/10 text-readable rounded-xl font-bold transition-all"
                                    >
                                        Back to Library
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </ProtectedRoute>
    )
}

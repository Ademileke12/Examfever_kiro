'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Chess, Square, Move } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, RotateCcw, Trophy, Zap, Info, Cpu, User } from 'lucide-react'
import Link from 'next/link'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// --- AI Logic (Minimax with Alpha-Beta Pruning) ---

const PIECE_VALUES: Record<string, number> = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
}

const evaluateBoard = (game: Chess) => {
    let totalEvaluation = 0
    const board = game.board()

    for (let i = 0; i < 8; i++) {
        const row = board[i]
        if (!row) continue
        for (let j = 0; j < 8; j++) {
            const piece = row[j]
            if (piece) {
                const value = PIECE_VALUES[piece.type] || 0
                totalEvaluation += (piece.color === 'w' ? value : -value)
            }
        }
    }
    return totalEvaluation
}

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0) return -evaluateBoard(game)

    const moves = game.moves()
    if (moves.length === 0) {
        if (game.isCheckmate()) return isMaximizing ? -9999 : 9999
        return 0
    }

    if (isMaximizing) {
        let bestScore = -Infinity
        for (const move of moves) {
            game.move(move)
            bestScore = Math.max(bestScore, minimax(game, depth - 1, alpha, beta, !isMaximizing))
            game.undo()
            alpha = Math.max(alpha, bestScore)
            if (beta <= alpha) break
        }
        return bestScore
    } else {
        let bestScore = Infinity
        for (const move of moves) {
            game.move(move)
            bestScore = Math.min(bestScore, minimax(game, depth - 1, alpha, beta, !isMaximizing))
            game.undo()
            beta = Math.min(beta, bestScore)
            if (beta <= alpha) break
        }
        return bestScore
    }
}

const getBestMove = (game: Chess) => {
    const moves = game.moves()
    let bestMove = null
    let bestScore = -Infinity

    // Sort moves to help pruning (captures first)
    const sortedMoves = moves.sort((a, b) => {
        if (a.includes('x') && !b.includes('x')) return -1
        if (!a.includes('x') && b.includes('x')) return 1
        return 0
    })

    for (const move of sortedMoves) {
        game.move(move)
        const score = minimax(game, 2, -Infinity, Infinity, false) // Depth 3 for "Medium"
        game.undo()

        if (score > bestScore) {
            bestScore = score
            bestMove = move
        }
    }
    return bestMove
}

// --- Piece SVGs ---

const PIECE_IMAGES: Record<string, string> = {
    wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
}

export default function ChessGame() {
    const [game, setGame] = useState(new Chess())
    const [moveFrom, setMoveFrom] = useState<Square | null>(null)
    const [isFinished, setIsFinished] = useState(false)
    const [winner, setWinner] = useState<string | null>(null)
    const [history, setHistory] = useState<string[]>([])
    const [isAiThinking, setIsAiThinking] = useState(false)

    const board = useMemo(() => game.board(), [game])

    const makeMove = useCallback((move: any) => {
        try {
            const result = game.move(move)
            if (result) {
                setGame(new Chess(game.fen()))
                setHistory(prev => [...prev, result.san])
                return true
            }
        } catch (e) {
            return false
        }
        return false
    }, [game])

    const onSquareClick = (square: Square) => {
        if (game.turn() !== 'w' || isFinished) return

        if (moveFrom) {
            const move = makeMove({ from: moveFrom, to: square, promotion: 'q' })
            setMoveFrom(null)
            if (move) {
                // Check if game ended
                if (game.isGameOver()) {
                    setIsFinished(true)
                    setWinner(game.isDraw() ? 'Draw' : 'You')
                } else {
                    // AI Turn
                    setIsAiThinking(true)
                    setTimeout(() => {
                        const aiMove = getBestMove(game)
                        if (aiMove) {
                            makeMove(aiMove)
                            if (game.isGameOver()) {
                                setIsFinished(true)
                                setWinner(game.isDraw() ? 'Draw' : 'AI')
                            }
                        }
                        setIsAiThinking(false)
                    }, 500)
                }
            }
        } else {
            const piece = game.get(square)
            if (piece && piece.color === 'w') {
                setMoveFrom(square)
            }
        }
    }

    const resetGame = () => {
        setGame(new Chess())
        setMoveFrom(null)
        setIsFinished(false)
        setWinner(null)
        setHistory([])
        setIsAiThinking(false)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] relative overflow-hidden flex flex-col">
                <ParticleBackground />

                <div className="relative z-10 px-6 pt-24 pb-8 max-w-6xl mx-auto w-full">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-readable-muted hover:text-primary transition-colors mb-8 font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Game Center
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Game Section */}
                        <div className="lg:col-span-12 xl:col-span-8 flex flex-col items-center">
                            <div className="flex items-center gap-4 mb-8 w-full">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Cpu className="w-6 h-6 text-blue-500" />
                                </div>
                                <h1 className="text-3xl font-black text-readable">Chess Strategy</h1>
                                {isAiThinking && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-primary text-sm font-bold animate-pulse"
                                    >
                                        AI is thinking...
                                    </motion.span>
                                )}
                            </div>

                            {/* Board wrapper for square responsiveness */}
                            <div className="relative glass p-4 md:p-6 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-[600px] aspect-square">
                                <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                                    {board.map((row, i) =>
                                        row.map((piece, j) => {
                                            const square = `${String.fromCharCode(97 + j)}${8 - i}` as Square
                                            const isLight = (i + j) % 2 === 0
                                            const isSelected = moveFrom === square

                                            return (
                                                <div
                                                    key={square}
                                                    onClick={() => onSquareClick(square)}
                                                    className={`relative flex items-center justify-center cursor-pointer transition-colors duration-200 ${isLight ? 'bg-[#EBECD0] dark:bg-[#3d3d45]' : 'bg-[#779556] dark:bg-[#2d2d34]'
                                                        } ${isSelected ? 'ring-4 ring-primary ring-inset' : ''}`}
                                                >
                                                    {piece && (
                                                        <motion.div
                                                            layoutId={piece.type + piece.color + square}
                                                            className="w-[80%] h-[80%] z-10"
                                                        >
                                                            <img
                                                                src={PIECE_IMAGES[`${piece.color}${piece.type.toUpperCase()}`]}
                                                                alt={`${piece.color} ${piece.type}`}
                                                                className="w-full h-full select-none"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    {/* Coordinates for mobile/small boards */}
                                                    {j === 0 && <span className={`absolute top-0.5 left-0.5 text-[8px] font-bold ${isLight ? 'text-[#779556]' : 'text-[#EBECD0]'}`}>{8 - i}</span>}
                                                    {i === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold ${isLight ? 'text-[#779556]' : 'text-[#EBECD0]'}`}>{String.fromCharCode(97 + j)}</span>}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats & History */}
                        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-readable uppercase tracking-widest">Match Status</h3>
                                    <button onClick={resetGame} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <RotateCcw className="w-5 h-5 text-readable-muted" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                                        <User className="w-5 h-5 text-primary mb-2" />
                                        <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">You</span>
                                        <span className="text-xl font-black text-readable">{game.turn() === 'w' ? 'Your Turn' : '-'}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                                        <Cpu className="w-5 h-5 text-emerald-500 mb-2" />
                                        <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">AI</span>
                                        <span className="text-xl font-black text-readable">{game.turn() === 'b' ? 'Thinking...' : '-'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-readable-muted uppercase tracking-widest">Move History</span>
                                    <div className="bg-black/10 dark:bg-black/40 rounded-xl p-4 h-48 overflow-y-auto font-mono text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                                        {history.map((move, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="text-readable-muted/50">{Math.floor(i / 2) + 1}.</span>
                                                <span className="text-readable font-bold">{move}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-4">
                                    <Info className="w-5 h-5 text-primary shrink-0" />
                                    <p className="text-xs text-readable-muted leading-relaxed">
                                        Standard Chess rules apply. Promotion defaults to Queen.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                <h2 className="text-3xl font-black text-readable mb-2">{winner === 'AI' ? 'Game Over' : 'Victory!'}</h2>
                                <p className="text-readable-muted mb-8">
                                    {winner === 'AI' ? 'The AI was too strong this time.' : 'You mastered the board!'}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={resetGame}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        New Game
                                    </button>
                                    <Link
                                        href="/games"
                                        className="w-full py-4 glass glass-hover border border-white/10 text-readable rounded-xl font-bold transition-all"
                                    >
                                        Back to Hub
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

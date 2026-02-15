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

// --- Piece SVGs (Inline for reliability) ---

const Piece = ({ type, color }: { type: string, color: string }) => {
    const isWhite = color === 'w'
    const fill = isWhite ? '#FFFFFF' : '#000000'
    const stroke = isWhite ? '#000000' : '#FFFFFF'

    const pieces: Record<string, React.ReactNode> = {
        p: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            </svg>
        ),
        n: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <path d="M24 18c.32 1.2 1 3.5-1 3.5" fill="none" stroke={stroke} strokeWidth="1.5" />
                <path d="M9.5 25.5A.5.5 0 1 1 9 25.5a.5.5 0 1 1 .5 0" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <path d="M15 15.5c4.5 2 7.5-1 14.5-5.5-2 9-5 13-10.5 16" fill={fill} stroke={stroke} strokeWidth="1.5" />
            </svg>
        ),
        b: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g fill={fill} strokeLinecap="butt">
                        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.49-10.11-1.89-13.5 1-3.39-2.89-10.11-1.49-13.5-1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
                        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
                    </g>
                    <path d="M17.5 26h10M15 30h15" strokeLinecap="butt" />
                </g>
            </svg>
        ),
        r: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <g fill={fill} fillRule="evenodd" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
                    <path d="M34 14l-3 3H14l-3-3" />
                    <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter" />
                    <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
                    <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
                </g>
            </svg>
        ),
        q: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <g fill={fill} fillRule="evenodd" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
                    <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5L16 11v14.5L9 14l2 12z" strokeLinecap="butt" />
                    <path d="M9 26c0 2 1.5 2 2.5 4 2.5-1 10 1 12.5-1 2.5 1 10-1 12.5 1 1-2 2.5-2 2.5-4 0-1.5-1.5-1.5-1.5-1.5H10.5S9 24.5 9 26z" />
                    <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
                    <path d="M9 39h27v-3H9v3z" />
                </g>
            </svg>
        ),
        k: (
            <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
                <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.5 11.63V6M20 8h5" strokeLinecap="butt" />
                    <path d="M22.5 25s4.5-7.5 4.5-11.08c0-2.43-2.02-4.42-4.5-4.42s-4.5 1.99-4.5 4.42c0 3.58 4.5 11.08 4.5 11.08z" fill={fill} strokeLinecap="butt" />
                    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-4-1-4h-30s3 3-1 4c-3 6 6 10.5 6 10.5v7z" fill={fill} />
                    <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
                </g>
            </svg>
        )
    }

    return pieces[type] || null
}

export default function ChessGame() {
    const [game, setGame] = useState(new Chess())
    const [moveFrom, setMoveFrom] = useState<Square | null>(null)
    const [isFinished, setIsFinished] = useState(false)
    const [winner, setWinner] = useState<string | null>(null)
    const [history, setHistory] = useState<string[]>([])
    const [isAiThinking, setIsAiThinking] = useState(false)
    const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null)

    const board = useMemo(() => game.board(), [game])

    const makeMove = useCallback((move: any) => {
        try {
            const result = game.move(move)
            if (result) {
                setGame(new Chess(game.fen()))
                setHistory(prev => [...prev, result.san])
                setLastMove({ from: result.from, to: result.to })
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
                if (game.isGameOver()) {
                    setIsFinished(true)
                    setWinner(game.isDraw() ? 'Draw' : 'You')
                } else {
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
                    }, 600)
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
        setLastMove(null)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0A0A0C] relative overflow-hidden flex flex-col font-outfit">
                <ParticleBackground />

                <div className="relative z-10 px-6 pt-24 pb-16 max-w-7xl mx-auto w-full">
                    {/* Header Nav */}
                    <div className="flex items-center justify-between mb-12">
                        <Link
                            href="/games"
                            className="group flex items-center gap-2 text-readable-muted hover:text-primary transition-all font-bold"
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </div>
                            Back to Library
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Engine Status</span>
                                <span className={`text-sm font-bold ${isAiThinking ? 'text-emerald-400 animate-pulse' : 'text-readable-muted'}`}>
                                    {isAiThinking ? 'Calculating Tactics...' : 'Ready for Input'}
                                </span>
                            </div>
                            <button
                                onClick={resetGame}
                                className="p-3 bg-white/5 hover:bg-red-500/20 text-readable-muted hover:text-red-400 rounded-xl transition-all border border-white/10"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                        {/* Game Board Column */}
                        <div className="xl:col-span-8 flex flex-col items-center">
                            <div className="w-full flex items-center justify-between mb-6 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                                        <Cpu className="w-6 h-6 text-primary" />
                                    </div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Chess Strategy</h1>
                                </div>
                            </div>

                            {/* Main Board Container */}
                            <div className="relative group w-full max-w-[640px] aspect-square p-4 md:p-6 glass rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                                {/* Glowing ambient background */}
                                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500" />

                                <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-2xl">
                                    {board.map((row, i) =>
                                        row.map((piece, j) => {
                                            const square = `${String.fromCharCode(97 + j)}${8 - i}` as Square
                                            const isLight = (i + j) % 2 === 0
                                            const isSelected = moveFrom === square
                                            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square)
                                            const canMoveHere = moveFrom && game.moves({ square: moveFrom, verbose: true }).some(m => m.to === square)

                                            return (
                                                <div
                                                    key={square}
                                                    onClick={() => onSquareClick(square)}
                                                    className={`relative flex items-center justify-center cursor-pointer transition-all duration-300
                                                        ${isLight ? 'bg-[#3d3d45] hover:bg-[#4a4a54]' : 'bg-[#1a1a1f] hover:bg-[#25252b]'}
                                                        ${isLastMove ? 'after:absolute after:inset-0 after:bg-primary/5 after:shadow-inner' : ''}
                                                    `}
                                                >
                                                    {/* Square Overlays */}
                                                    {isSelected && <div className="absolute inset-0 bg-primary/20 ring-4 ring-primary/50 ring-inset z-0" />}
                                                    {canMoveHere && (
                                                        <div className={`absolute w-4 h-4 rounded-full ${piece ? 'ring-4 ring-primary/30' : 'bg-primary/20'} z-0`} />
                                                    )}

                                                    <AnimatePresence mode="popLayout">
                                                        {piece && (
                                                            <motion.div
                                                                key={`${piece.color}${piece.type}${square}`}
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                                className="w-[85%] h-[85%] z-10 flex items-center justify-center"
                                                            >
                                                                <Piece color={piece.color} type={piece.type} />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Coordinates */}
                                                    {j === 0 && <span className="absolute top-1 left-1.5 text-[10px] font-black text-readable-muted/20 select-none">{8 - i}</span>}
                                                    {i === 7 && <span className="absolute bottom-1 right-1.5 text-[10px] font-black text-readable-muted/20 select-none uppercase">{String.fromCharCode(97 + j)}</span>}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Control Panel Column */}
                        <div className="xl:col-span-4 flex flex-col gap-6">
                            {/* Player Status Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`glass p-6 rounded-3xl border transition-all duration-500 ${game.turn() === 'w' ? 'border-primary/50 bg-primary/5' : 'border-white/5 opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${game.turn() === 'w' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-readable-muted'}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-readable-muted">Human</span>
                                    </div>
                                    <div className="text-xl font-bold text-white">White</div>
                                    {game.turn() === 'w' && <div className="mt-2 text-[10px] font-black text-primary animate-pulse">YOUR TURN</div>}
                                </div>

                                <div className={`glass p-6 rounded-3xl border transition-all duration-500 ${game.turn() === 'b' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${game.turn() === 'b' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-readable-muted'}`}>
                                            <Cpu className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-readable-muted">AI</span>
                                    </div>
                                    <div className="text-xl font-bold text-white">Black</div>
                                    {game.turn() === 'b' && <div className="mt-2 text-[10px] font-black text-emerald-500 animate-pulse">THINKING...</div>}
                                </div>
                            </div>

                            {/* Move History Panel */}
                            <div className="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-[400px]">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Tactical Log</h3>

                                <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {history.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                            <Zap className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">No moves recorded</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                            {history.reduce((acc: any[], current, i) => {
                                                if (i % 2 === 0) acc.push([current])
                                                else acc[acc.length - 1].push(current)
                                                return acc
                                            }, []).map((pair, i) => (
                                                <React.Fragment key={i}>
                                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                                                        <span className="text-[10px] font-black text-primary w-4">{i + 1}.</span>
                                                        <span className="text-sm font-bold text-white">{pair[0]}</span>
                                                    </div>
                                                    {pair[1] && (
                                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                                            <span className="text-sm font-bold text-white">{pair[1]}</span>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                                        <Info className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="text-[10px] text-readable-muted font-medium leading-relaxed uppercase tracking-wider">
                                        Standard chess rules apply. Depth 2 Minimax enabled.
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
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0C]/80 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md bg-[#111114] rounded-[2.5rem] p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 mx-auto border border-primary/20">
                                    <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>

                                <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">
                                    {winner === 'Draw' ? 'Stalemate' : winner === 'You' ? 'Checkmate!' : 'Defeat'}
                                </h2>
                                <p className="text-readable-muted mb-10 text-lg">
                                    {winner === 'You' ? 'Tactical dominance achieved.' : 'Analyzing defeat improves strategies.'}
                                </p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={resetGame}
                                        className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:scale-[1.02]"
                                    >
                                        Rematch Protocol
                                    </button>
                                    <Link
                                        href="/games"
                                        className="w-full py-5 glass glass-hover border border-white/10 text-readable-muted hover:text-white rounded-[1.25rem] font-bold transition-all text-sm uppercase tracking-widest"
                                    >
                                        Return to Library
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

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  BarChart3,
  MoreVertical,
  Edit,
  Trash2,
  Play
} from 'lucide-react'
import { Bundle } from '@/app/api/bundles/route'

interface BundleCardProps {
  bundle: Bundle
  onView: (fileId: string) => void
  onEdit: (bundle: Bundle) => void
  onDelete: (fileId: string) => void
  onCreateExam: (fileId: string) => void
}

export default function BundleCard({
  bundle,
  onView,
  onEdit,
  onDelete,
  onCreateExam
}: BundleCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSubjectColor = (subject: string | null) => {
    const colors: Record<string, string> = {
      'mathematics': 'from-blue-500 to-blue-600',
      'chemistry': 'from-green-500 to-green-600',
      'physics': 'from-purple-500 to-purple-600',
      'biology': 'from-emerald-500 to-emerald-600',
      'computer_science': 'from-indigo-500 to-indigo-600',
      'history': 'from-amber-500 to-amber-600',
      'literature': 'from-rose-500 to-rose-600',
      'economics': 'from-teal-500 to-teal-600',
      'psychology': 'from-pink-500 to-pink-600',
      'engineering': 'from-orange-500 to-orange-600'
    }
    return colors[subject || 'general'] || 'from-gray-500 to-gray-600'
  }

  const getDifficultyStats = () => {
    const total = Object.values(bundle.difficultyDistribution).reduce((sum, count) => sum + count, 0)
    if (total === 0) return null

    return Object.entries(bundle.difficultyDistribution).map(([difficulty, count]) => ({
      difficulty,
      count,
      percentage: Math.round((count / total) * 100)
    }))
  }

  const difficultyStats = getDifficultyStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative glass glass-hover rounded-2xl border border-white/10 dark:border-white/5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/5 rounded-2xl transition-all duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative p-5">
        {/* Header with subject tag and menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg font-bold text-readable mb-2 truncate">
              {bundle.bundleName}
            </h3>
            {bundle.subjectTag && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getSubjectColor(bundle.subjectTag)} text-white shadow-sm`}>
                {bundle.subjectTag.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-readable-muted" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-44 glass rounded-xl shadow-2xl border border-white/10 dark:border-white/5 z-10 overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(bundle)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-readable hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Bundle
                </button>
                <button
                  onClick={() => {
                    onDelete(bundle.fileId)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bundle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Difficulty in horizontal layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Stats Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-readable-muted">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-readable">{bundle.questionCount}</span>
              <span className="text-xs">questions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-readable-muted">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {bundle.lastAccessed
                  ? formatDate(bundle.lastAccessed)
                  : formatDate(bundle.uploadDate)
                }
              </span>
            </div>
          </div>

          {/* Difficulty Column */}
          {difficultyStats && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-readable-muted" />
                <span className="text-xs font-semibold text-readable-muted">Difficulty</span>
              </div>
              <div className="flex gap-1.5">
                {difficultyStats.map(({ difficulty, count, percentage }) => (
                  <div key={difficulty} className="flex-1">
                    <div className="w-full bg-white/5 dark:bg-black/20 rounded-full h-1.5 overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-1.5 rounded-full ${difficulty === 'easy' ? 'bg-green-500' :
                          difficulty === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                      />
                    </div>
                    <div className="text-[10px] text-readable-muted text-center capitalize">{difficulty[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(bundle.fileId)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 glass glass-hover text-readable rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 text-sm font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onCreateExam(bundle.fileId)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-semibold"
          >
            <Play className="w-4 h-4" />
            Start Exam
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  )
}
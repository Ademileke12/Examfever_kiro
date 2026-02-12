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
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative glass glass-hover rounded-3xl border border-white/10 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 rounded-3xl transition-all duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-readable mb-3 truncate group-hover:text-primary transition-colors">
                {bundle.bundleName}
              </h3>
              {bundle.subjectTag && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getSubjectColor(bundle.subjectTag)} text-white shadow-md`}>
                  {bundle.subjectTag.replace('_', ' ').toUpperCase()}
                </div>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-readable-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 w-48 glass rounded-2xl shadow-2xl border border-white/10 dark:border-white/5 z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      onEdit(bundle)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-readable hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Bundle
                  </button>
                  <button
                    onClick={() => {
                      onDelete(bundle.fileId)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Bundle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-readable-muted mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="font-semibold">{bundle.questionCount} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {bundle.lastAccessed
                  ? `Accessed ${formatDate(bundle.lastAccessed)}`
                  : `Created ${formatDate(bundle.uploadDate)}`
                }
              </span>
            </div>
          </div>

          {/* Difficulty Distribution */}
          {difficultyStats && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-readable-light" />
                <span className="text-sm font-semibold text-readable-light">Difficulty</span>
              </div>
              <div className="space-y-3">
                {difficultyStats.map(({ difficulty, count, percentage }) => (
                  <div key={difficulty}>
                    <div className="flex justify-between text-xs text-readable-muted mb-1.5">
                      <span className="capitalize font-medium">{difficulty}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-white/5 dark:bg-black/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-2 rounded-full ${difficulty === 'easy' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            difficulty === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                              'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => onView(bundle.fileId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 glass glass-hover text-readable rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            View Questions
          </button>
          <button
            onClick={() => onCreateExam(bundle.fileId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl hover:opacity-90 shadow-lg hover:shadow-glow transition-all duration-200 font-semibold"
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
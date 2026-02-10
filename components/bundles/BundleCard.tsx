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
      'mathematics': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'chemistry': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'physics': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'biology': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'computer_science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'history': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'literature': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      'economics': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'psychology': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'engineering': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return colors[subject || 'general'] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
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
      whileHover={{ y: -4 }}
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-2">
              {bundle.bundleName}
            </h3>
            {bundle.subjectTag && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(bundle.subjectTag)}`}>
                {bundle.subjectTag.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onEdit(bundle)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Bundle
                </button>
                <button
                  onClick={() => {
                    onDelete(bundle.fileId)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bundle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{bundle.questionCount} questions</span>
          </div>
          <div className="flex items-center gap-1">
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
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</span>
            </div>
            <div className="flex gap-2">
              {difficultyStats.map(({ difficulty, count, percentage }) => (
                <div key={difficulty} className="flex-1">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span className="capitalize">{difficulty}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        difficulty === 'easy' ? 'bg-green-500' :
                        difficulty === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          View Questions
        </button>
        <button
          onClick={() => onCreateExam(bundle.fileId)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Exam
        </button>
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
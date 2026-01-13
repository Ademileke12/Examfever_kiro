'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  X,
  BookOpen,
  BarChart3,
  Edit,
  Trash2,
  Play,
  Filter
} from 'lucide-react'
import { BundleDetails } from '@/app/api/bundles/[fileId]/route'
import { Bundle } from '@/app/api/bundles/route'

interface BundlePreviewProps {
  fileId: string
  onClose: () => void
  onEdit: (bundle: Bundle) => void
  onDelete: (fileId: string) => void
  onCreateExam: (fileId: string) => void
}

export default function BundlePreview({
  fileId,
  onClose,
  onEdit,
  onDelete,
  onCreateExam
}: BundlePreviewProps) {
  const [bundleDetails, setBundleDetails] = useState<BundleDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const fetchBundleDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch(`/api/bundles/${fileId}?userId=${userId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bundle details')
      }

      setBundleDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundle')
    } finally {
      setLoading(false)
    }
  }, [fileId])

  useEffect(() => {
    fetchBundleDetails()
  }, [fetchBundleDetails])

  const filteredQuestions = bundleDetails?.questions.filter(question => {
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    return matchesType && matchesDifficulty
  }) || []

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading bundle details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Bundle</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : bundleDetails ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {bundleDetails.bundle.bundleName}
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    {bundleDetails.bundle.subjectTag && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(bundleDetails.bundle.subjectTag)}`}>
                        {bundleDetails.bundle.subjectTag.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {bundleDetails.statistics.totalQuestions} questions
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(bundleDetails.bundle)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(fileId)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onCreateExam(fileId)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Create Exam from Bundle
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {bundleDetails.statistics.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Object.keys(bundleDetails.statistics.byType).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Question Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Object.keys(bundleDetails.statistics.byTopic).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Topics Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(bundleDetails.statistics.averageQuality * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Quality</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Types</option>
                  {Object.keys(bundleDetails.statistics.byType).map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({bundleDetails.statistics.byType[type]})
                    </option>
                  ))}
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Difficulties</option>
                  {Object.keys(bundleDetails.statistics.byDifficulty).map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ({bundleDetails.statistics.byDifficulty[difficulty]})
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredQuestions.length} of {bundleDetails.statistics.totalQuestions} questions
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          #{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.type === 'multiple-choice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' // Fallback for any other types
                        }`}>
                          {question.type.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {question.difficulty.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {question.text}
                    </p>
                    {question.topic && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Topic: {question.topic}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  )
}
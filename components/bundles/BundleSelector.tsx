'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check,
  BookOpen,
  Search,
  Filter
} from 'lucide-react'
import { Bundle } from '@/app/api/bundles/route'

interface BundleSelectorProps {
  selectedBundles: string[]
  onSelectionChange: (bundleIds: string[]) => void
  onBundleDistributionChange?: (distribution: Record<string, number>) => void
  maxSelections?: number
  showDistribution?: boolean
}

export default function BundleSelector({
  selectedBundles,
  onSelectionChange,
  onBundleDistributionChange,
  maxSelections,
  showDistribution = false
}: BundleSelectorProps) {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [bundleDistribution, setBundleDistribution] = useState<Record<string, number>>({})

  useEffect(() => {
    loadBundles()
  }, [])

  useEffect(() => {
    // Initialize distribution for selected bundles
    const newDistribution: Record<string, number> = {}
    selectedBundles.forEach(bundleId => {
      const bundle = bundles.find(b => b.fileId === bundleId)
      if (bundle) {
        newDistribution[bundleId] = bundleDistribution[bundleId] || Math.min(10, bundle.questionCount)
      }
    })
    setBundleDistribution(newDistribution)
    if (onBundleDistributionChange) {
      onBundleDistributionChange(newDistribution)
    }
  }, [selectedBundles, bundles, bundleDistribution, onBundleDistributionChange])

  const loadBundles = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch(`/api/bundles?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setBundles(data.bundles)
      } else {
        console.error('Failed to load bundles:', data.error)
      }
    } catch (error) {
      console.error('Error loading bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBundleToggle = (bundleId: string) => {
    const isSelected = selectedBundles.includes(bundleId)
    let newSelection: string[]

    if (isSelected) {
      newSelection = selectedBundles.filter(id => id !== bundleId)
    } else {
      if (maxSelections && selectedBundles.length >= maxSelections) {
        return // Don't allow more selections
      }
      newSelection = [...selectedBundles, bundleId]
    }

    onSelectionChange(newSelection)
  }

  const handleDistributionChange = (bundleId: string, count: number) => {
    const newDistribution = {
      ...bundleDistribution,
      [bundleId]: Math.max(1, count)
    }
    setBundleDistribution(newDistribution)
    onBundleDistributionChange?.(newDistribution)
  }

  // Get unique subjects
  const subjects = Array.from(new Set(bundles.map(b => b.subjectTag).filter(Boolean))).sort()

  // Filter bundles
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.bundleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bundle.subjectTag?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesSubject = selectedSubject === 'all' || bundle.subjectTag === selectedSubject
    return matchesSearch && matchesSubject
  })

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

  const getTotalQuestions = () => {
    return Object.entries(bundleDistribution).reduce((total, [bundleId, count]) => {
      return total + count
    }, 0)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Question Bundles
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose which document bundles to include in your exam
            {maxSelections && ` (max ${maxSelections})`}
          </p>
        </div>
        {selectedBundles.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedBundles.length} bundle{selectedBundles.length !== 1 ? 's' : ''} selected
            {showDistribution && ` • ${getTotalQuestions()} questions`}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bundles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject || ''}>
              {subject?.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Bundle List */}
      {filteredBundles.length === 0 ? (
        <div className="text-center py-8">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bundles found
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedSubject !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload some PDFs to create question bundles.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredBundles.map((bundle) => {
              const isSelected = selectedBundles.includes(bundle.fileId)
              const isDisabled = !isSelected && maxSelections && selectedBundles.length >= maxSelections

              return (
                <motion.div
                  key={bundle.fileId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDisabled
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => !isDisabled && handleBundleToggle(bundle.fileId)}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Bundle Info */}
                  <div className="pr-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {bundle.bundleName}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {bundle.subjectTag && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(bundle.subjectTag)}`}>
                          {bundle.subjectTag.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{bundle.questionCount} questions</span>
                      </div>
                    </div>

                    {/* Question Distribution Input */}
                    {isSelected && showDistribution && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Questions to include:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={bundle.questionCount}
                          value={bundleDistribution[bundle.fileId] || 10}
                          onChange={(e) => handleDistributionChange(bundle.fileId, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Max: {bundle.questionCount} available
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Selection Summary */}
      {selectedBundles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Selected Bundles Summary
          </h4>
          <div className="space-y-2">
            {selectedBundles.map(bundleId => {
              const bundle = bundles.find(b => b.fileId === bundleId)
              if (!bundle) return null
              
              return (
                <div key={bundleId} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800 dark:text-blue-200">
                    {bundle.bundleName}
                  </span>
                  <span className="text-blue-600 dark:text-blue-300">
                    {showDistribution 
                      ? `${bundleDistribution[bundleId] || 10} questions`
                      : `${bundle.questionCount} questions available`
                    }
                  </span>
                </div>
              )
            })}
          </div>
          {showDistribution && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex justify-between font-semibold text-blue-900 dark:text-blue-100">
                <span>Total Questions:</span>
                <span>{getTotalQuestions()}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
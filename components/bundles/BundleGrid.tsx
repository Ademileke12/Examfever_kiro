'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import BundleCard from './BundleCard'
import BundlePreview from './BundlePreview'
import { Bundle } from '@/app/api/bundles/route'

interface BundleGridProps {
  bundles: Bundle[]
  loading?: boolean
  onRefresh: () => void
  onEditBundle: (bundle: Bundle) => void
  onDeleteBundle: (fileId: string) => void
  onCreateExam: (fileId: string) => void
}

export default function BundleGrid({
  bundles,
  loading = false,
  onRefresh,
  onEditBundle,
  onDeleteBundle,
  onCreateExam
}: BundleGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'questions'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)

  // Get unique subjects
  const subjects = useMemo(() => {
    const subjectSet = new Set(bundles.map(b => b.subjectTag).filter(Boolean))
    return Array.from(subjectSet).sort()
  }, [bundles])

  // Filter and sort bundles
  const filteredBundles = useMemo(() => {
    let filtered = bundles.filter(bundle => {
      const matchesSearch = bundle.bundleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bundle.subjectTag?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesSubject = selectedSubject === 'all' || bundle.subjectTag === selectedSubject
      return matchesSearch && matchesSubject
    })

    // Sort bundles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.bundleName.localeCompare(b.bundleName)
        case 'questions':
          return b.questionCount - a.questionCount
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

    return filtered
  }, [bundles, searchTerm, selectedSubject, sortBy])

  const handleViewBundle = (fileId: string) => {
    setSelectedBundle(fileId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filter */}
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
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

        {/* Sort and View Controls */}
        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'questions')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="questions">Sort by Questions</option>
          </select>

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredBundles.length} of {bundles.length} bundles
        {searchTerm && ` matching "${searchTerm}"`}
        {selectedSubject !== 'all' && ` in ${selectedSubject.replace('_', ' ')}`}
      </div>

      {/* Bundle Grid/List */}
      {filteredBundles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Filter className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bundles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedSubject !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload some PDFs to create your first question bundle.'
            }
          </p>
          {(searchTerm || selectedSubject !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSubject('all')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          <AnimatePresence>
            {filteredBundles.map((bundle) => (
              <BundleCard
                key={bundle.fileId}
                bundle={bundle}
                onView={handleViewBundle}
                onEdit={onEditBundle}
                onDelete={onDeleteBundle}
                onCreateExam={onCreateExam}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bundle Preview Modal */}
      <AnimatePresence>
        {selectedBundle && (
          <BundlePreview
            fileId={selectedBundle}
            onClose={() => setSelectedBundle(null)}
            onEdit={(bundle) => {
              onEditBundle(bundle)
              setSelectedBundle(null)
            }}
            onDelete={(fileId) => {
              onDeleteBundle(fileId)
              setSelectedBundle(null)
            }}
            onCreateExam={(fileId) => {
              onCreateExam(fileId)
              setSelectedBundle(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
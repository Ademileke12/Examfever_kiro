'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight,
  Folder,
  BookOpen
} from 'lucide-react'
import BundleSelector from '@/components/bundles/BundleSelector'
import ExamCreator from '@/components/exam/ExamCreator'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export default function CreateExamPage() {
  const [examCreated, setExamCreated] = useState<string | null>(null)
  const [selectedBundles, setSelectedBundles] = useState<string[]>([])
  const [bundleDistribution, setBundleDistribution] = useState<Record<string, number>>({})
  const [step, setStep] = useState<'bundles' | 'exam'>('bundles')

  useEffect(() => {
    // Check if a bundle was pre-selected from question bank
    const preSelectedBundle = localStorage.getItem('selectedBundleForExam')
    if (preSelectedBundle) {
      try {
        const bundle = JSON.parse(preSelectedBundle)
        setSelectedBundles([bundle.fileId])
        setBundleDistribution({ [bundle.fileId]: Math.min(20, bundle.questionCount) })
        localStorage.removeItem('selectedBundleForExam')
        setStep('exam') // Skip bundle selection if pre-selected
      } catch (error) {
        console.error('Error parsing pre-selected bundle:', error)
      }
    }
  }, [])

  const handleExamCreated = (examId: string) => {
    setExamCreated(examId)
  }

  const handleBundleSelectionComplete = () => {
    if (selectedBundles.length > 0) {
      setStep('exam')
    }
  }

  if (examCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
        <ParticleBackground />
        
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Exam Created Successfully!
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Your bundle-based exam has been created and is ready to take. You can start the exam now or access it later from your dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href={`/exam?id=${examCreated}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Take Exam Now
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
                
                <motion.a
                  href="/browse"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  View All Exams
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            {step === 'bundles' ? (
              <Folder className="w-8 h-8 text-white" />
            ) : (
              <BookOpen className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            {step === 'bundles' ? 'Select Question Bundles' : 'Create Your Exam'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {step === 'bundles' 
              ? 'Choose which document bundles to include in your exam for focused studying'
              : 'Configure your exam settings and generate questions from selected bundles'
            }
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'bundles' 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : 'border-green-600 bg-green-600 text-white'
            }`}>
              {step === 'bundles' ? '1' : <CheckCircle className="w-6 h-6" />}
            </div>
            <span className={`font-medium ${
              step === 'bundles' ? 'text-blue-600' : 'text-green-600'
            }`}>
              Select Bundles
            </span>
            
            <div className={`w-16 h-0.5 ${
              step === 'exam' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'exam' 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
            }`}>
              2
            </div>
            <span className={`font-medium ${
              step === 'exam' ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'
            }`}>
              Create Exam
            </span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {step === 'bundles' ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-8">
              <BundleSelector
                selectedBundles={selectedBundles}
                onSelectionChange={setSelectedBundles}
                onBundleDistributionChange={setBundleDistribution}
                showDistribution={true}
              />
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBundles.length === 0 
                    ? 'Select at least one bundle to continue'
                    : `${selectedBundles.length} bundle${selectedBundles.length !== 1 ? 's' : ''} selected`
                  }
                </div>
                
                <motion.button
                  onClick={handleBundleSelectionComplete}
                  disabled={selectedBundles.length === 0}
                  whileHover={selectedBundles.length > 0 ? { scale: 1.05 } : {}}
                  whileTap={selectedBundles.length > 0 ? { scale: 0.95 } : {}}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedBundles.length > 0
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Exam Setup
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Selected Bundles Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Selected Question Bundles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBundles.map(bundleId => (
                    <div key={bundleId} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-900 dark:text-white font-medium">
                        Bundle {bundleId.slice(-8)}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {bundleDistribution[bundleId] || 10} questions
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('bundles')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  ← Change Bundle Selection
                </button>
              </div>

              {/* Exam Creator */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-8">
                <ExamCreator 
                  onExamCreated={handleExamCreated}
                  selectedBundles={selectedBundles}
                  bundleDistribution={bundleDistribution}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        {step === 'bundles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                How Bundle-Based Exams Work
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Select one or more question bundles based on the documents you want to study
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Choose how many questions to include from each bundle
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Your exam will only contain questions from the selected bundles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Results will show your performance per bundle for targeted improvement
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
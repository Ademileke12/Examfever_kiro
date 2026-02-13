'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import PDFUploadButton from '@/components/upload/PDFUploadButton'
import PDFUploadZone from '@/components/upload/PDFUploadZone'
import PDFUploadProgress from '@/components/upload/PDFUploadProgress'
import { UploadProgress } from '@/types/upload'
import { PDFValidationResult } from '@/types/pdf'
import { generateFileId } from '@/lib/utils'
import { getUserId } from '@/lib/auth/user'
import { pageVariants } from '@/lib/animations/variants'
import UploadSettings, { UploadSettings as UploadSettingsType } from '@/components/upload/UploadSettings'
import { Database, Upload, Sparkles, Zap, FileText, Brain } from 'lucide-react'

import { useSubscription } from '@/components/providers/SubscriptionProvider'

export default function UploadPage() {
  const { refetchStatus } = useSubscription()
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [questionResults, setQuestionResults] = useState<Record<string, any>>({})
  const [uploadSettings, setUploadSettings] = useState<UploadSettingsType>({
    deleteAfterProcessing: true,
    retentionDays: 0,
    keepOnError: true
  })

  const updateUploadProgress = useCallback((fileId: string, updates: Partial<UploadProgress>) => {
    setUploads(prev => prev.map(upload =>
      upload.fileId === fileId
        ? { ...upload, ...updates }
        : upload
    ))
  }, [])

  const processFile = useCallback(async (file: File, validation: PDFValidationResult) => {
    const fileId = generateFileId()

    // Add to uploads list
    const uploadProgress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'validating',
      startTime: new Date()
    }

    setUploads(prev => [...prev, uploadProgress])

    // Check validation
    if (!validation.isValid) {
      updateUploadProgress(fileId, {
        status: 'error',
        error: validation.errors.join(', '),
        endTime: new Date()
      })
      return
    }

    try {
      // Update to processing
      updateUploadProgress(fileId, { status: 'processing', progress: 20 })

      // Process file with polling approach for better timeout handling
      const formData = new FormData()
      formData.append('file', file)

      // Get proper user ID from auth system
      const userId = getUserId()
      formData.append('userId', userId)

      // Start the processing request
      const processResponse = await fetch('/api/pdf/process', {
        method: 'POST',
        body: formData
      })

      // Robust response handling
      let processResult
      try {
        processResult = await processResponse.json()
      } catch (jsonError) {
        throw new Error('Upload failed: Server returned an invalid response. Please try again or contact support.')
      }

      if (!processResponse.ok || !processResult.success) {
        throw new Error(processResult.error || 'Upload failed: The server encountered an error during processing.')
      }

      // Store question generation results
      if (processResult.data?.questionGeneration) {
        setQuestionResults(prev => ({
          ...prev,
          [fileId]: processResult.data.questionGeneration
        }))
      }

      updateUploadProgress(fileId, {
        status: 'completed',
        progress: 100,
        endTime: new Date()
      })

      // Refresh subscription usage data
      refetchStatus()

    } catch (error) {
      console.error('[Upload] Error processing file:', error)

      let errorMessage = 'Upload failed'
      if (error instanceof Error) {
        errorMessage = error.message.includes('Unexpected token')
          ? 'Upload failed: Server connection issue'
          : error.message
      }

      updateUploadProgress(fileId, {
        status: 'error',
        error: errorMessage,
        endTime: new Date()
      })
    }
  }, [updateUploadProgress, refetchStatus])

  const handleFileSelect = useCallback((file: File, validation: PDFValidationResult) => {
    processFile(file, validation)
  }, [processFile])

  const handleFilesDrop = useCallback((files: File[], validations: PDFValidationResult[]) => {
    files.forEach((file, index) => {
      const validation = validations[index]
      if (validation) {
        processFile(file, validation)
      }
    })
  }, [processFile])

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 relative z-10"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Upload Study Materials
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Transform your textbooks, notes, and study guides into personalized practice exams with AI-powered question generation
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="glass glass-hover rounded-3xl p-8 mb-8 border border-glass-border shadow-glass-dark"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              <div className="lg:col-span-3">
                <PDFUploadZone
                  onFilesDrop={handleFilesDrop}
                  disabled={false}
                  maxFiles={5}
                />
              </div>
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <UploadSettings onSettingsChange={setUploadSettings} />
                </motion.div>
              </div>
            </div>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <PDFUploadButton
                onFileSelect={handleFileSelect}
                disabled={false}
                loading={false}
                multiple={true}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Section */}
        {uploads.length > 0 && (
          <motion.div
            className="glass glass-hover rounded-3xl p-8 mb-8 border border-glass-border shadow-glass-dark"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Processing Status</h3>
            </div>
            <PDFUploadProgress
              uploads={uploads}
              questionResults={questionResults}
            />
          </motion.div>
        )}

        {/* Database Setup Notice */}
        {uploads.some(upload => upload.status === 'completed' && questionResults[upload.fileId]?.success === true && questionResults[upload.fileId]?.questionsSaved === 0) && (
          <motion.div
            className="glass glass-hover rounded-3xl p-8 mb-8 border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50/10 to-orange-50/10 shadow-glow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  🎉 Questions Generated Successfully!
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-lg">
                  But they need a database to be saved...
                </p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 mb-6 border border-yellow-400/20">
              <p className="text-yellow-700 dark:text-yellow-300 mb-4 text-lg leading-relaxed">
                <strong>Great news!</strong> The AI successfully generated {(() => {
                  const firstKey = Object.keys(questionResults)[0]
                  return firstKey ? (questionResults[firstKey]?.totalGenerated || 'multiple') : 'multiple'
                })()} questions from your PDF.
                However, they couldn't be saved because the database tables haven't been set up yet.
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-lg leading-relaxed">
                This is a <strong>one-time setup</strong> that takes less than 2 minutes. Once done, all future uploads will save questions automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <motion.a
                href="/setup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-magnetic hover:shadow-glow transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Database className="w-5 h-5" />
                Set Up Database Now
              </motion.a>
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium">
                <span className="text-2xl">⏱️</span>
                <span>Takes less than 2 minutes</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          className="glass glass-hover rounded-3xl p-8 border border-blue-400/20 bg-gradient-to-br from-blue-50/10 to-indigo-50/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              How It Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, text: "Select PDF files (up to 50MB each) with selectable text content" },
              { icon: Brain, text: "AI extracts text and generates exam questions. Scanned/Image PDFs are not supported yet." },
              { icon: Database, text: "Questions are saved to your personal question bank" },
              { icon: Zap, text: "Create custom exams using your generated questions" },
              { icon: Sparkles, text: "No file storage required - questions contain all needed content" },
              { icon: Upload, text: "Drag & drop or click to upload multiple files at once" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-4 glass rounded-xl border border-blue-400/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

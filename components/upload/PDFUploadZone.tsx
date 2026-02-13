'use client'

import { useState, useCallback, DragEvent, useEffect } from 'react'
import { Upload, FileText, Sparkles, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropState } from '@/types/upload'
import { PDFValidationResult } from '@/types/pdf'

interface PDFUploadZoneProps {
  onFilesDrop: (files: File[], validations: PDFValidationResult[]) => void
  disabled?: boolean
  maxFiles?: number
}

export default function PDFUploadZone({
  onFilesDrop,
  disabled = false,
  maxFiles = 5
}: PDFUploadZoneProps) {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragOver: false,
    isDragActive: false,
    dragCounter: 0
  })
  const [showFullScreenDrop, setShowFullScreenDrop] = useState(false)

  const validateFile = (file: File): PDFValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.push('File must be a PDF')
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB')
    }

    // Check if file has content
    if (file.size === 0) {
      errors.push('File appears to be empty')
    }

    // Add warning for large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      warnings.push('Large file may take longer to process')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        type: file.type
      }
    }
  }

  // Global drag handlers for full-screen drop zone
  useEffect(() => {
    const handleGlobalDragEnter = (e: globalThis.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.types.includes('Files')) {
        setShowFullScreenDrop(true)
      }
    }

    const handleGlobalDragLeave = (e: globalThis.DragEvent) => {
      e.preventDefault()
      // Only hide if leaving the window
      if (!e.relatedTarget) {
        setShowFullScreenDrop(false)
      }
    }

    const handleGlobalDrop = (e: globalThis.DragEvent) => {
      e.preventDefault()
      setShowFullScreenDrop(false)
    }

    document.addEventListener('dragenter', handleGlobalDragEnter)
    document.addEventListener('dragleave', handleGlobalDragLeave)
    document.addEventListener('drop', handleGlobalDrop)

    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter)
      document.removeEventListener('dragleave', handleGlobalDragLeave)
      document.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState(prev => ({
      ...prev,
      dragCounter: prev.dragCounter + 1,
      isDragActive: true
    }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState(prev => {
      const newCounter = prev.dragCounter - 1
      return {
        ...prev,
        dragCounter: newCounter,
        isDragActive: newCounter > 0,
        isDragOver: false
      }
    })
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState(prev => ({
      ...prev,
      isDragOver: true
    }))
  }, [])

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState({
      isDragOver: false,
      isDragActive: false,
      dragCounter: 0
    })
    setShowFullScreenDrop(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    if (files.length === 0) return

    const validations = files.map(file => validateFile(file))
    onFilesDrop(files, validations)
  }, [disabled, maxFiles, onFilesDrop])

  const { isDragActive, isDragOver } = dragState

  return (
    <>
      {/* Full-screen drop zone overlay */}
      <AnimatePresence>
        {showFullScreenDrop && (
          <motion.div
            className="fixed inset-0 z-50 drop-zone-overlay flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <motion.div
              className="glass shimmer-border p-12 rounded-3xl text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Upload className="w-24 h-24 text-blue-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Drop Your PDFs Here
              </h2>
              <p className="text-xl text-blue-200">
                Release to upload and start generating questions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main upload zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative glass glass-hover rounded-2xl p-8 text-center cursor-pointer overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          borderColor: disabled
            ? 'rgba(229, 231, 235, 0.5)'
            : isDragOver
              ? 'rgba(59, 130, 246, 0.8)'
              : isDragActive
                ? 'rgba(59, 130, 246, 0.6)'
                : 'rgba(209, 213, 219, 0.5)'
        }}
        style={{
          border: '2px dashed',
          backgroundColor: disabled
            ? 'rgba(249, 250, 251, 0.5)'
            : isDragOver
              ? 'rgba(239, 246, 255, 0.8)'
              : isDragActive
                ? 'rgba(240, 249, 255, 0.6)'
                : 'var(--glass-bg)'
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 2) * 60}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div
            animate={isDragActive ? {
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {isDragActive ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <Upload className="w-16 h-16 text-blue-500" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                <motion.div
                  className="absolute -bottom-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="w-4 h-4 text-blue-500" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-2">
            <motion.h3
              className="text-xl font-semibold text-gray-900 dark:text-white"
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            >
              {isDragActive ? 'Drop your PDF files here' : 'Drag & drop PDF files'}
            </motion.h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {disabled
                ? 'Upload disabled'
                : `Support for up to ${maxFiles} PDF files, max 50MB each`
              }
            </p>
          </div>

          {!disabled && (
            <div className="space-y-3">
              <motion.div
                className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                <FileText className="w-3 h-3" />
                Only PDF files are accepted
              </motion.div>

              <motion.div
                className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full flex items-center justify-center gap-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Note: Scanned/Image PDFs are not supported yet
              </motion.div>
            </div>
          )}

          {/* Scanning line animation when dragging */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                className="absolute inset-0 scanning-line opacity-30"
                initial={{ y: '-100%' }}
                animate={{ y: '100%' }}
                exit={{ y: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}

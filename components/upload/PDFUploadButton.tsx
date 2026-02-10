'use client'

import { useRef, ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { PDFValidationResult } from '@/types/pdf'

interface PDFUploadButtonProps {
  onFileSelect: (file: File, validation: PDFValidationResult) => void
  disabled?: boolean
  loading?: boolean
  multiple?: boolean
}

export default function PDFUploadButton({
  onFileSelect,
  disabled = false,
  loading = false,
  multiple = false
}: PDFUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Process each file
    Array.from(files).forEach(file => {
      const validation = validateFile(file)
      onFileSelect(file, validation)
    })

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Select PDF files"
      />
      <button
        onClick={handleButtonClick}
        disabled={disabled || loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: loading || disabled ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading && !disabled) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !disabled) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
          }
        }}
      >
        <Upload style={{ width: '1rem', height: '1rem' }} />
        {loading ? 'Processing...' : 'Select PDF Files'}
      </button>
    </>
  )
}

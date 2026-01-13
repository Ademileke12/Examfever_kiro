import { PDFValidationResult } from '@/types/pdf'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = ['application/pdf']
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46] // %PDF

export function validatePDFFile(file: File): PDFValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(MAX_FILE_SIZE)})`)
  }

  if (file.size === 0) {
    errors.push('File is empty')
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Only PDF files are allowed.`)
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension !== 'pdf') {
    errors.push('File must have a .pdf extension')
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

export async function validatePDFStructure(file: File): Promise<PDFValidationResult> {
  const basicValidation = validatePDFFile(file)
  
  if (!basicValidation.isValid) {
    return basicValidation
  }

  try {
    // Read first few bytes to check PDF signature
    const buffer = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    const hasValidSignature = PDF_SIGNATURE.every((byte, index) => bytes[index] === byte)
    
    if (!hasValidSignature) {
      basicValidation.errors.push('File does not have a valid PDF signature')
      basicValidation.isValid = false
    }

    return basicValidation
  } catch (error) {
    const result: PDFValidationResult = {
      isValid: false,
      errors: ['Failed to validate PDF structure'],
      warnings: []
    }
    
    if (basicValidation.fileInfo) {
      result.fileInfo = basicValidation.fileInfo
    }
    
    return result
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export interface PDFFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt: Date
  userId: string
}

export interface PDFProcessingResult {
  id: string
  fileId: string
  text: string
  pageCount: number
  metadata: PDFMetadata
  processedAt: Date
  status: ProcessingStatus
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  pages: number
  fileSize: number
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface PDFValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fileInfo?: {
    size: number
    type: string
    pages?: number
  }
}

export interface PDFUploadResponse {
  success: boolean
  data?: {
    fileId: string
    url: string
    metadata: PDFMetadata
  }
  error?: string
}

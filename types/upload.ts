export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number // 0-100
  status: UploadStatus
  error?: string
  startTime: Date
  endTime?: Date
}

export type UploadStatus = 
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'

export interface UploadConfig {
  maxFileSize: number // bytes
  allowedTypes: string[]
  maxConcurrentUploads: number
}

export interface FileUploadState {
  files: Map<string, UploadProgress>
  isUploading: boolean
  totalProgress: number
}

export interface DragDropState {
  isDragOver: boolean
  isDragActive: boolean
  dragCounter: number
}

export interface UploadError {
  code: string
  message: string
  file?: string
}

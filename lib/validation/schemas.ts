import { z } from 'zod'

export const uploadRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
})

export const pdfFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  type: z.literal('application/pdf'),
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>
export type PDFFileValidation = z.infer<typeof pdfFileSchema>

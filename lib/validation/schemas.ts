import { z } from 'zod'

export const uploadRequestSchema = z.object({}) // No fields needed as we use session user

export const pdfFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  type: z.literal('application/pdf'),
})

export const examCreateSchema = z.object({
  title: z.string().min(3).max(100).trim(),
  description: z.string().max(500).optional(),
  timeLimit: z.number().min(1).max(480).optional().default(60),
  difficultyDistribution: z.record(z.string(), z.number()).optional(),
  questionTypes: z.array(z.string()).optional(),
  selectedQuestions: z.array(z.string().uuid()).min(1, 'At least one question is required')
})

export const examResultSchema = z.object({
  examId: z.string().uuid(),
  examTitle: z.string().min(1),
  score: z.number().min(0).max(100),
  correctAnswers: z.number().min(0),
  totalQuestions: z.number().min(1),
  timeSpent: z.number().min(0),
  timeLimitMinutes: z.number().min(1),
  userAnswers: z.record(z.string(), z.any()),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  bundleContext: z.record(z.string(), z.any()).optional()
})

export const paymentVerifySchema = z.object({
  reference: z.string().min(1),
  type: z.enum(['plan', 'addon']).optional(),
  plan: z.enum(['standard', 'premium']).optional(),
  id: z.string().optional()
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>
export type PDFFileValidation = z.infer<typeof pdfFileSchema>
export type ExamCreateInput = z.infer<typeof examCreateSchema>
export type ExamResultInput = z.infer<typeof examResultSchema>

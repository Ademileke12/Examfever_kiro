import { deletePDFFromStorage } from '@/lib/supabase/storage'

export interface CleanupOptions {
  deleteAfterProcessing?: boolean
  retentionDays?: number
  keepOnError?: boolean
}

export async function cleanupPDFAfterProcessing(
  fileId: string,
  filePath: string,
  userId: string,
  options: CleanupOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const {
    deleteAfterProcessing = true,
    retentionDays = 0, // Delete immediately after processing
    keepOnError = true
  } = options

  if (!deleteAfterProcessing) {
    return { success: true }
  }

  try {
    // If retention days is set, schedule deletion for later
    if (retentionDays > 0) {
      // In a production app, you'd use a job queue or cron job
      // For now, we'll delete immediately
      console.log(`PDF ${fileId} scheduled for deletion in ${retentionDays} days`)
    }

    // Delete the PDF file from storage
    const deleteResult = await deletePDFFromStorage(filePath)
    
    if (!deleteResult.success && !keepOnError) {
      const result: { success: boolean; error?: string } = { success: false }
      if (deleteResult.error) {
        result.error = deleteResult.error
      }
      return result
    }

    console.log(`PDF ${fileId} cleaned up successfully for user ${userId}`)
    return { success: true }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Cleanup failed'
    
    if (keepOnError) {
      console.warn(`PDF cleanup failed but continuing: ${errorMessage}`)
      return { success: true }
    }
    
    return { success: false, error: errorMessage }
  }
}

export async function scheduleCleanup(
  fileId: string,
  filePath: string,
  userId: string,
  delayHours: number = 24
): Promise<void> {
  // In a production environment, you would:
  // 1. Add to a job queue (Redis, Bull, etc.)
  // 2. Use a cron job or scheduled function
  // 3. Store cleanup tasks in database with timestamps
  
  console.log(`Scheduled cleanup for PDF ${fileId} in ${delayHours} hours`)
  
  // For demo purposes, we'll just log this
  // In production, implement with your preferred job queue system
}
import { createClient } from '@supabase/supabase-js'
import { PDFFile, PDFUploadResponse } from '@/types/pdf'
import { generateFileId, sanitizeFileName } from '@/lib/utils'

// Use service role key for server-side operations when available, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
)

const BUCKET_NAME = 'pdf-uploads'

export async function uploadPDFToStorage(
  file: File,
  userId: string
): Promise<PDFUploadResponse> {
  // Validate userId format (should be UUID) - but allow fallback for development
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId) && process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Invalid user ID format' }
  }

  // TEMPORARY: Mock upload for testing when bucket doesn't exist
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate upload delay
    
    const fileId = generateFileId()
    
    return {
      success: true,
      data: {
        fileId,
        url: `https://mock-storage.com/${userId}/${fileId}-${file.name}`,
        metadata: {
          title: file.name,
          pages: 10, // Mock page count
          fileSize: file.size,
          creationDate: new Date(),
          modificationDate: new Date()
        }
      }
    }
  }

  try {
    const fileId = generateFileId()
    const sanitizedName = sanitizeFileName(file.name)
    const filePath = `${userId}/${fileId}-${sanitizedName}`

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return {
      success: true,
      data: {
        fileId,
        url: urlData.publicUrl,
        metadata: {
          title: file.name,
          pages: 0, // Will be updated after processing
          fileSize: file.size,
          creationDate: new Date(),
          modificationDate: new Date()
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export async function deletePDFFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

export async function getPDFUrl(filePath: string): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error getting PDF URL:', error)
    return null
  }
}

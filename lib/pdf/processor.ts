import pdf from 'pdf-parse'
import { PDFProcessingResult, PDFMetadata } from '@/types/pdf'

export async function extractTextFromPDF(
  buffer: Buffer,
  fileId: string
): Promise<PDFProcessingResult> {
  try {
    const data = await pdf(buffer)
    
    const metadata: PDFMetadata = {
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      subject: data.info?.Subject || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
      pages: data.numpages,
      fileSize: buffer.length
    }
    
    if (data.info?.CreationDate) {
      metadata.creationDate = new Date(data.info.CreationDate)
    }
    
    if (data.info?.ModDate) {
      metadata.modificationDate = new Date(data.info.ModDate)
    }

    return {
      id: `processed-${fileId}`,
      fileId,
      text: data.text,
      pageCount: data.numpages,
      metadata,
      processedAt: new Date(),
      status: 'completed'
    }
  } catch (error) {
    console.error('PDF processing error:', error)
    
    return {
      id: `processed-${fileId}`,
      fileId,
      text: '',
      pageCount: 0,
      metadata: {
        pages: 0,
        fileSize: buffer.length
      },
      processedAt: new Date(),
      status: 'failed'
    }
  }
}

export async function processPDFFromUrl(
  url: string,
  fileId: string
): Promise<PDFProcessingResult> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    return await extractTextFromPDF(buffer, fileId)
  } catch (error) {
    console.error('PDF URL processing error:', error)
    
    return {
      id: `processed-${fileId}`,
      fileId,
      text: '',
      pageCount: 0,
      metadata: {
        pages: 0,
        fileSize: 0
      },
      processedAt: new Date(),
      status: 'failed'
    }
  }
}

export function preprocessTextForAI(text: string): string {
  // Clean up extracted text for better AI processing
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim()
}

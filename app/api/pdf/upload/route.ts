import { NextRequest, NextResponse } from 'next/server'
import { uploadPDFToStorage } from '@/lib/supabase/storage'
import { validatePDFStructure } from '@/lib/pdf/validator'
import { uploadRequestSchema, pdfFileSchema } from '@/lib/validation/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const fileValidation = pdfFileSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type
    })
    if (!fileValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid file', details: fileValidation.error.errors },
        { status: 400 }
      )
    }

    // Validate file structure
    const validation = await validatePDFStructure(file)

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'File validation failed',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Always upload to the authenticated user's directory
    const uploadResult = await uploadPDFToStorage(file, session.user.id)

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: uploadResult.data
    })
  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

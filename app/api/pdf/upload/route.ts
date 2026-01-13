import { NextRequest, NextResponse } from 'next/server'
import { uploadPDFToStorage } from '@/lib/supabase/storage'
import { validatePDFStructure } from '@/lib/pdf/validator'
import { uploadRequestSchema, pdfFileSchema } from '@/lib/validation/schemas'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate userId matches authenticated user (skip in development)
    if (userId !== session.user.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate inputs
    const userValidation = uploadRequestSchema.safeParse({ userId })
    if (!userValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID', details: userValidation.error.errors },
        { status: 400 }
      )
    }

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

    // Upload to Supabase Storage
    const uploadResult = await uploadPDFToStorage(file, userId)

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
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

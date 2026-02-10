import { NextRequest, NextResponse } from 'next/server'
import { validatePDFStructure } from '@/lib/pdf/validator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const validation = await validatePDFStructure(file)

    return NextResponse.json({
      success: true,
      data: validation
    })
  } catch (error) {
    console.error('PDF validation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      },
      { status: 500 }
    )
  }
}

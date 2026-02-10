import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientUserId = searchParams.get('clientUserId')
  
  return NextResponse.json({
    success: true,
    data: {
      clientUserId: clientUserId,
      serverFallback: 'demo-user',
      message: 'User ID consistency check'
    }
  })
}
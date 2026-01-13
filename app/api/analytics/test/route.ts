import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test the analytics API with demo user
    const baseUrl = request.nextUrl.origin
    const analyticsUrl = `${baseUrl}/api/analytics?userId=demo-user&days=30`
    
    const response = await fetch(analyticsUrl)
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Analytics API test completed',
      status: response.status,
      data: data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      message: 'Analytics API test failed'
    }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { getUserInfo } from '@/lib/auth/server'

export async function GET() {
  try {
    // Get user info from cookies
    const userInfo = await getUserInfo()

    if (!userInfo) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userInfo
    })

  } catch (error) {
    console.error('User info API error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    )
  }
}

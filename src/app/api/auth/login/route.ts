import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call the backend login API through API Gateway
    const response = await fetch(`${API_BASE_URL}/api/v1/user-service/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Login failed' },
        { status: response.status }
      )
    }

    const loginData = await response.json()

    // Extract the data from the response structure (backend returns data wrapper)
    const { data } = loginData
    const { token, refreshToken, email: userEmail, fullName, employeeId } = data

    // Parse firstName and lastName from fullName
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create the response
    const nextResponse = NextResponse.json({
      success: true,
      user: {
        email: userEmail,
        firstName,
        lastName,
        fullName,
        userId: employeeId, // Map employeeId to userId for consistency
      }
    })

    // Set cookies for token and refresh token
    // Set token cookie (expires in 1 day)
    nextResponse.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    })

    // Set refresh token cookie (expires in 30 days)
    nextResponse.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    // Set user info cookie (HTTP-only for server-side access)
    nextResponse.cookies.set('user_info', JSON.stringify({
      email: userEmail,
      firstName,
      lastName,
      fullName,
      userId: employeeId, // Map employeeId to userId for consistency
    }), {
      httpOnly: true, // Server-side only
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    })

    return nextResponse

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { cookies } from 'next/headers'

export interface UserInfo {
  email: string
  firstName: string
  lastName: string
  fullName: string
  userId: number
}

export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const cookieStore = await cookies()
    const userInfoCookie = cookieStore.get('user_info')
    
    if (!userInfoCookie?.value) {
      return null
    }
    
    const userInfo = JSON.parse(userInfoCookie.value) as UserInfo
    return userInfo
  } catch (error) {
    console.error('Failed to parse user info from cookies:', error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    return !!token?.value
  } catch (error) {
    console.error('Failed to check authentication:', error)
    return false
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    return token?.value || null
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

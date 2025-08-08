import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

type ServerRequestOptions = {
  headers?: Record<string, string>
  cache?: RequestCache
  revalidate?: number
}

class ServerApiClient {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_BASE_URL
  }

  private async getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    return token || null
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)))
          } else {
            url.searchParams.append(key, String(value))
          }
        }
      })
    }
    
    return url.toString()
  }

  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    params?: Record<string, any>,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const { headers = {}, cache = 'no-store', revalidate } = options
    
    // Build URL with query parameters
    const url = this.buildURL(endpoint, params)
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }
    
    // Add auth token if available
    const token = await this.getAuthToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
    
    // Prepare request config
    const config: RequestInit = {
      method,
      headers: requestHeaders,
      cache,
    }

    // Add revalidate if specified
    if (revalidate !== undefined) {
      config.next = { revalidate }
    }
    
    // Add body for non-GET requests
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }
      
      const responseData = await response.json()
      
      // Return the data directly if it's in the expected API response format
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data
      }
      
      return responseData
      
    } catch (error) {
      console.error(`Server API Error [${method} ${endpoint}]:`, error)
      throw error
    }
  }

  // GET request
  async get<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    options?: ServerRequestOptions
  ): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params, options)
  }

  // POST request
  async post<T = any>(
    endpoint: string, 
    body?: any, 
    options?: ServerRequestOptions
  ): Promise<T> {
    return this.request<T>('POST', endpoint, body, undefined, options)
  }

  // PUT request
  async put<T = any>(
    endpoint: string, 
    body?: any, 
    options?: ServerRequestOptions
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, body, undefined, options)
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    options?: ServerRequestOptions
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, params, options)
  }
}

// Create and export the server API client instance
export const serverApi = new ServerApiClient()

// Server-side employee API functions
export const serverEmployeeAPI = {
  async getEmployees(params: Record<string, any> = {}) {
    try {
      const response = await serverApi.get<{ total: number; data: any[] }>('/employee', params, {
        cache: 'no-store' // Always fetch fresh data
      })
      return response
    } catch (error) {
      console.error('Failed to fetch employees on server:', error)
      return { data: [], total: 0 }
    }
  },

  async getMyProfile() {
    try {
      const profile = await serverApi.get('/employee/my-profile', undefined, {
        cache: 'no-store'
      })
      return profile
    } catch (error) {
      console.error('Failed to fetch profile on server:', error)
      return null
    }
  }
}

// Server-side API client for Next.js API routes
import { cookies } from 'next/headers';

class ServerApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle standardized response format
    if (data && typeof data === 'object' && 'data' in data && 'statusCode' in data) {
      return data.data;
    }
    
    return data;
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseURL);
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle standardized response format
    if (data && typeof data === 'object' && 'data' in data && 'statusCode' in data) {
      return data.data;
    }
    
    return data;
  }
}

export const serverApi = new ServerApiClient();

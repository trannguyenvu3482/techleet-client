

type InternalRequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  timeout?: number;
};

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout = 60000) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
    this.defaultTimeout = timeout;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null

    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.token || null
      }
    } catch (error) {
      // Failed to get auth token - silently return null
    }
    return null
  }

  private clearAuthAndRedirect(): void {
    if (typeof window !== 'undefined') {
      // Only redirect if we're not already on the sign-in page
      if (window.location.pathname !== '/sign-in') {
        localStorage.removeItem('auth-storage')
        // Use window.location to avoid Next.js router issues
        window.location.href = '/sign-in'
      }
    }
  }

  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(
      endpoint.startsWith("/") ? endpoint.slice(1) : endpoint,
      this.baseURL
    );

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

    return url.toString();
  }

  private async request<T = unknown>(
    method: string,
    endpoint: string,
    options: InternalRequestOptions = {}
  ): Promise<T> {
    const {
      headers = {},
      params,
      body,
      timeout = this.defaultTimeout,
    } = options;

    // Build URL with query parameters
    const url = this.buildURL(endpoint, params);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Prepare request config
    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: "include", // Include cookies
    };

    // Add body for non-GET requests
    if (body && method !== "GET") {
      if (body instanceof FormData) {
        // Remove Content-Type for FormData (browser will set it with boundary)
        delete requestHeaders["Content-Type"];
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle different response types
      const contentType = response.headers.get("content-type");
      let responseData: unknown;

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - clear auth and redirect
        // But don't redirect if the request was to the login endpoint itself
        if (response.status === 401) {
          const isLoginEndpoint = endpoint.includes('/auth/login');
          if (!isLoginEndpoint) {
            this.clearAuthAndRedirect();
          }
        }

        // Handle API error responses - check if it's a standardized error format
        if (responseData && typeof responseData === 'object') {
          const errorData = responseData as { message?: string; error?: string };
          const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
          throw new ApiError(errorMessage, response.status, responseData);
        } else {
          throw new ApiError(`HTTP ${response.status}`, response.status);
        }
      }

      // Check if response follows standardized format { statusCode, timestamp, path, data }
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'statusCode' in responseData) {
        // Return just the data portion for backward compatibility
        return (responseData as { data: T }).data;
      }

      // Return the raw response data for non-standardized endpoints
      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError("Request timeout", 408);
        }
        throw new ApiError(error.message, 0);
      }

      throw new ApiError("Unknown error occurred", 0);
    }
  }

  // GET request
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: Omit<InternalRequestOptions, "params" | "body">
  ): Promise<T> {
    return this.request<T>("GET", endpoint, { ...options, params });
  }

  // POST request
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<InternalRequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("POST", endpoint, { ...options, body });
  }

  // PUT request
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<InternalRequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, { ...options, body });
  }

  // PATCH request
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<InternalRequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, { ...options, body });
  }

  // DELETE request
  async delete<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: Omit<InternalRequestOptions, "params" | "body">
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, { ...options, params });
  }

  // Upload file
  async upload<T = unknown>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>("POST", endpoint, { body: formData });
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Create and export the default API client instance
export const api = new ApiClient();

// Export the class for creating custom instances if needed
export { ApiClient };

// Export types
export type { InternalRequestOptions as RequestOptions };

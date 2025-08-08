type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
};

type ApiResponse<T = any> = {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
};

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout = 10000) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
    this.defaultTimeout = timeout;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    console.log("auth token: ", token);

    return token || null;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
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

  private async request<T = any>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
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
      let responseData: any;

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Handle API error responses
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `HTTP ${response.status}`;
        throw new ApiError(errorMessage, response.status, responseData);
      }

      // Return the data directly if it's in the expected API response format
      if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData
      ) {
        return responseData.data;
      }

      return responseData;
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
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, "params" | "body">
  ): Promise<T> {
    return this.request<T>("GET", endpoint, { ...options, params });
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("POST", endpoint, { ...options, body });
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, { ...options, body });
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, { ...options, body });
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, "params" | "body">
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, { ...options, params });
  }

  // Upload file
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
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
  public data?: any;

  constructor(message: string, status: number, data?: any) {
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
export type { RequestOptions, ApiResponse };

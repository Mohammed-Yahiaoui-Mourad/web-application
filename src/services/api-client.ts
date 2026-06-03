/**
 * Secure API Client for AMAL Web Application
 * Handles JWT authentication, error handling, and API communication
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

class ApiClient {
  private readonly baseUrl: string;
  private tokenKey = 'access_token';

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store JWT token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Build headers with authentication
   */
  private getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw this.createError('Session expirée. Veuillez vous reconnecter.', 401);
    }

    // Try to parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch {
      // If not JSON, throw a generic error
      if (!response.ok) {
        throw this.createError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      return undefined as T;
    }

    // Check for API-level errors
    if (!response.ok) {
      const errorMsg = data.error || data.message || data.detail || `Erreur serveur (${response.status})`;
      throw this.createError(errorMsg, response.status, data);
    }

    // Handle standardized API response format
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw this.createError(data.error || data.message || 'Erreur serveur', response.status, data);
      }
      return data.data as T;
    }

    return data as T;
  }

  /**
   * Create a standardized API error
   */
  private createError(message: string, status?: number, details?: any): ApiError {
    const error: ApiError = new Error(message);
    error.status = status;
    error.details = details;
    return error;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    contentType: string = 'application/json'
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(contentType);

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      if (contentType === 'application/json') {
        options.body = JSON.stringify(body);
      } else if (body instanceof URLSearchParams) {
        options.body = body.toString();
      } else if (body instanceof FormData) {
        options.body = body;
        // Remove Content-Type header for FormData to allow browser to set it
        delete (options.headers as any)['Content-Type'];
      }
    }

    try {
      const response = await fetch(url, options);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, contentType?: string): Promise<T> {
    // Auto-detect content type for URLSearchParams
    if (body instanceof URLSearchParams && !contentType) {
      contentType = 'application/x-www-form-urlencoded';
    }
    return this.request<T>(endpoint, 'POST', body, contentType);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

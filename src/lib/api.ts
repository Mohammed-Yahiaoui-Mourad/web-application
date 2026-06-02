import { MOCK_RESPONSES } from './mocks';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const USE_MOCKS = import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === 'true';

async function fetchFromBackend(endpoint: string, method = 'GET', body: any = null) {
  // Mock Interception
  if (USE_MOCKS) {
    const cleanEndpoint = endpoint.split('?')[0];
    
    // Exact match
    if (MOCK_RESPONSES[cleanEndpoint]) {
      console.log(`[MOCK] ${method} ${endpoint}`, MOCK_RESPONSES[cleanEndpoint]);
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_RESPONSES[cleanEndpoint]), 500);
      });
    }
    
    // Pattern matches for dynamic routes
    if (cleanEndpoint.match(/\/api\/admin\/requests\/.*\/broadcast/)) {
      return { data: Math.floor(Math.random() * 10) + 1 };
    }
    if (cleanEndpoint.match(/\/api\/admin\/requests\/.*\/status/)) {
      return { success: true };
    }

    if (method !== 'GET') {
      console.log(`[MOCK DEFAULT] ${method} ${endpoint}`);
      return { success: true, message: 'Mock response' };
    }
  }

  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  
  if (body instanceof URLSearchParams) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    options.body = body instanceof URLSearchParams ? body.toString() : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error || errData.message || errData.detail || `Erreur serveur (${response.status})`;
      throw new Error(errorMsg);
    }

    const resJson = await response.json();
    if (resJson && typeof resJson === 'object' && 'success' in resJson && 'data' in resJson) {
      if (!resJson.success) {
        throw new Error(resJson.error || resJson.message || 'Server error');
      }
      return resJson.data;
    }
    return resJson;
  } catch (error) {
    // If backend fails and we are in dev, fallback to mocks if available
    if (USE_MOCKS) {
      const cleanEndpoint = endpoint.split('?')[0];
      if (MOCK_RESPONSES[cleanEndpoint]) {
        console.warn(`[MOCK FALLBACK] ${method} ${endpoint} due to error:`, error);
        return MOCK_RESPONSES[cleanEndpoint];
      }
    }
    throw error;
  }
}

export const api = {
  get: (endpoint: string) => fetchFromBackend(endpoint, 'GET'),
  post: (endpoint: string, body?: any) => fetchFromBackend(endpoint, 'POST', body),
  patch: (endpoint: string, body?: any) => fetchFromBackend(endpoint, 'PATCH', body),
  delete: (endpoint: string) => fetchFromBackend(endpoint, 'DELETE'),
};

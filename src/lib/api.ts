const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function fetchFromBackend(endpoint: string, method = 'GET', body: any = null) {
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

  const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
  
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => fetchFromBackend(endpoint, 'GET'),
  post: (endpoint: string, body?: any) => fetchFromBackend(endpoint, 'POST', body),
  patch: (endpoint: string, body?: any) => fetchFromBackend(endpoint, 'PATCH', body),
  delete: (endpoint: string) => fetchFromBackend(endpoint, 'DELETE'),
};

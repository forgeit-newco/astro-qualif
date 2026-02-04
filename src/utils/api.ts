const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Add Authorization header if token exists
export function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Fetch wrapper that handles authentication errors
export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  // If unauthorized or forbidden, clear token and redirect to login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  return response;
}

export { API_BASE };

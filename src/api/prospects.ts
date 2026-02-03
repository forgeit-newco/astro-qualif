import type { Prospect, ProspectFormData, ProspectStatus } from '../types/prospect';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Add Authorization header if token exists
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const prospectsApi = {
  getAll: async (): Promise<Prospect[]> => {
    const response = await fetch(`${API_BASE}/prospects`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des prospects');
    }
    return response.json();
  },

  getById: async (id: string): Promise<Prospect> => {
    const response = await fetch(`${API_BASE}/prospects/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Prospect non trouvé');
    }
    return response.json();
  },

  create: async (data: ProspectFormData): Promise<Prospect> => {
    const response = await fetch(`${API_BASE}/prospects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du prospect');
    }
    return response.json();
  },

  updateStatus: async (id: string, status: ProspectStatus): Promise<Prospect> => {
    const response = await fetch(`${API_BASE}/prospects/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du statut');
    }
    return response.json();
  },

  update: async (id: string, data: Partial<Prospect>): Promise<Prospect> => {
    const response = await fetch(`${API_BASE}/prospects/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du prospect');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/prospects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du prospect');
    }
  },
};

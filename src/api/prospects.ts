import type { Prospect, ProspectFormData, ProspectStatus } from '../types/prospect';
import { API_BASE, getHeaders, authenticatedFetch } from '../utils/api';

export const prospectsApi = {
  getAll: async (): Promise<Prospect[]> => {
    const response = await authenticatedFetch(`${API_BASE}/prospects`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des prospects');
    }
    return response.json();
  },

  getById: async (id: string): Promise<Prospect> => {
    const response = await authenticatedFetch(`${API_BASE}/prospects/${id}`, {
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
    const response = await authenticatedFetch(`${API_BASE}/prospects/${id}`, {
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
    const response = await authenticatedFetch(`${API_BASE}/prospects/${id}`, {
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
    const response = await authenticatedFetch(`${API_BASE}/prospects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du prospect');
    }
  },
};

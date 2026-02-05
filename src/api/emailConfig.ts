import { API_BASE, getHeaders, authenticatedFetch } from '../utils/api';

export interface ChallengeTemplate {
  constat: string;
  solution: string;
  nextSteps: Record<string, string>; // Key: maturity level, Value: next steps text
}

export interface EmailTemplateConfig {
  PK: string;
  SK: string;
  version: string;
  templates: Record<string, ChallengeTemplate>;
  updatedAt: string | null;
  updatedBy: string | null;
}

export const emailConfigApi = {
  get: async (): Promise<EmailTemplateConfig> => {
    const response = await authenticatedFetch(`${API_BASE}/config/email-templates`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la configuration');
    }
    return response.json();
  },

  update: async (templates: Record<string, ChallengeTemplate>): Promise<EmailTemplateConfig> => {
    const response = await authenticatedFetch(`${API_BASE}/config/email-templates`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ templates }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la configuration');
    }
    return response.json();
  },
};

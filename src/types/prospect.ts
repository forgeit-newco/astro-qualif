// === CONSTANTES ===

export const POSITIONS = ['CTO', 'VP Engineering', 'Tech Lead', 'Platform Engineer'] as const;
export type Position = (typeof POSITIONS)[number];

export const TEAM_SIZES = ['<40', '40-100', '100+'] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export const FORGES = ['GitHub', 'GitLab', 'Azure DevOps', 'Bitbucket'] as const;
export type Forge = (typeof FORGES)[number];

export const CLOUDS = ['AWS', 'GCP', 'Azure', 'On-Premise'] as const;
export type Cloud = (typeof CLOUDS)[number];

export const DEPLOYMENTS = ['ArgoCD', 'Jenkins', 'GitHub Actions', 'GitLab CI'] as const;
export type Deployment = (typeof DEPLOYMENTS)[number];

export const TICKET_MANAGERS = ['Jira', 'Azure DevOps', 'Trello', 'Notion'] as const;
export type TicketManager = (typeof TICKET_MANAGERS)[number];

export const MONITORING_TOOLS = ['Grafana', 'Datadog', 'Open Telemetry'] as const;
export type MonitoringTool = (typeof MONITORING_TOOLS)[number];

export const MATURITY_LEVELS = ['Industrialisation', 'Expertise', 'Reconciliation', 'Autre/Ne sait pas'] as const;
export type MaturityLevel = (typeof MATURITY_LEVELS)[number];

export const CHALLENGES = ['Onboarding/Delivery', 'Conformite/Scoring', 'FinOps'] as const;
export type Challenge = (typeof CHALLENGES)[number];

export const PROSPECT_STATUSES = [
  'Nouveau',
  'Qualifie',
  'RDV Planifie',
  'En Discussion',
  'Converti',
  'Perdu',
] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

// === TYPES FORMULAIRE ===

export interface ProspectIdentity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: Position;
}

export interface ProspectTechEcosystem {
  teamSize: TeamSize;
  forges: Forge[];
  clouds: Cloud[];
  deployments: Deployment[];
  ticketManagers: TicketManager[];
  monitoringTools: MonitoringTool[];
}

export interface ProspectDiagnostic {
  maturityLevel: MaturityLevel;
}

export interface ProspectChallenges {
  priorities: Challenge[];
}

export interface ProspectCTA {
  wantsDiagnostic: boolean;
  wantsTrial: boolean;
}

export interface ProspectFormData {
  identity: ProspectIdentity;
  techEcosystem: ProspectTechEcosystem;
  diagnostic: ProspectDiagnostic;
  challenges: ProspectChallenges;
  cta: ProspectCTA;
}

// === ENTITÉ COMPLÈTE ===

export interface Prospect extends ProspectFormData {
  id: string;
  status: ProspectStatus;
  createdAt: string;
  updatedAt: string;
}

// === TYPES KANBAN ===

export type ProspectsByStatus = Record<ProspectStatus, Prospect[]>;

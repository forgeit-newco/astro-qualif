# Astro-Qualif

## Project Overview

Application de qualification de prospects pour la plateforme SaaS Astrolabe de Forge It.
Permet d'identifier rapidement l'ICP (Ideal Customer Profile) d'un prospect via un formulaire structuré et de suivre les prospects qualifiés dans un Kanban protégé par authentification.

## Architecture

```
src/
├── api/
│   └── prospects.ts              # Client API REST pour JSON Server
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Formulaire de connexion
│   │   └── ProtectedRoute.tsx    # Wrapper protection route
│   ├── form/
│   │   ├── QualificationForm.tsx # Conteneur principal + reCAPTCHA
│   │   ├── IdentityBlock.tsx     # Bloc 1 - Identité (email, phone)
│   │   ├── TechEcosystemBlock.tsx# Bloc 2 - Écosystème Tech
│   │   ├── DiagnosticBlock.tsx   # Bloc 3 - Diagnostic
│   │   ├── ChallengesBlock.tsx   # Bloc 4 - Enjeux
│   │   └── CTABlock.tsx          # Bloc 5 - Call To Action
│   └── kanban/
│       ├── KanbanBoard.tsx       # Board avec drag & drop
│       ├── KanbanColumn.tsx      # Colonne de statut
│       ├── ProspectCard.tsx      # Carte prospect (click + drag)
│       └── ProspectDetailModal.tsx # Modal détails prospect
├── contexts/
│   └── AuthContext.tsx           # Context authentification cookie
├── hooks/
│   ├── useProspects.ts           # Hook React Query pour CRUD prospects
│   └── useAuth.ts                # Hook accès auth context
├── theme/
│   └── astrolabeTheme.ts         # Thème MUI Astrolabe
├── types/
│   └── prospect.ts               # Types TypeScript
├── pages/
│   ├── FormPage.tsx              # Page formulaire
│   ├── KanbanPage.tsx            # Page Kanban (protégée)
│   └── LoginPage.tsx             # Page connexion
├── App.tsx                       # Router + Providers + Auth
└── main.tsx                      # Point d'entrée
```

## Exposed Components

| Component | Description | Mount Point |
|-----------|-------------|-------------|
| `QualificationForm` | Formulaire de qualification 5 blocs + reCAPTCHA | `/form` |
| `KanbanBoard` | Board Kanban avec drag & drop | `/kanban` |
| `ProspectDetailModal` | Modal affichant tous les détails d'un prospect | Kanban |
| `LoginForm` | Formulaire de connexion | `/login` |
| `ProtectedRoute` | HOC protection routes authentifiées | - |

## Routes

| Path | Component | Description | Protected |
|------|-----------|-------------|-----------|
| `/` | Redirect | Redirige vers `/form` | Non |
| `/form` | `FormPage` | Formulaire de qualification | Non |
| `/login` | `LoginPage` | Page de connexion | Non |
| `/kanban` | `KanbanPage` | Vue Kanban des prospects | Oui |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/prospects` | Liste tous les prospects |
| GET | `/prospects/:id` | Récupère un prospect |
| POST | `/prospects` | Crée un prospect |
| PATCH | `/prospects/:id` | Met à jour un prospect |
| DELETE | `/prospects/:id` | Supprime un prospect |

## Services

- `prospectsApi`: Client API pour les opérations CRUD sur les prospects
- `useProspects`: Hook React Query encapsulant les opérations API
- `useAuth`: Hook pour accéder au contexte d'authentification
- `AuthProvider`: Provider React pour l'état d'authentification

## Exported Types

- `Prospect`: Entité prospect complète (id, status, timestamps, données formulaire)
- `ProspectFormData`: Données du formulaire de qualification
- `ProspectIdentity`: Identité prospect (firstName, lastName, email, phone, company, position)
- `ProspectStatus`: Union type des statuts Kanban
- `Position`, `TeamSize`, `Forge`, `Cloud`, `Deployment`: Types pour les champs

## Plugin Dependencies

### Required Plugins

| Plugin | Package | Usage |
|--------|---------|-------|
| React Query | `@tanstack/react-query` | Data fetching et cache |
| React Hook Form | `react-hook-form` | Gestion formulaire |
| dnd-kit | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Drag & drop Kanban |
| Material-UI | `@mui/material` | Composants UI |
| React Router | `react-router-dom` | Navigation SPA |
| reCAPTCHA | `react-google-recaptcha` | Protection anti-bot formulaire |

### Peer Dependencies

| Plugin | Package | Optional | Usage |
|--------|---------|----------|-------|
| JSON Server | `json-server` | Non | Mock API REST |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| API_BASE | URL du JSON Server | `http://localhost:3001` |
| PORT (Vite) | Port du serveur dev | `5173` |
| PORT (JSON Server) | Port de l'API mock | `3001` |
| RECAPTCHA_SITE_KEY | Clé site reCAPTCHA | `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` (test) |

## Authentification

| Credential | Value | Description |
|------------|-------|-------------|
| Username | `admin` | Nom d'utilisateur |
| Password | `forge2024` | Mot de passe |

L'authentification utilise un cookie `astro_auth_token` avec une durée de 24h.

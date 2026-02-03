# Astro Qualif - Qualification de prospects pour Astrolabe

Application React de qualification de prospects pour la plateforme SaaS **Astrolabe** de Forge It.

Identifie rapidement l'ICP (Ideal Customer Profile) via un formulaire structuré en 5 blocs et permet de suivre les prospects qualifiés dans un Kanban protégé par authentification.

## Déploiement AWS

L'application est prête pour un déploiement serverless sur AWS à **moindre coût** (2-5$/mois en POC).

**Guide complet** : [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md)

**Architecture détaillée** : [ARCHITECTURE.md](./ARCHITECTURE.md)

**Guide de déploiement** : [DEPLOY.md](./DEPLOY.md)

### Architecture AWS

```
Internet → CloudFront (CDN) → S3 (Frontend React)
Internet → API Gateway (REST) → Lambda Functions → DynamoDB
                              ↓
                          JWT Authorizer → Secrets Manager
```

### Démarrage rapide

```bash
# 1. Setup automatique
./scripts/setup.sh

# 2. Déployer l'infrastructure
make terraform-apply

# 3. Initialiser l'utilisateur admin
make init-admin

# 4. Déployer le frontend
make deploy-frontend

# 5. Tester
open $(cd terraform && terraform output -raw frontend_url)
```

---

## Développement local

### Prérequis

- Node.js 20.x
- Yarn 4.12.0
- JSON Server (inclus)

### Installation

```bash
# Installer les dépendances
NPM_TOKEN=dummy yarn install

# Lancer l'application (frontend + mock API)
yarn start

# Ou séparément
yarn dev        # Frontend uniquement (port 5173)
yarn server     # JSON Server uniquement (port 3001)
```

### Structure

```
src/
├── api/                    # Client API REST
├── components/
│   ├── auth/              # Login, ProtectedRoute
│   ├── form/              # Formulaire de qualification (5 blocs)
│   └── kanban/            # Kanban avec drag & drop
├── contexts/              # AuthContext (JWT)
├── hooks/                 # useAuth, useProspects (React Query)
├── pages/                 # FormPage, LoginPage, KanbanPage
├── theme/                 # Thème Material-UI Astrolabe
└── types/                 # Types TypeScript
```

### Authentification locale

- **Email** : `admin@example.com`
- **Password** : `forge2024`

### Formulaire de qualification

**5 blocs** :

1. **Identité** : Prénom, Nom, Entreprise, Poste (CTO, VP Eng, Tech Lead, Platform Eng)
2. **Écosystème Tech** : Taille équipe, Forge (GitHub, GitLab, ...), Cloud (AWS, GCP, Azure), Déploiement (ArgoCD, Jenkins, ...)
3. **Diagnostic** : Industrialisation, Expertise, Réconciliation
4. **Enjeux Prioritaires** : Onboarding/Delivery, Conformité/Scoring, FinOps
5. **CTA** : Diagnostic de maturité avec experts (30 min)

**Protection anti-bot** : reCAPTCHA v2

### Kanban

**3 colonnes** :
- Nouveau
- Qualifié
- Non qualifié

**Drag & drop** avec @dnd-kit

**Modal détails** : Affiche toutes les informations d'un prospect au clic

---

## Stack technique

### Frontend

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Material-UI v5** (Astrolabe theme)
- **React Router v6** (navigation)
- **React Query** (data fetching)
- **React Hook Form** (gestion formulaire)
- **@dnd-kit** (drag & drop)
- **reCAPTCHA v2** (protection anti-bot)

### Backend (AWS)

- **API Gateway REST** (API backend)
- **Lambda Functions** (Node.js 20.x)
  - Auth (login JWT)
  - Authorizer (JWT validation)
  - CRUD (prospects)
  - reCAPTCHA (validation serveur)
- **DynamoDB** (base de données On-Demand)
- **Secrets Manager** (JWT secret, reCAPTCHA secret)
- **S3 + CloudFront** (frontend hosting)
- **Route53** (DNS optionnel)

### Infrastructure

- **Terraform** (Infrastructure as Code)
- **GitHub Actions** (CI/CD)
- **AWS CLI** (déploiement)

---

## Scripts disponibles

### Développement

```bash
yarn dev          # Frontend dev server (port 5173)
yarn server       # JSON Server mock API (port 3001)
yarn start        # Frontend + JSON Server concurrently
```

### Build

```bash
yarn build        # Build production (dist/)
yarn preview      # Preview build local
```

### Quality

```bash
yarn lint         # ESLint
yarn typecheck    # TypeScript check
```

### Déploiement AWS

```bash
make terraform-apply    # Déployer infrastructure
make deploy-lambda      # Déployer Lambda functions
make deploy-frontend    # Déployer frontend S3/CloudFront
make deploy-all         # Tout déployer
make init-admin         # Créer utilisateur admin DynamoDB
```

---

## Configuration

### Variables d'environnement

**Développement local** (`.env.local`) :
```bash
VITE_API_URL=http://localhost:3001
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Production** (`.env.production`) :
```bash
VITE_API_URL=https://[api-id].execute-api.eu-west-1.amazonaws.com/production
VITE_RECAPTCHA_SITE_KEY=YOUR_PRODUCTION_KEY
```

### Terraform

Copier `terraform/terraform.tfvars.example` vers `terraform/terraform.tfvars` et configurer :

```hcl
aws_region           = "eu-west-1"
environment          = "production"
admin_email          = "admin@example.com"
admin_password       = "forge2024"
recaptcha_secret_key = "YOUR_SECRET_KEY"
```

---

## API Endpoints (AWS)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/login` | Non | Login (retourne JWT) |
| POST | `/verify-recaptcha` | Non | Validation reCAPTCHA |
| POST | `/prospects` | Non | Création prospect (public) |
| GET | `/prospects` | Oui | Liste prospects (Kanban) |
| GET | `/prospects/{id}` | Oui | Détails prospect |
| PATCH | `/prospects/{id}` | Oui | Mise à jour prospect |
| DELETE | `/prospects/{id}` | Oui | Suppression prospect |

**Authentification** : Header `Authorization: Bearer <jwt-token>`

---

## Coûts AWS

### POC (100 requêtes/jour)

- **2-5$/mois**
- Free Tier : Lambda (1M req), API Gateway (1M req 12 mois), CloudFront (1 TB)

### Production (1000 requêtes/jour)

- **8-13$/mois**
- DynamoDB On-Demand, Lambda, API Gateway, CloudFront, Secrets Manager

---

## Sécurité

- ✅ **HTTPS obligatoire** (CloudFront + ACM certificate)
- ✅ **JWT tokens** (HS256, expiration 24h)
- ✅ **bcrypt** (hashing passwords)
- ✅ **Secrets Manager** (JWT secret, reCAPTCHA secret)
- ✅ **IAM Least Privilege** (Lambda roles)
- ✅ **API Throttling** (100 req/sec)
- ✅ **DynamoDB encryption** (at rest)
- ✅ **S3 private** (CloudFront OAI)

---

## Monitoring

### CloudWatch Logs

```bash
make logs-auth    # Logs Lambda Auth
make logs-crud    # Logs Lambda CRUD
make logs-api     # Logs API Gateway
```

### Métriques CloudWatch

- Lambda invocations, errors, duration
- API Gateway requests, 4XX/5XX errors
- DynamoDB read/write capacity

---

## CI/CD (GitHub Actions)

Déploiement automatique sur push `main` :

1. Build Lambda functions
2. Update Lambda code (AWS CLI)
3. Build frontend (Vite)
4. Upload S3 + invalidate CloudFront

**Configuration** : Voir [DEPLOY.md](./DEPLOY.md) section "GitHub Actions"

---

## Documentation

- [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé déploiement AWS
- [DEPLOY.md](./DEPLOY.md) - Guide complet de déploiement
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [lambda/README.md](./lambda/README.md) - Documentation Lambda functions
- [terraform/README.md](./terraform/README.md) - Infrastructure Terraform
- [CLAUDE.md](./CLAUDE.md) - Contexte projet pour Claude

---

## Contexte métier

### Objectif

Transformer le formulaire de qualification en **moteur de conversion** pour Astrolabe.

### Stratégie de prospection

**Site Web** : Approche "Setup Personnalisé"
- Formulaire perçu comme première étape de configuration
- Pas un barrage commercial

**Prospection Directe** (LinkedIn/Mail) : Approche "Diagnostic"
- Outil de diagnostic apportant de la valeur
- Même si le prospect n'achète pas

### Segmentation automatique

- **ICP Validation** : Taille équipe, maturité tech
- **Priorisation** : Alertes profils C-Level (CTO/DSI)
- **Pivot de vente** : Produit vs Expertise selon diagnostic
- **Personnalisation** : Welcome Pack et argumentaire adaptés

---

## Licence

Propriété de **Forge It**

---

## Support

Pour toute question sur le déploiement AWS, consulter [DEPLOY.md](./DEPLOY.md) section "Troubleshooting".

Pour l'architecture technique, consulter [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Package Manager

Ce projet utilise **Yarn 4 (Berry)** comme package manager.

Toutes les commandes doivent être exécutées avec `yarn` (jamais `npm` ou `pnpm`).

Pour les environnements nécessitant un token d'authentification sans accès réel à un registre privé :

```bash
NPM_TOKEN=dummy yarn install
```

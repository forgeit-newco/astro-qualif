# AWS Deployment - Résumé Rapide

## Infrastructure complète (Terraform)

```
astro-qualif/
├── terraform/               # Infrastructure as Code
│   ├── main.tf             # Provider AWS
│   ├── variables.tf        # Variables configurables
│   ├── outputs.tf          # Outputs après déploiement
│   ├── dynamodb.tf         # Table DynamoDB On-Demand
│   ├── lambda.tf           # 4 fonctions Lambda
│   ├── api-gateway.tf      # API Gateway REST + JWT Authorizer
│   ├── s3-cloudfront.tf    # Frontend hosting
│   ├── secrets.tf          # Secrets Manager (JWT, reCAPTCHA)
│   ├── iam.tf              # IAM roles et policies
│   └── terraform.tfvars.example
│
├── lambda/                 # Fonctions Lambda Node.js 20.x
│   ├── auth/              # POST /auth/login
│   ├── authorizer/        # Lambda Authorizer (JWT validation)
│   ├── crud/              # CRUD prospects (GET/POST/PATCH/DELETE)
│   └── recaptcha/         # POST /verify-recaptcha
│
├── scripts/
│   ├── init-admin-user.js # Script création utilisateur admin
│   └── setup.sh           # Script setup automatique
│
├── .github/workflows/
│   └── deploy.yml         # CI/CD GitHub Actions
│
├── DEPLOY.md              # Guide complet de déploiement
├── ARCHITECTURE.md        # Documentation architecture
└── Makefile               # Commandes simplifiées
```

---

## Démarrage rapide

### 1. Prérequis

```bash
# Installer les outils
brew install awscli terraform

# Configurer AWS
aws configure
```

### 2. Setup automatique

```bash
# Lancer le script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Déployer l'infrastructure

```bash
# Option A : Via Makefile (recommandé)
make terraform-init
make terraform-plan
make terraform-apply

# Option B : Manuel
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 4. Initialiser l'utilisateur admin

```bash
make init-admin
# Entrer : admin@example.com / forge2024
```

### 5. Déployer le frontend

```bash
make deploy-frontend
```

### 6. Tester

```bash
# Récupérer les URLs
cd terraform
terraform output

# Ouvrir le frontend
open $(terraform output -raw frontend_url)
```

---

## Architecture déployée

```
Internet → CloudFront → S3 (Frontend React)
Internet → API Gateway → Lambda Functions → DynamoDB
                      ↓
                  Authorizer (JWT)
                      ↓
                  Secrets Manager
```

---

## Services AWS créés

| Service | Ressource | Coût estimé |
|---------|-----------|-------------|
| **S3** | 1 bucket (frontend) | 0.01$/mois |
| **CloudFront** | 1 distribution | 0-1$/mois (Free Tier) |
| **Lambda** | 4 fonctions | 0$ (Free Tier) |
| **API Gateway** | 1 REST API | 0$ (Free Tier 12 mois) |
| **DynamoDB** | 1 table On-Demand | 0-2$/mois |
| **Secrets Manager** | 3 secrets | 1.20$/mois |
| **Route53** | 1 hosted zone (optionnel) | 0.50$/mois |
| **CloudWatch Logs** | 4 log groups | 0$ (< 5 GB) |
| **IAM** | Roles/Policies | Gratuit |
| **ACM** | 1 certificat SSL | Gratuit |
| **TOTAL** | | **2-5$/mois** |

---

## API Endpoints déployés

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/login` | Non | Authentification (retourne JWT) |
| POST | `/verify-recaptcha` | Non | Validation reCAPTCHA serveur |
| POST | `/prospects` | Non | Création prospect (formulaire public) |
| GET | `/prospects` | Oui | Liste des prospects (Kanban) |
| GET | `/prospects/{id}` | Oui | Détails d'un prospect |
| PATCH | `/prospects/{id}` | Oui | Mise à jour prospect |
| DELETE | `/prospects/{id}` | Oui | Suppression prospect |

**Base URL** : `https://[api-id].execute-api.eu-west-1.amazonaws.com/production`

---

## Variables d'environnement

### Frontend (.env.production)

```bash
VITE_API_URL=https://[api-id].execute-api.eu-west-1.amazonaws.com/production
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

### Terraform (terraform.tfvars)

```hcl
aws_region           = "eu-west-1"
environment          = "production"
admin_email          = "admin@example.com"
admin_password       = "forge2024"
recaptcha_secret_key = "YOUR_SECRET_KEY"
```

---

## Commandes utiles (Makefile)

```bash
# Infrastructure
make terraform-init      # Initialiser Terraform
make terraform-plan      # Planifier les changements
make terraform-apply     # Appliquer les changements
make terraform-destroy   # Détruire l'infrastructure

# Lambda
make install-lambda      # Installer dépendances Lambda
make build-lambda        # Build packages ZIP
make deploy-lambda       # Déployer Lambda sur AWS

# Frontend
make deploy-frontend     # Build + upload S3 + invalidate CloudFront

# Tout déployer
make deploy-all          # Lambda + Frontend

# Admin
make init-admin          # Créer utilisateur admin

# Logs
make logs-auth           # Logs Lambda Auth
make logs-crud           # Logs Lambda CRUD
make logs-api            # Logs API Gateway

# Test
make test-api            # Tester l'API login

# Nettoyage
make clean               # Nettoyer les builds
```

---

## CI/CD (GitHub Actions)

### Configuration requise

1. **Créer IAM Role pour GitHub Actions** (OIDC)
2. **Configurer GitHub Secrets** :

| Secret | Valeur |
|--------|--------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/github-actions-role` |
| `VITE_API_URL` | URL API Gateway |
| `VITE_RECAPTCHA_SITE_KEY` | Clé publique reCAPTCHA |
| `S3_BUCKET_NAME` | Nom du bucket S3 |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID distribution CloudFront |
| `FRONTEND_URL` | URL frontend |

### Déclenchement

- **Automatique** : Push sur `main`
- **Manuel** : GitHub Actions UI → "Run workflow"

---

## Sécurité appliquée

✅ **Secrets Manager** : JWT, reCAPTCHA, credentials chiffrés
✅ **IAM Least Privilege** : Chaque Lambda a le minimum de permissions
✅ **HTTPS obligatoire** : CloudFront + ACM certificate
✅ **API Throttling** : 100 req/sec, burst 50
✅ **DynamoDB Encryption** : Server-side encryption AWS managed
✅ **S3 Private** : Accès uniquement via CloudFront OAI
✅ **JWT Tokens** : Expiration 24h, HS256 signing
✅ **bcrypt** : Hashing passwords (cost factor 10)

---

## Monitoring

### CloudWatch Logs

```bash
# Suivre les logs en temps réel
aws logs tail /aws/lambda/astro-qualif-auth-production --follow
aws logs tail /aws/lambda/astro-qualif-crud-production --follow
aws logs tail /aws/apigateway/astro-qualif-production --follow
```

### Métriques CloudWatch

- Lambda invocations, errors, duration
- API Gateway requests, 4XX, 5XX errors
- DynamoDB consumed capacity, throttles

### Alarmes configurables

```bash
# Exemple : Lambda errors > 5
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-auth-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## Frontend adapté

### Modifications apportées

1. **src/api/prospects.ts** :
   - API_BASE via `import.meta.env.VITE_API_URL`
   - Authorization header avec JWT token

2. **src/contexts/AuthContext.tsx** :
   - Login async via API Gateway (`POST /auth/login`)
   - Token stocké dans localStorage
   - Loading state

3. **src/components/auth/LoginForm.tsx** :
   - Email au lieu de username
   - Async login
   - Loading state sur le bouton

4. **src/vite-env.d.ts** :
   - Types pour variables d'env Vite

---

## Troubleshooting rapide

### Erreur 403 CloudFront

```bash
# Re-upload frontend
make deploy-frontend
```

### Lambda timeout

```bash
# Augmenter timeout dans terraform/variables.tf
lambda_timeout = 30

# Redéployer
make terraform-apply
```

### CORS errors

Vérifier les headers dans les Lambda functions :
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

### "User not found" au login

```bash
# Réinitialiser l'admin
make init-admin
```

---

## Prochaines étapes

### Immédiatement

1. ✅ Changer le mot de passe admin par défaut
2. ✅ Configurer un domaine personnalisé (optionnel)
3. ✅ Activer les alarmes CloudWatch
4. ✅ Tester le formulaire de qualification
5. ✅ Tester le Kanban avec authentification

### Court terme (1 semaine)

1. Ajouter des utilisateurs supplémentaires
2. Configurer reCAPTCHA v3 production
3. Implémenter rotation des secrets JWT
4. Monitorer les coûts AWS (Cost Explorer)

### Moyen terme (1 mois)

1. Activer WAF si trafic > 1000 req/jour
2. Migrer vers Cognito si > 50 utilisateurs
3. Ajouter logs structurés (JSON) pour analyse
4. Implémenter backup/restore DynamoDB

---

## Support et documentation

- **Guide complet** : [DEPLOY.md](./DEPLOY.md)
- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Lambda functions** : [lambda/README.md](./lambda/README.md)
- **Terraform** : [terraform/README.md](./terraform/README.md)

---

## Commandes essentielles

```bash
# Récupérer toutes les infos de déploiement
cd terraform && terraform output

# Récupérer l'URL de l'API
terraform output -raw api_gateway_url

# Récupérer l'URL du frontend
terraform output -raw frontend_url

# Récupérer le nom de la table DynamoDB
terraform output -raw dynamodb_table_name

# Tester l'API login
curl -X POST $(terraform output -raw api_gateway_url)/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"forge2024"}'

# Invalider le cache CloudFront
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

---

## Budget AWS estimé

### Free Tier (12 premiers mois)

- Lambda : 1M requêtes/mois gratuit
- API Gateway : 1M requêtes/mois gratuit (12 mois)
- CloudFront : 1 TB transfert gratuit (12 mois)
- DynamoDB : 25 GB + 25 WCU/RCU gratuit

### Après Free Tier

**Scénario POC** (100 req/jour) : **2-5$/mois**

**Scénario Production** (1000 req/jour) : **8-13$/mois**

### Optimisation coûts

1. DynamoDB On-Demand (0$ si pas de trafic)
2. Lambda 256 MB (balance performance/coût)
3. CloudWatch Logs 7 jours retention
4. Pas de Provisioned Concurrency Lambda
5. Pas de X-Ray tracing (activer si debug nécessaire)
6. WAF désactivé par défaut (activer si DDoS)



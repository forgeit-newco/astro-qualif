# Guide de déploiement AWS

## Prérequis

### Outils nécessaires

- AWS CLI v2 (configuré avec les credentials)
- Terraform >= 1.6
- Node.js 20.x
- Yarn 4.12.0
- Compte AWS avec permissions IAM appropriées

### Installation des outils

```bash
# AWS CLI
brew install awscli

# Terraform
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Node.js via nvm
nvm install 20
nvm use 20

# Yarn 4
corepack enable
```

---

## Configuration initiale

### 1. Configuration AWS CLI

```bash
aws configure

# Entrer:
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region: eu-west-1
# Default output format: json
```

### 2. Variables d'environnement Terraform

Créer un fichier `terraform/terraform.tfvars` :

```hcl
aws_region      = "eu-west-1"
environment     = "production"
project_name    = "astro-qualif"

# Domaine personnalisé (optionnel)
domain_name     = "qualif.votre-domaine.com"
route53_zone_id = "Z1234567890ABC"  # ID de votre hosted zone Route53

# reCAPTCHA
recaptcha_site_key   = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"  # Clé publique
recaptcha_secret_key = "votre-secret-recaptcha"

# Admin credentials
admin_email    = "admin@example.com"
admin_password = "forge2024"  # Changez en production

# JWT secret (auto-généré si vide)
jwt_secret = ""
```

**IMPORTANT** : Ne jamais commiter `terraform.tfvars` (déjà dans .gitignore).

---

## Déploiement initial (Infrastructure)

### 1. Installer les dépendances Lambda

```bash
# Auth Lambda
cd lambda/auth
NPM_TOKEN=dummy yarn install
cd ../..

# Authorizer Lambda
cd lambda/authorizer
NPM_TOKEN=dummy yarn install
cd ../..

# CRUD Lambda
cd lambda/crud
NPM_TOKEN=dummy yarn install
cd ../..

# reCAPTCHA Lambda
cd lambda/recaptcha
NPM_TOKEN=dummy yarn install
cd ../..
```

### 2. Déployer l'infrastructure Terraform

```bash
cd terraform

# Initialiser Terraform
terraform init

# Vérifier le plan
terraform plan -out=tfplan

# Appliquer (créer l'infrastructure)
terraform apply tfplan

# Récupérer les outputs
terraform output
```

**Outputs importants** :
- `api_gateway_url` : URL de l'API Gateway
- `cloudfront_domain_name` : URL CloudFront du frontend
- `dynamodb_table_name` : Nom de la table DynamoDB
- `s3_bucket_name` : Nom du bucket S3

### 3. Initialiser l'utilisateur admin

```bash
cd ../scripts
NPM_TOKEN=dummy yarn install

# Récupérer le nom de la table
TABLE_NAME=$(cd ../terraform && terraform output -raw dynamodb_table_name)

# Créer l'utilisateur admin
node init-admin-user.js $TABLE_NAME admin@example.com forge2024
```

---

## Déploiement du frontend

### 1. Configuration des variables d'environnement

Créer `.env.production` :

```bash
# Récupérer l'URL de l'API depuis Terraform
cd terraform
terraform output -raw api_gateway_url

# Créer .env.production
cat > ../.env.production <<EOF
VITE_API_URL=https://your-api-id.execute-api.eu-west-1.amazonaws.com/production
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
EOF
```

### 2. Build et déploiement

```bash
cd ..

# Installer les dépendances
NPM_TOKEN=dummy yarn install

# Build pour production
yarn build

# Récupérer le nom du bucket S3
S3_BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)

# Upload vers S3
aws s3 sync dist/ s3://$S3_BUCKET/ --delete

# Invalider le cache CloudFront
CLOUDFRONT_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

### 3. Tester le déploiement

```bash
# Récupérer l'URL du frontend
cd terraform
terraform output -raw frontend_url

# Ouvrir dans le navigateur
open $(terraform output -raw frontend_url)
```

---

## Configuration GitHub Actions (CI/CD automatique)

### 1. Créer une IAM Role pour GitHub Actions (OIDC)

```bash
# Créer le rôle via AWS Console ou Terraform
# Trust policy pour GitHub Actions OIDC:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/astro-qualif:*"
        }
      }
    }
  ]
}
```

Attacher les policies :
- `AWSLambdaFullAccess`
- `AmazonS3FullAccess`
- `CloudFrontFullAccess`

### 2. Configurer les GitHub Secrets

Dans **Settings > Secrets and variables > Actions** :

| Secret | Valeur |
|--------|--------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/github-actions-role` |
| `VITE_API_URL` | `https://your-api.execute-api.eu-west-1.amazonaws.com/production` |
| `VITE_RECAPTCHA_SITE_KEY` | `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` |
| `S3_BUCKET_NAME` | `astro-qualif-frontend-production-ACCOUNT_ID` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234567890ABC` |
| `FRONTEND_URL` | `https://qualif.votre-domaine.com` |

### 3. Activer le workflow

Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement sur :
- Push sur la branche `main`
- Déclenchement manuel via GitHub Actions UI

---

## Mise à jour de l'infrastructure

### Modifier des ressources Terraform

```bash
cd terraform

# Modifier les fichiers .tf
vim variables.tf

# Planifier les changements
terraform plan -out=tfplan

# Appliquer
terraform apply tfplan
```

### Mettre à jour les Lambda functions manuellement

```bash
# Rebuild Lambda
cd lambda/auth
NPM_TOKEN=dummy yarn install
zip -r ../auth.zip . -x '*.zip' -x 'node_modules/.cache/*'

# Update via AWS CLI
aws lambda update-function-code \
  --function-name astro-qualif-auth-production \
  --zip-file fileb://../auth.zip
```

---

## Monitoring et Logs

### CloudWatch Logs

```bash
# Logs Lambda Auth
aws logs tail /aws/lambda/astro-qualif-auth-production --follow

# Logs Lambda CRUD
aws logs tail /aws/lambda/astro-qualif-crud-production --follow

# Logs API Gateway
aws logs tail /aws/apigateway/astro-qualif-production --follow
```

### Métriques CloudWatch

- Lambda invocations : `aws cloudwatch get-metric-statistics`
- API Gateway requests : Console AWS > API Gateway > Monitoring
- CloudFront metrics : Console AWS > CloudFront > Monitoring

---

## Estimation des coûts

### Scénario POC (100 requêtes/jour)

| Service | Coût mensuel | Free Tier |
|---------|--------------|-----------|
| DynamoDB | 0-2$ | 25 GB, 25 WCU/RCU |
| Lambda | 0$ | 1M requêtes |
| API Gateway | 0$ | 1M requêtes (12 mois) |
| S3 | 0.01$ | 5 GB |
| CloudFront | 0-1$ | 1 TB transfert (12 mois) |
| Secrets Manager | 0.80$ | 2 secrets x 0.40$ |
| Route53 | 0.50$ | Hosted zone |
| **TOTAL** | **2-5$/mois** | |

### Scénario Production (1000 requêtes/jour)

| Service | Coût mensuel |
|---------|--------------|
| DynamoDB | 2-5$ |
| Lambda | 0.20$ |
| API Gateway | 3.50$ |
| S3 + CloudFront | 1-2$ |
| Secrets Manager | 0.80$ |
| Route53 | 0.50$ |
| **TOTAL** | **8-13$/mois** |

---

## Sécurité

### Best Practices appliquées

1. **Secrets Manager** : JWT secret, reCAPTCHA secret chiffrés
2. **IAM Least Privilege** : Chaque Lambda a uniquement les permissions nécessaires
3. **HTTPS Obligatoire** : CloudFront + ACM certificate
4. **API Gateway Throttling** : 100 req/sec, burst 50
5. **DynamoDB Encryption** : Server-side encryption activé
6. **S3 Private** : Accès uniquement via CloudFront OAI
7. **CloudWatch Logs** : Retention 7 jours (POC) / 30 jours (prod)

### Rotation des secrets

```bash
# Générer un nouveau JWT secret
NEW_SECRET=$(openssl rand -base64 64)

# Mettre à jour dans Secrets Manager
aws secretsmanager update-secret \
  --secret-id astro-qualif/jwt-secret-production \
  --secret-string "$NEW_SECRET"

# Redémarrer les Lambdas (optionnel, prend effet au prochain cold start)
```

---

## Troubleshooting

### Erreur 403 sur CloudFront

**Cause** : S3 bucket policy incorrecte ou fichiers non uploadés.

**Solution** :
```bash
# Vérifier les fichiers dans S3
aws s3 ls s3://$S3_BUCKET_NAME/

# Re-upload
aws s3 sync dist/ s3://$S3_BUCKET_NAME/ --delete
```

### Lambda timeout

**Cause** : Lambda prend trop de temps (> 10s).

**Solution** :
```bash
# Augmenter le timeout dans Terraform
vim terraform/variables.tf
# lambda_timeout = 30

terraform apply
```

### CORS errors

**Cause** : API Gateway CORS mal configuré.

**Solution** :
- Vérifier les OPTIONS methods dans `api-gateway.tf`
- Vérifier les headers dans les Lambda (`Access-Control-Allow-Origin`)

### DynamoDB "User not found"

**Cause** : Utilisateur admin pas initialisé.

**Solution** :
```bash
cd scripts
node init-admin-user.js <table-name> admin@example.com forge2024
```

---

## Nettoyage (Destroy)

**ATTENTION** : Cette commande supprime TOUTES les ressources AWS.

```bash
cd terraform

# Vider le bucket S3 avant (Terraform ne peut pas détruire un bucket non vide)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 rm s3://$S3_BUCKET --recursive

# Détruire l'infrastructure
terraform destroy

# Confirmer avec "yes"
```

---

## Commandes utiles

```bash
# Récupérer tous les outputs Terraform
cd terraform && terraform output

# Tester l'API Gateway
API_URL=$(cd terraform && terraform output -raw api_gateway_url)
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"forge2024"}'

# Vérifier les logs Lambda en temps réel
aws logs tail /aws/lambda/astro-qualif-auth-production --follow

# Lister les fonctions Lambda
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `astro-qualif`)].FunctionName'

# Invalider le cache CloudFront
CLOUDFRONT_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

---

## Support

Pour toute question :
1. Vérifier les logs CloudWatch
2. Consulter la documentation AWS
3. Vérifier les issues GitHub du projet

---

## Checklist de déploiement

- [ ] AWS CLI configuré
- [ ] Terraform installé
- [ ] Variables Terraform configurées (`terraform.tfvars`)
- [ ] Dépendances Lambda installées
- [ ] Infrastructure déployée (`terraform apply`)
- [ ] Utilisateur admin initialisé
- [ ] Frontend build avec bonnes variables d'env
- [ ] Frontend uploadé sur S3
- [ ] Cache CloudFront invalidé
- [ ] Test de connexion réussi
- [ ] GitHub Secrets configurés (si CI/CD)
- [ ] Monitoring CloudWatch actif

# Quick Start - Déploiement AWS en 5 minutes

## Prérequis

```bash
# Vérifier les outils
aws --version        # AWS CLI v2
terraform --version  # Terraform >= 1.6
node --version       # Node.js 20.x
yarn --version       # Yarn 4.12.0

# Configurer AWS
aws configure
# Entrer : Access Key, Secret Key, Region (eu-west-1)
```

---

## Étape 1 : Setup automatique (1 min)

```bash
# Lancer le script de setup
./scripts/setup.sh

# Le script va :
# - Vérifier les prérequis
# - Créer terraform.tfvars depuis l'exemple
# - Installer les dépendances Lambda
# - Initialiser Terraform
```

**Action requise** : Éditer `terraform/terraform.tfvars` avec vos valeurs.

---

## Étape 2 : Configuration (1 min)

Éditer `terraform/terraform.tfvars` :

```hcl
# OBLIGATOIRE
admin_email          = "votre-email@example.com"
admin_password       = "UnMotDePasseSecurise123!"
recaptcha_secret_key = "votre-secret-recaptcha"

# OPTIONNEL
domain_name          = "qualif.votre-domaine.com"
route53_zone_id      = "Z1234567890ABC"
```

**Note** : Pour reCAPTCHA, créer une clé sur https://www.google.com/recaptcha/admin

---

## Étape 3 : Déployer l'infrastructure (2 min)

```bash
# Planifier les changements
make terraform-plan

# Vérifier le plan, puis appliquer
make terraform-apply
# Répondre "yes" quand demandé

# Attendre 2-3 minutes...
# Terraform va créer :
# - DynamoDB table
# - 4 Lambda functions
# - API Gateway
# - S3 bucket + CloudFront
# - Secrets Manager
```

**Résultat** : Infrastructure AWS déployée ✅

---

## Étape 4 : Initialiser l'utilisateur admin (30 sec)

```bash
make init-admin

# Entrer :
# Email : admin@example.com
# Password : forge2024
```

**Résultat** : Utilisateur admin créé dans DynamoDB ✅

---

## Étape 5 : Déployer le frontend (1 min)

```bash
# Récupérer l'URL de l'API
cd terraform
API_URL=$(terraform output -raw api_gateway_url)
echo "VITE_API_URL=$API_URL" > ../.env.production
cd ..

# Déployer
make deploy-frontend

# Attendre 1 minute (build + upload + invalidation CloudFront)
```

**Résultat** : Frontend déployé sur CloudFront ✅

---

## Étape 6 : Tester (30 sec)

### Option A : Via navigateur

```bash
# Récupérer l'URL du frontend
cd terraform
terraform output -raw frontend_url

# Ouvrir dans le navigateur
open $(terraform output -raw frontend_url)
```

### Option B : Via script de test API

```bash
# Tester tous les endpoints
./scripts/test-api.sh
```

**Résultat** : Application fonctionnelle ✅

---

## Résumé des commandes

```bash
# 1. Setup
./scripts/setup.sh

# 2. Configuration
vim terraform/terraform.tfvars

# 3. Infrastructure
make terraform-apply

# 4. Admin user
make init-admin

# 5. Frontend
make deploy-frontend

# 6. Test
open $(cd terraform && terraform output -raw frontend_url)
```

---

## Temps total

- **Setup** : 1 min
- **Configuration** : 1 min
- **Infrastructure** : 2 min
- **Admin user** : 30 sec
- **Frontend** : 1 min
- **Test** : 30 sec

**TOTAL** : **6 minutes** ⏱️

---

## URLs importantes

```bash
# Frontend
cd terraform && terraform output -raw frontend_url

# API Gateway
cd terraform && terraform output -raw api_gateway_url

# CloudFront Distribution ID
cd terraform && terraform output -raw cloudfront_distribution_id

# DynamoDB Table
cd terraform && terraform output -raw dynamodb_table_name
```

---

## Credentials de test

### Frontend Login

- **Email** : `admin@example.com`
- **Password** : `forge2024`

### reCAPTCHA (test keys)

- **Site Key** : `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key** : `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

**Note** : Remplacer par des clés réelles en production.

---

## Commandes utiles

### Monitoring

```bash
# Logs Lambda Auth
make logs-auth

# Logs Lambda CRUD
make logs-crud

# Logs API Gateway
make logs-api
```

### Mise à jour

```bash
# Mise à jour Lambda uniquement
make deploy-lambda

# Mise à jour frontend uniquement
make deploy-frontend

# Mise à jour complète
make deploy-all
```

### Debug

```bash
# Tester l'API
./scripts/test-api.sh

# Vérifier les ressources AWS
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `astro-qualif`)].FunctionName'
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `astro-qualif`)]'
aws s3 ls | grep astro-qualif
```

---

## Coûts estimés

### POC (100 requêtes/jour)

- **Total** : **2-5$/mois**
- Free Tier : Lambda (1M req), API Gateway (1M req), CloudFront (1 TB)

### Production (1000 requêtes/jour)

- **Total** : **8-13$/mois**
- DynamoDB On-Demand, Lambda, API Gateway, CloudFront, Secrets Manager

---

## Nettoyage (Destroy)

**ATTENTION** : Cette commande supprime TOUTE l'infrastructure AWS.

```bash
make terraform-destroy
# Répondre "yes" quand demandé
```

---

## Troubleshooting rapide

### Erreur "AWS credentials not configured"

```bash
aws configure
# Entrer Access Key ID, Secret Access Key, Region (eu-west-1)
```

### Erreur "Terraform not initialized"

```bash
cd terraform
terraform init
```

### Erreur "User not found" au login

```bash
make init-admin
# Réinitialiser l'utilisateur admin
```

### Erreur 403 CloudFront

```bash
make deploy-frontend
# Re-upload le frontend
```

### Lambda timeout

```bash
# Augmenter timeout dans terraform/variables.tf
vim terraform/variables.tf
# lambda_timeout = 30

make terraform-apply
```

---

## Prochaines étapes

### Sécurité

1. ✅ Changer le mot de passe admin par défaut
2. ✅ Configurer reCAPTCHA production (clés réelles)
3. ✅ Activer MFA sur compte AWS
4. ✅ Rotation régulière JWT secret

### Domaine personnalisé

```hcl
# Dans terraform/terraform.tfvars
domain_name     = "qualif.votre-domaine.com"
route53_zone_id = "Z1234567890ABC"
```

```bash
make terraform-apply
# Attendre validation certificat ACM (5-10 min)
```

### CI/CD automatique

1. Créer IAM Role pour GitHub Actions (OIDC)
2. Configurer GitHub Secrets (voir DEPLOY.md)
3. Push sur `main` → déploiement automatique

### Monitoring

1. Créer alarmes CloudWatch (Lambda errors, API 5XX)
2. Configurer SNS pour notifications
3. Activer AWS Cost Explorer pour suivi coûts

---

## Documentation complète

- **Guide complet** : [DEPLOY.md](./DEPLOY.md)
- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Résumé AWS** : [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md)
- **Fichiers créés** : [FILES_CREATED.md](./FILES_CREATED.md)

---

## Support

### Problème infrastructure

Consulter [DEPLOY.md](./DEPLOY.md) section "Troubleshooting"

### Problème Lambda

Consulter [lambda/README.md](./lambda/README.md)

### Problème Terraform

Consulter [terraform/README.md](./terraform/README.md)

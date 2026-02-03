# Terraform Infrastructure - Astro Qualif

Infrastructure as Code pour déployer l'application Astro Qualif sur AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Internet)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  CloudFront   │         │ API Gateway  │
│   (CDN)       │         │   (REST)     │
└───────┬───────┘         └──────┬───────┘
        │                        │
        ▼                        ▼
┌───────────────┐         ┌──────────────┐
│   S3 Bucket   │         │   Lambda     │
│  (Frontend)   │         │  Functions   │
└───────────────┘         └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌─────────┐ ┌──────────┐
              │DynamoDB  │ │ Secrets │ │CloudWatch│
              │  Table   │ │ Manager │ │   Logs   │
              └──────────┘ └─────────┘ └──────────┘
```

## Fichiers

| Fichier | Description |
|---------|-------------|
| `main.tf` | Configuration provider AWS + backend |
| `variables.tf` | Variables d'entrée Terraform |
| `outputs.tf` | Outputs après déploiement |
| `dynamodb.tf` | Table DynamoDB (single-table design) |
| `lambda.tf` | Fonctions Lambda (auth, authorizer, crud, recaptcha) |
| `api-gateway.tf` | API Gateway REST + routes + authorizer |
| `s3-cloudfront.tf` | S3 bucket + CloudFront distribution |
| `secrets.tf` | Secrets Manager (JWT, reCAPTCHA, admin) |
| `iam.tf` | IAM roles et policies |

## Utilisation rapide

```bash
# 1. Initialiser
terraform init

# 2. Créer terraform.tfvars
cat > terraform.tfvars <<EOF
aws_region           = "eu-west-1"
environment          = "production"
admin_email          = "admin@example.com"
admin_password       = "forge2024"
recaptcha_secret_key = "YOUR_SECRET_KEY"
EOF

# 3. Plan
terraform plan -out=tfplan

# 4. Apply
terraform apply tfplan

# 5. Récupérer les outputs
terraform output
```

## Variables importantes

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | Région AWS | `eu-west-1` |
| `environment` | Environnement (production, staging) | `production` |
| `domain_name` | Domaine personnalisé (optionnel) | `""` |
| `admin_email` | Email utilisateur admin | `admin@example.com` |
| `admin_password` | Mot de passe admin | `""` |
| `jwt_secret` | Secret JWT (auto-généré si vide) | `""` |
| `recaptcha_secret_key` | Clé secrète reCAPTCHA | `""` |
| `lambda_memory_size` | Mémoire Lambda (MB) | `256` |
| `lambda_timeout` | Timeout Lambda (secondes) | `10` |

## Outputs

| Output | Description |
|--------|-------------|
| `api_gateway_url` | URL de l'API Gateway |
| `frontend_url` | URL du frontend (CloudFront ou custom domain) |
| `cloudfront_distribution_id` | ID de la distribution CloudFront |
| `s3_bucket_name` | Nom du bucket S3 frontend |
| `dynamodb_table_name` | Nom de la table DynamoDB |

## Coûts estimés

### POC (100 req/jour)
- **2-5$/mois**
- Free Tier : DynamoDB (25GB), Lambda (1M req), API Gateway (1M req 12 mois)

### Production (1000 req/jour)
- **8-13$/mois**
- DynamoDB On-Demand, Lambda, API Gateway, CloudFront, Secrets Manager

## Sécurité

- **Encryption at rest** : DynamoDB, S3, Secrets Manager
- **HTTPS obligatoire** : CloudFront + ACM certificate
- **IAM Least Privilege** : Chaque ressource a le minimum de permissions
- **API Throttling** : 100 req/sec, burst 50
- **Private S3** : Accès uniquement via CloudFront OAI

## Modifications

### Ajouter un domaine personnalisé

```hcl
# Dans terraform.tfvars
domain_name     = "qualif.example.com"
route53_zone_id = "Z1234567890ABC"
```

### Augmenter les limites Lambda

```hcl
# Dans terraform.tfvars
lambda_memory_size = 512
lambda_timeout     = 30
```

### Activer WAF (protection DDoS)

```hcl
# Dans terraform.tfvars
enable_waf = true  # Ajoute ~5$/mois
```

## Support

Voir [DEPLOY.md](../DEPLOY.md) pour le guide complet de déploiement.

# Architecture AWS - Astro Qualif

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
│                        (Users/Forms)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│   CloudFront     │              │  API Gateway     │
│   Distribution   │              │   (REST API)     │
│                  │              │                  │
│  - CDN global    │              │  - CORS enabled  │
│  - HTTPS/TLS     │              │  - Throttling    │
│  - Cache assets  │              │  - JWT Auth      │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
         │ OAI                             │
         ▼                                 │
┌──────────────────┐                      │
│   S3 Bucket      │              ┌───────┴────────┐
│   (Frontend)     │              │                │
│                  │              ▼                ▼
│  - React SPA     │    ┌────────────────┐  ┌──────────────┐
│  - Static files  │    │ Lambda         │  │ Lambda       │
│  - Vite build    │    │ Authorizer     │  │ Functions    │
└──────────────────┘    │                │  │              │
                        │ - Validate JWT │  │ - Auth       │
                        └────────┬───────┘  │ - CRUD       │
                                 │          │ - reCAPTCHA  │
                                 │          └──────┬───────┘
                                 │                 │
                                 │   ┌─────────────┼─────────────┐
                                 │   │             │             │
                                 ▼   ▼             ▼             ▼
                        ┌────────────────┐  ┌────────────┐  ┌─────────┐
                        │   DynamoDB     │  │  Secrets   │  │CloudWatch│
                        │     Table      │  │  Manager   │  │  Logs   │
                        │                │  │            │  │         │
                        │ - Prospects    │  │ - JWT key  │  │ - Auth  │
                        │ - Users        │  │ - reCAPTCHA│  │ - CRUD  │
                        │ - On-Demand    │  │ - Admin    │  │ - API GW│
                        └────────────────┘  └────────────┘  └─────────┘
```

---

## Flux de données

### 1. Utilisateur Public (Formulaire)

```
User Browser
    │
    ▼
CloudFront (Frontend)
    │
    │ 1. GET /
    ▼
S3 Bucket → React SPA
    │
    │ 2. User fills form + reCAPTCHA
    ▼
API Gateway
    │
    │ 3. POST /verify-recaptcha
    ▼
Lambda reCAPTCHA
    │
    │ 4. Verify with Google
    ▼
Google reCAPTCHA API → Success
    │
    │ 5. POST /prospects (no auth)
    ▼
Lambda CRUD
    │
    │ 6. PutItem
    ▼
DynamoDB → Prospect saved
```

### 2. Utilisateur Admin (Kanban)

```
Admin Browser
    │
    │ 1. POST /auth/login
    ▼
API Gateway
    │
    ▼
Lambda Auth
    │
    │ 2. GetItem USER#email
    ▼
DynamoDB → User found
    │
    │ 3. bcrypt.compare(password)
    ▼
Lambda Auth
    │
    │ 4. jwt.sign(payload, secret)
    ▼
Secrets Manager → JWT_SECRET
    │
    │ 5. Return token
    ▼
Admin Browser → Store in localStorage
    │
    │ 6. GET /prospects
    │    Authorization: Bearer <token>
    ▼
API Gateway
    │
    │ 7. Validate token
    ▼
Lambda Authorizer
    │
    │ 8. jwt.verify(token)
    ▼
Secrets Manager → JWT_SECRET
    │
    │ 9. Allow/Deny
    ▼
API Gateway → Allow
    │
    │ 10. Invoke CRUD Lambda
    ▼
Lambda CRUD
    │
    │ 11. Query prospects
    ▼
DynamoDB → Return prospects
    │
    ▼
Admin Browser → Display Kanban
```

---

## Composants détaillés

### Frontend (S3 + CloudFront)

| Composant | Type | Coût | Description |
|-----------|------|------|-------------|
| S3 Bucket | Storage | ~0.01$/mois | Héberge les fichiers statiques React |
| CloudFront | CDN | 0-1$/mois | Distribution globale, HTTPS, cache |
| ACM Certificate | SSL/TLS | Gratuit | Certificat HTTPS pour domaine custom |
| Route53 | DNS | 0.50$/mois | Résolution DNS (optionnel) |

**Taille estimée** : 50 MB (React build)

**Invalidation cache** : À chaque déploiement

---

### Backend (API Gateway + Lambda)

| Lambda | Mémoire | Timeout | Invocations/mois | Coût |
|--------|---------|---------|------------------|------|
| Auth | 256 MB | 10s | ~300 (login) | 0$ (Free Tier) |
| Authorizer | 128 MB | 10s | ~3000 (cached 5min) | 0$ (Free Tier) |
| CRUD | 256 MB | 10s | ~2500 | 0$ (Free Tier) |
| reCAPTCHA | 128 MB | 10s | ~100 | 0$ (Free Tier) |

**Total requests** : ~6000/mois → 0$ avec Free Tier (1M req)

---

### Base de données (DynamoDB)

| Métrique | Valeur | Coût |
|----------|--------|------|
| Mode de facturation | On-Demand | 0$ si 0 traffic |
| Stockage | < 1 GB | 0$ (Free Tier 25 GB) |
| Lectures (RCU) | ~100/jour | 0$ (Free Tier) |
| Écritures (WCU) | ~50/jour | 0$ (Free Tier) |

**Table schema** :

```
PK (Partition Key)    SK (Sort Key)       Attributes
──────────────────    ──────────────      ─────────────────
USER#email            PROFILE             email, passwordHash, role, createdAt
PROSPECT#uuid         METADATA            id, firstName, lastName, email, phone,
                                          status, createdAt, updatedAt, ...
```

**GSI** :
- `StatusIndex` : status → SK (pour filtrage Kanban)
- `EmailIndex` : email → SK (pour recherche)

---

### Sécurité (Secrets Manager + IAM)

| Secret | ARN | Coût/mois |
|--------|-----|-----------|
| JWT_SECRET | astro-qualif/jwt-secret-production | 0.40$ |
| RECAPTCHA_SECRET | astro-qualif/recaptcha-secret-production | 0.40$ |
| ADMIN_CREDENTIALS | astro-qualif/admin-credentials-production | 0.40$ |

**Total Secrets Manager** : 1.20$/mois

**IAM Policies** :
- Lambda Execution Role : DynamoDB + Secrets Manager + CloudWatch Logs
- API Gateway Role : CloudWatch Logs
- CloudFront OAI : S3 Read-Only

---

## Sécurité

### 1. Authentification

```
┌─────────────────────────────────────────┐
│  JWT Token (HS256)                      │
├─────────────────────────────────────────┤
│  Header:                                │
│    { "alg": "HS256", "typ": "JWT" }     │
│                                         │
│  Payload:                               │
│    {                                    │
│      "email": "admin@example.com",      │
│      "role": "admin",                   │
│      "iat": 1706400000,                 │
│      "exp": 1706486400  (24h)           │
│    }                                    │
│                                         │
│  Signature:                             │
│    HMACSHA256(header.payload, secret)   │
└─────────────────────────────────────────┘
```

### 2. Autorisation

| Endpoint | Auth Required | Authorizer |
|----------|---------------|------------|
| `POST /auth/login` | Non | - |
| `POST /verify-recaptcha` | Non | - |
| `POST /prospects` | Non | - (public form) |
| `GET /prospects` | Oui | Lambda Authorizer |
| `GET /prospects/{id}` | Oui | Lambda Authorizer |
| `PATCH /prospects/{id}` | Oui | Lambda Authorizer |
| `DELETE /prospects/{id}` | Oui | Lambda Authorizer |

### 3. Protection réseau

- **CloudFront** : DDoS protection (AWS Shield Standard)
- **API Gateway** : Throttling (100 req/sec, burst 50)
- **WAF** : Optionnel (~5$/mois), rate limiting, SQL injection protection

### 4. Chiffrement

- **Transit** : HTTPS/TLS 1.2+ (CloudFront + API Gateway)
- **At Rest** :
  - S3 : AES-256
  - DynamoDB : AWS managed encryption
  - Secrets Manager : KMS (AWS managed key = gratuit)

---

## Performance

### Latences estimées

| Opération | Latence (p50) | Latence (p99) |
|-----------|---------------|---------------|
| CloudFront GET (cache hit) | 50-100ms | 200ms |
| CloudFront GET (cache miss) | 200-300ms | 500ms |
| API Gateway + Lambda (cold start) | 800-1200ms | 2000ms |
| API Gateway + Lambda (warm) | 50-150ms | 300ms |
| DynamoDB GetItem | 5-10ms | 20ms |
| DynamoDB Query | 10-20ms | 50ms |

### Optimisations

1. **CloudFront Cache** :
   - TTL : 1 heure (assets), 0 (index.html)
   - Compression : Gzip/Brotli activé

2. **Lambda** :
   - Réutilisation connexions SDK
   - Cache Secrets Manager en mémoire
   - Memory : 256 MB (balance CPU/coût)

3. **DynamoDB** :
   - Single-table design (1 Query vs N GetItems)
   - GSI pour filtres fréquents
   - On-Demand (pas de provisioning)

---

## Monitoring

### CloudWatch Metrics

| Service | Métrique | Alerte |
|---------|----------|--------|
| Lambda | Errors | > 5 errors/5min |
| Lambda | Duration | > 5s average |
| Lambda | Throttles | > 0 |
| API Gateway | 4XXError | > 10% |
| API Gateway | 5XXError | > 1% |
| DynamoDB | UserErrors | > 0 |

### CloudWatch Logs

```bash
# Lambda Auth logs
/aws/lambda/astro-qualif-auth-production

# Lambda CRUD logs
/aws/lambda/astro-qualif-crud-production

# API Gateway access logs
/aws/apigateway/astro-qualif-production
```

**Retention** : 7 jours (POC) → 30 jours (Production)

### X-Ray (optionnel)

Disabled pour économiser (0.50$/mois), activer en production si debug nécessaire.

---

## Scalabilité

### Limites AWS (eu-west-1)

| Service | Limite par défaut | Augmentable |
|---------|-------------------|-------------|
| Lambda Concurrent Executions | 1000 | Oui (ticket AWS) |
| API Gateway Requests | 10,000 req/sec | Oui (ticket AWS) |
| DynamoDB On-Demand | 40,000 RCU/WCU | Auto-scaling |
| CloudFront Requests | Illimité | - |

### Capacité estimée (configuration actuelle)

- **Users simultanés** : ~500-1000
- **Requests/sec** : 100 (throttle API Gateway)
- **Prospects/jour** : Illimité (DynamoDB On-Demand)

### Scaling beyond

Pour scaler au-delà :
1. Augmenter API Gateway throttle
2. Augmenter Lambda concurrent executions
3. Activer DynamoDB Auto Scaling (ou rester On-Demand)
4. Ajouter CloudFront WAF pour protection DDoS

---

## Coûts récapitulatifs

### POC (100 requêtes/jour, ~3000 req/mois)

| Service | Coût mensuel |
|---------|--------------|
| S3 | 0.01$ |
| CloudFront | 0-1$ (Free Tier) |
| Lambda | 0$ (Free Tier) |
| API Gateway | 0$ (Free Tier 12 mois) |
| DynamoDB | 0-2$ |
| Secrets Manager | 1.20$ |
| Route53 | 0.50$ (optionnel) |
| **TOTAL** | **2-5$/mois** |

### Production (1000 requêtes/jour, ~30,000 req/mois)

| Service | Coût mensuel |
|---------|--------------|
| S3 + CloudFront | 1-2$ |
| Lambda | 0-0.50$ |
| API Gateway | 3.50$ |
| DynamoDB | 2-5$ |
| Secrets Manager | 1.20$ |
| Route53 | 0.50$ |
| **TOTAL** | **8-13$/mois** |

---

## Évolution future

### Phase 2 - Ajouts possibles

1. **Cognito User Pool** : Si > 50 utilisateurs (OAuth, MFA)
2. **RDS Aurora Serverless** : Si relations complexes SQL nécessaires
3. **ElastiCache** : Cache Redis pour sessions/queries
4. **SQS + Lambda** : Async processing (emails, notifications)
5. **EventBridge** : Event-driven architecture
6. **WAF** : Protection avancée (bot detection, geo-blocking)

### Phase 3 - Multi-region

1. **CloudFront** : Déjà global (edge locations worldwide)
2. **DynamoDB Global Tables** : Réplication multi-region
3. **Lambda@Edge** : Exécution Lambda au edge
4. **Route53 Failover** : High availability DNS

---

## Comparaison alternatives

| Architecture | Coût/mois | Complexité | Scalabilité |
|--------------|-----------|------------|-------------|
| **Serverless (actuel)** | 2-5$ | Moyenne | Haute |
| EC2 t3.micro + RDS | 15-30$ | Haute | Moyenne |
| Amplify Hosting | 5-10$ | Basse | Moyenne |
| Vercel + Supabase | 0-20$ | Basse | Haute |
| ECS Fargate | 20-40$ | Haute | Haute |

**Choix actuel justifié** : Serverless = coût minimal + scalabilité auto + pas de gestion serveur.

---

## Ressources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Application Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

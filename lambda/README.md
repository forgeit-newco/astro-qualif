# Lambda Functions

Fonctions Lambda Node.js 20.x pour l'API backend d'Astro Qualif.

## Architecture

```
┌─────────────────────────────────────────┐
│         API Gateway (REST)              │
└──────────────┬──────────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
      ▼        ▼        ▼
┌──────────┐ ┌───┐ ┌──────────┐
│   Auth   │ │JWT│ │  CRUD    │
│  Lambda  │ │Auth│ │ Lambda   │
└────┬─────┘ └─┬─┘ └────┬─────┘
     │         │        │
     ▼         ▼        ▼
┌─────────────────────────┐
│       DynamoDB          │
└─────────────────────────┘
```

## Fonctions

### 1. Auth Lambda (`auth/`)

**Endpoint** : `POST /auth/login`

**Description** : Authentifie l'utilisateur et génère un JWT token.

**Request** :
```json
{
  "email": "admin@example.com",
  "password": "forge2024"
}
```

**Response** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Variables d'environnement** :
- `DYNAMODB_TABLE` : Nom de la table DynamoDB
- `JWT_SECRET_ARN` : ARN du secret JWT dans Secrets Manager

**Dependencies** :
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `@aws-sdk/client-secrets-manager`
- `bcryptjs` : Hash de mots de passe
- `jsonwebtoken` : Génération de JWT

---

### 2. Authorizer Lambda (`authorizer/`)

**Type** : Lambda Authorizer (TOKEN)

**Description** : Valide le JWT token pour les endpoints protégés.

**Input** : Header `Authorization: Bearer <token>`

**Output** : IAM Policy (Allow/Deny)

**Variables d'environnement** :
- `JWT_SECRET_ARN` : ARN du secret JWT

**Dependencies** :
- `@aws-sdk/client-secrets-manager`
- `jsonwebtoken`

**Cache TTL** : 300 secondes (5 minutes)

---

### 3. CRUD Lambda (`crud/`)

**Endpoints** :
- `GET /prospects` : Liste tous les prospects (protégé)
- `GET /prospects/{id}` : Récupère un prospect (protégé)
- `POST /prospects` : Crée un prospect (public - formulaire)
- `PATCH /prospects/{id}` : Met à jour un prospect (protégé)
- `DELETE /prospects/{id}` : Supprime un prospect (protégé)

**Variables d'environnement** :
- `DYNAMODB_TABLE` : Nom de la table DynamoDB

**Dependencies** :
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`

---

### 4. reCAPTCHA Lambda (`recaptcha/`)

**Endpoint** : `POST /verify-recaptcha`

**Description** : Valide le token reCAPTCHA côté serveur.

**Request** :
```json
{
  "token": "03AGdBq25..."
}
```

**Response** :
```json
{
  "success": true,
  "score": 0.9,
  "action": "submit"
}
```

**Variables d'environnement** :
- `RECAPTCHA_SECRET_ARN` : ARN du secret reCAPTCHA

**Dependencies** :
- `@aws-sdk/client-secrets-manager`

---

## Développement local

### Installation des dépendances

```bash
# Auth
cd auth
NPM_TOKEN=dummy yarn install

# Authorizer
cd ../authorizer
NPM_TOKEN=dummy yarn install

# CRUD
cd ../crud
NPM_TOKEN=dummy yarn install

# reCAPTCHA
cd ../recaptcha
NPM_TOKEN=dummy yarn install
```

### Build des packages ZIP

```bash
# Auth
cd auth
zip -r ../auth.zip . -x '*.zip' -x 'node_modules/.cache/*'

# Ou utiliser le script
yarn build
```

### Test local (avec SAM Local)

```bash
# Installer AWS SAM CLI
brew install aws-sam-cli

# Créer template.yaml
sam local start-api

# Tester
curl http://localhost:3000/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"forge2024"}'
```

---

## Déploiement

### Via Terraform (initial)

```bash
cd ../terraform
terraform apply
```

### Via AWS CLI (update)

```bash
# Update Auth Lambda
aws lambda update-function-code \
  --function-name astro-qualif-auth-production \
  --zip-file fileb://auth.zip

# Update CRUD Lambda
aws lambda update-function-code \
  --function-name astro-qualif-crud-production \
  --zip-file fileb://crud.zip
```

### Via Makefile

```bash
cd ..
make deploy-lambda
```

---

## Logs

### CloudWatch Logs

```bash
# Auth Lambda logs
aws logs tail /aws/lambda/astro-qualif-auth-production --follow

# CRUD Lambda logs
aws logs tail /aws/lambda/astro-qualif-crud-production --follow
```

### Structured logging

Les Lambdas utilisent `console.log` avec JSON structuré :

```javascript
console.log('Event:', JSON.stringify(event, null, 2));
console.log('Login successful for user:', email);
console.error('Error:', error);
```

---

## Performance

### Memory Size

- **Auth** : 256 MB (bcrypt CPU-intensive)
- **Authorizer** : 128 MB (JWT validation rapide)
- **CRUD** : 256 MB (DynamoDB queries)
- **reCAPTCHA** : 128 MB (HTTP request simple)

### Cold Start

- Node.js 20 : ~200-300ms
- Optimisation : Réutilisation des connexions (Secrets Manager cache)

### Timeout

- Default : 10 secondes
- Max recommandé : 30 secondes

---

## Sécurité

### Secrets Management

- **Jamais de secrets hardcodés** dans le code
- Utilisation de AWS Secrets Manager
- Cache des secrets en mémoire (variable globale)

### CORS

- Headers CORS configurés dans chaque Lambda
- Origin validation possible via `event.headers.origin`

### Input Validation

```javascript
if (!email || !password) {
  return response(400, { error: 'Email and password are required' });
}
```

### Error Handling

```javascript
try {
  // Logic
} catch (error) {
  console.error('Error:', error);
  return response(500, { error: 'Internal server error' });
}
```

---

## Troubleshooting

### Lambda timeout

**Symptôme** : 504 Gateway Timeout

**Solution** :
1. Augmenter le timeout dans Terraform
2. Optimiser les requêtes DynamoDB
3. Vérifier les connexions réseau

### Cold start lent

**Symptôme** : Première requête lente (~1-2s)

**Solution** :
1. Augmenter la mémoire (plus de CPU)
2. Utiliser Provisioned Concurrency (coût additionnel)
3. Optimiser les imports (lazy loading)

### Secrets Manager "Access Denied"

**Symptôme** : `AccessDeniedException` dans les logs

**Solution** :
1. Vérifier les IAM permissions du rôle Lambda
2. Vérifier l'ARN du secret dans les variables d'env

### DynamoDB "ResourceNotFoundException"

**Symptôme** : Table not found

**Solution** :
1. Vérifier le nom de la table dans `DYNAMODB_TABLE`
2. Vérifier que la table existe : `aws dynamodb list-tables`

---

## Coûts

### Free Tier (12 mois)

- **1M requêtes gratuites/mois**
- **400,000 GB-secondes gratuits/mois**

### Calcul du coût

```
Requests: 30,000/mois
Duration: 500ms average
Memory: 256 MB

Compute: 30,000 * 0.5s * 0.25GB = 3,750 GB-s
Cost: 0$ (Free Tier 400,000 GB-s)

Requests: 0$ (Free Tier 1M requests)

Total: 0$/mois (dans Free Tier)
```

### Après Free Tier

- **Requests** : 0.20$ per 1M requests
- **Duration** : 0.0000166667$ per GB-second

---

## Best Practices

1. **Réutiliser les connexions** : Variables globales pour SDK clients
2. **Cache Secrets Manager** : Éviter les appels répétés
3. **Logging structuré** : JSON pour faciliter les recherches CloudWatch
4. **Error handling robuste** : Try/catch + logs détaillés
5. **Input validation** : Valider tous les inputs utilisateur
6. **CORS configuré** : Headers appropriés pour SPA frontend
7. **Timeouts courts** : 10s max pour éviter les coûts inutiles

---

## Resources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Node.js SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Lambda Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

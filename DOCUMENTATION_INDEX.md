# Index de la documentation - Astro Qualif AWS Deployment

## Documentation principale

| Fichier | Description | Audience |
|---------|-------------|----------|
| [README.md](./README.md) | Vue d'ensemble du projet | Tous |
| [QUICK_START.md](./QUICK_START.md) | Déploiement en 5 minutes | DevOps |
| [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) | Résumé déploiement AWS | DevOps |
| [DEPLOY.md](./DEPLOY.md) | Guide complet de déploiement | DevOps |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture détaillée | Architectes, DevOps |
| [FILES_CREATED.md](./FILES_CREATED.md) | Liste des fichiers créés | Développeurs |
| [CLAUDE.md](./CLAUDE.md) | Contexte projet pour Claude | IA, Développeurs |

---

## Par rôle

### Je suis DevOps Engineer

**Je veux déployer l'application** :
1. [QUICK_START.md](./QUICK_START.md) - Déploiement en 5 minutes
2. [DEPLOY.md](./DEPLOY.md) - Guide complet avec troubleshooting

**Je veux comprendre l'architecture** :
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
2. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé

**Je veux configurer CI/CD** :
1. [DEPLOY.md](./DEPLOY.md) - Section "GitHub Actions"
2. [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) - Workflow

### Je suis Développeur Frontend

**Je veux adapter le frontend** :
1. [README.md](./README.md) - Section "Frontend adapté"
2. [src/api/prospects.ts](./src/api/prospects.ts) - API client
3. [src/contexts/AuthContext.tsx](./src/contexts/AuthContext.tsx) - Auth context

**Je veux comprendre l'API** :
1. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Section "API Endpoints"
2. [lambda/README.md](./lambda/README.md) - Documentation Lambda

### Je suis Développeur Backend

**Je veux modifier les Lambda** :
1. [lambda/README.md](./lambda/README.md) - Documentation Lambda functions
2. [lambda/auth/index.js](./lambda/auth/index.js) - Lambda Auth
3. [lambda/crud/index.js](./lambda/crud/index.js) - Lambda CRUD

**Je veux comprendre DynamoDB** :
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Section "Base de données"
2. [terraform/dynamodb.tf](./terraform/dynamodb.tf) - Schema DynamoDB

### Je suis Architecte Cloud

**Je veux comprendre l'architecture** :
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture complète
2. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé

**Je veux estimer les coûts** :
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Section "Coûts récapitulatifs"
2. [DEPLOY.md](./DEPLOY.md) - Section "Estimation des coûts"

**Je veux voir l'infrastructure as code** :
1. [terraform/README.md](./terraform/README.md) - Documentation Terraform
2. [terraform/](./terraform/) - Tous les fichiers .tf

### Je suis Product Owner / Manager

**Je veux comprendre le projet** :
1. [README.md](./README.md) - Vue d'ensemble
2. [README.md](./README.md) - Section "Contexte métier"

**Je veux connaître les coûts** :
1. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Section "Budget AWS"
2. [QUICK_START.md](./QUICK_START.md) - Section "Coûts estimés"

---

## Par sujet

### Déploiement

| Sujet | Fichier | Section |
|-------|---------|---------|
| Quick Start (5 min) | [QUICK_START.md](./QUICK_START.md) | Tout |
| Guide complet | [DEPLOY.md](./DEPLOY.md) | Tout |
| Résumé | [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) | "Démarrage rapide" |
| Script setup | [scripts/setup.sh](./scripts/setup.sh) | - |
| Makefile commands | [Makefile](./Makefile) | - |

### Infrastructure

| Sujet | Fichier | Section |
|-------|---------|---------|
| Architecture overview | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Vue d'ensemble" |
| Services AWS | [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) | "Services AWS créés" |
| Terraform files | [terraform/README.md](./terraform/README.md) | Tout |
| DynamoDB schema | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Base de données" |
| IAM policies | [terraform/iam.tf](./terraform/iam.tf) | - |

### Backend

| Sujet | Fichier | Section |
|-------|---------|---------|
| Lambda functions | [lambda/README.md](./lambda/README.md) | Tout |
| API endpoints | [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) | "API Endpoints" |
| Auth flow | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Flux de données" |
| JWT tokens | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Authentification" |

### Frontend

| Sujet | Fichier | Section |
|-------|---------|---------|
| Modifications | [FILES_CREATED.md](./FILES_CREATED.md) | "Frontend adapté" |
| Configuration | [README.md](./README.md) | "Configuration" |
| API client | [src/api/prospects.ts](./src/api/prospects.ts) | - |
| Auth context | [src/contexts/AuthContext.tsx](./src/contexts/AuthContext.tsx) | - |

### Sécurité

| Sujet | Fichier | Section |
|-------|---------|---------|
| Best practices | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Sécurité" |
| Secrets Manager | [DEPLOY.md](./DEPLOY.md) | "Sécurité" |
| IAM roles | [terraform/iam.tf](./terraform/iam.tf) | - |
| JWT Auth | [lambda/README.md](./lambda/README.md) | "Authorizer Lambda" |

### Coûts

| Sujet | Fichier | Section |
|-------|---------|---------|
| Estimation POC | [QUICK_START.md](./QUICK_START.md) | "Coûts estimés" |
| Estimation Production | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Coûts récapitulatifs" |
| Optimisation | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Coûts récapitulatifs" |

### Monitoring

| Sujet | Fichier | Section |
|-------|---------|---------|
| CloudWatch Logs | [DEPLOY.md](./DEPLOY.md) | "Monitoring et Logs" |
| Métriques | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Monitoring" |
| Alarmes | [ARCHITECTURE.md](./ARCHITECTURE.md) | "Monitoring" |

### CI/CD

| Sujet | Fichier | Section |
|-------|---------|---------|
| GitHub Actions | [DEPLOY.md](./DEPLOY.md) | "Configuration GitHub Actions" |
| Workflow | [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) | - |
| Secrets | [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) | "CI/CD" |

### Troubleshooting

| Sujet | Fichier | Section |
|-------|---------|---------|
| Guide complet | [DEPLOY.md](./DEPLOY.md) | "Troubleshooting" |
| Quick fixes | [QUICK_START.md](./QUICK_START.md) | "Troubleshooting rapide" |
| Lambda issues | [lambda/README.md](./lambda/README.md) | "Troubleshooting" |

---

## Commandes rapides

### Déploiement

```bash
./scripts/setup.sh          # Setup initial
make terraform-apply        # Déployer infrastructure
make init-admin             # Créer admin user
make deploy-frontend        # Déployer frontend
make deploy-all             # Déployer tout
```

### Monitoring

```bash
make logs-auth              # Logs Lambda Auth
make logs-crud              # Logs Lambda CRUD
make logs-api               # Logs API Gateway
./scripts/test-api.sh       # Tester l'API
```

### Mise à jour

```bash
make deploy-lambda          # Update Lambda uniquement
make deploy-frontend        # Update frontend uniquement
make terraform-plan         # Plan changements infra
make terraform-apply        # Appliquer changements
```

---

## Structure de la documentation

### Documentation de haut niveau (Business/PM)

1. [README.md](./README.md) - Vue d'ensemble projet
2. [README.md](./README.md) section "Contexte métier" - Stratégie

### Documentation technique (Développeurs)

1. [FILES_CREATED.md](./FILES_CREATED.md) - Liste fichiers créés
2. [lambda/README.md](./lambda/README.md) - Lambda functions
3. [terraform/README.md](./terraform/README.md) - Infrastructure

### Documentation opérationnelle (DevOps)

1. [QUICK_START.md](./QUICK_START.md) - Déploiement rapide
2. [DEPLOY.md](./DEPLOY.md) - Guide complet
3. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé

### Documentation architecture (Architectes)

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
2. [ARCHITECTURE.md](./ARCHITECTURE.md) section "Flux de données"
3. [ARCHITECTURE.md](./ARCHITECTURE.md) section "Composants détaillés"

---

## FAQ rapide

### Comment déployer rapidement ?

Voir [QUICK_START.md](./QUICK_START.md)

### Comment configurer GitHub Actions ?

Voir [DEPLOY.md](./DEPLOY.md) section "Configuration GitHub Actions"

### Comment modifier les Lambda functions ?

Voir [lambda/README.md](./lambda/README.md)

### Comment estimer les coûts ?

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) section "Coûts récapitulatifs"

### Comment monitorer l'application ?

Voir [DEPLOY.md](./DEPLOY.md) section "Monitoring et Logs"

### Comment ajouter un domaine personnalisé ?

Voir [DEPLOY.md](./DEPLOY.md) section "Configuration initiale"

### Comment sécuriser l'application ?

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) section "Sécurité"

### Comment détruire l'infrastructure ?

```bash
make terraform-destroy
```

Voir [DEPLOY.md](./DEPLOY.md) section "Nettoyage (Destroy)"

---

## Ordre de lecture recommandé

### Nouveau sur le projet (Développeur)

1. [README.md](./README.md) - Comprendre le projet
2. [CLAUDE.md](./CLAUDE.md) - Contexte technique
3. [FILES_CREATED.md](./FILES_CREATED.md) - Fichiers créés
4. Code source

### Nouveau sur le projet (DevOps)

1. [README.md](./README.md) - Vue d'ensemble
2. [QUICK_START.md](./QUICK_START.md) - Déploiement rapide
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture
4. [DEPLOY.md](./DEPLOY.md) - Guide complet

### Maintenance (DevOps existant)

1. [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé
2. [Makefile](./Makefile) - Commandes disponibles
3. [DEPLOY.md](./DEPLOY.md) section "Troubleshooting"

---

## Checklist lecture

- [ ] [README.md](./README.md) - Vue d'ensemble
- [ ] [QUICK_START.md](./QUICK_START.md) - Déploiement rapide
- [ ] [AWS_DEPLOYMENT_SUMMARY.md](./AWS_DEPLOYMENT_SUMMARY.md) - Résumé AWS
- [ ] [DEPLOY.md](./DEPLOY.md) - Guide complet
- [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [ ] [lambda/README.md](./lambda/README.md) - Lambda functions
- [ ] [terraform/README.md](./terraform/README.md) - Infrastructure

**Total temps lecture** : ~30-45 minutes

---

## Contribution

Pour contribuer à la documentation :

1. Identifier le fichier concerné dans cet index
2. Lire le fichier existant
3. Proposer des modifications
4. Mettre à jour cet index si nécessaire

---

## Maintenance de la documentation

### Ajouter un nouveau fichier documentation

1. Créer le fichier
2. L'ajouter dans cet index
3. Mettre à jour [FILES_CREATED.md](./FILES_CREATED.md)
4. Mettre à jour [README.md](./README.md) section "Documentation"

### Modifier un fichier existant

1. Lire le fichier complet
2. Faire les modifications
3. Vérifier les références dans cet index
4. Mettre à jour la date de dernière modification

---

## Support

Pour toute question sur la documentation :

1. Consulter cet index
2. Consulter le fichier approprié
3. Consulter la section "Troubleshooting" dans [DEPLOY.md](./DEPLOY.md)

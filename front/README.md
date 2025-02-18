# Nom du Projet

## Description

Description brève du projet et de ses objectifs principaux.

## Technologies

- Angular
- TailwindCSS
- PrimeNG
- TypeScript

## Structure du Projet

```
src/
├── app/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages/Routes principales
│   ├── types/         # Interfaces et types
│   ├── guards/        # Guards Angular
│   └── services/      # Services Angular
```

## Convention de Nommage

- **Types/Classes**: CamelCase (ex: UserInterface, AuthService)
- **Variables/Fonctions**: pascalCase (ex: getUserData, isAuthenticated)
- **Variables d'environnement**: SNAKE_CASE (ex: API_URL, AUTH_TOKEN)

## Commandes Make

```bash
# Démarre l'application complète
make start

# Arrête tous les services
make down

# Construit l'application
make build

# Lance le frontend uniquement
make front

# Lance le backend uniquement
make back
```

## Commandes Angular CLI

```bash
# Créer un nouveau composant
ng g c components/nom-du-composant

# Créer un guard
ng g guard guards/nom-du-guard

# Créer un service
ng g service services/nom-du-service
```

## Convention de Commit

### Types de Commit

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `draft`: Travail en cours

Format: `type: description courte`

Exemple:

```bash
git commit -m "feat: ajout authentification utilisateur"
git commit -m "fix: correction bug affichage menu"
git commit -m "draft: WIP page profile"
```

## Convention de Branches

### Types de Branches

- `feature/`: Nouvelles fonctionnalités
- `bugfix/`: Corrections de bugs

Format: `type/nom-de-la-branche`

Exemple:

```bash
git checkout -b feature/auth-system
git checkout -b bugfix/login-error
```

## Installation

1. Installer les dépendances

```bash
npm install
```

2. Démarrer l'application

```bash
make start
```

## Développement

### TailwindCSS

Le projet utilise TailwindCSS pour le styling. La configuration se trouve dans `tailwind.config.js`.

### PrimeNG

Les composants PrimeNG sont disponibles pour l'interface utilisateur. Documentation disponible sur [PrimeNG](https://primeng.org/).

## Tests (pas encore en vigueur)

```bash
# Exécuter les tests unitaires
ng test

# Exécuter les tests e2e
ng e2e
```

## Makefile

```makefile
.PHONY: start down build front back

start:
	docker-compose up -d
	npm start

down:
	docker-compose down

build:
	npm run build

front:
	npm start

back:
	cd api && npm start
```

# MindCare Project

Application de gestion et suivi médical développée avec Angular, Spring Boot et PostgreSQL...

## 🚀 Installation /!\

### Prérequis

- Git
- Docker et Docker Compose
- Un terminal Git Bash ou similaire

### Étapes d'installation 

1. Cloner le dépôt

```bash
git clone git@github.com:twnguydev/mindcare.git
cd mindcare
```

2. Lancer l'application avec Docker

```bash
docker-compose up --build
```

## 🔗 Accès aux services

### Frontend - Angular

- URL: http://localhost:4200
- Interface utilisateur principale de l'application

### Backend - Spring Boot API

- URL: http://localhost:8080
- API REST pour la gestion des données

### PostgreSQL Database

- Port: 5432
- Paramètres de connexion:
  ```
  Host: db
  Port: 5432
  Database: mindcare
  Username: postgres
  Password: postgres
  ```

### PgAdmin - Interface d'administration PostgreSQL

- URL: http://localhost:5050
- Identifiants:
  ```
  Email: admin@admin.com
  Password: admin
  ```

## 📝 Configuration de la base de données dans PgAdmin

1. Accédez à PgAdmin via http://localhost:5050
2. Connectez-vous avec les identifiants fournis
3. Ajoutez un nouveau serveur avec les paramètres suivants:
   - Name: mindcare (ou autre nom de votre choix)
   - Host: db
   - Port: 5432
   - Database: mindcare
   - Username: postgres
   - Password: postgres

## 📝 Accés à Kibana

- URL: http://localhost:5601/app/home#/
  Configurer votre dashboard

## 📝 Elasticsearch (logs)

-URL http://localhost:9200

## Portnair

- URL https://localhost:9443

## 🛠️ Commandes Docker utiles

```bash
# Lancer les services
make start

# Arrêter les services
make down

# Démarer uniquement le front
make front

# Démarer uniquement le backend
make back
```

## 🔍 Structure du projet

```
mindcare/
├── front/          # Application Angular
├── api/           # API Spring Boot
├── docker-compose.yml
└── README.md
```

## Linter & convention

```bash
# Voir si le code contient des problème de code ( a éxecuter dans le repertoire ./front/ sinon sa ne marche pas)
npm run lint || npm run lint --fix
```

## Branch convention

Pour toute création de branch voicis les conventions à respecter:

```bash
Feature/T-<numéros>
Bugfix/T-<numéros>
Draft/T-<numéros>
```

## Commit convention

Pour tout les commit voicis les convention a respecter :

```bash
feature(<fichiers>): <une explication claire de la feature>, closes #<numéro>.
fix(<fichiers>): <Une explication claire du fix>, closes #<numéro>.
draft(<fichiers>): <une explication de l'essaie>, closes #<numéro>.
```

## Fermer les tickets automatiquement

```bash
closes #<numéro>
fixes #<numéro>
resolves #<numéro>
```

## Exemple concret sur les 3 possibilitées

```bash
# Nouvelle fonctionalitée
git branch Feature/T-23 && git commit -m "feature(auth.api): Ajout du rafraichissement du token, closes #23"

#Corection de bug
git branch Bugfix/T-24 && git commit -m "fix(auth.api): Correction du rafraichissement du token, fixes #24"

#Essaie d'une fonctionalitée pas encore pensée ou écrite
git branch Draft/T-25 && git commit -m "draft(fixture): Ajout de fixtures pour les CRON du serveur, resolves #25"
```

### /!\ Toute branch ou commit or convention se verras refuser /!\

## 📋 Kibana et les logs

```bash
#Pour créer les logs dans kibana sa se fait comme ci
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class YourController {
    private static final Logger logger = LoggerFactory.getLogger(YourController.class);

    @GetMapping("/example")
    public String example() {
        logger.info("Ceci est un log de test");
        logger.error("Voici une erreur exemple");
        return "OK";
    }
}

#PLusieur type de logs sont prévue et conçus en fonction de l'action réaliser
@GetMapping("/test-logs")
public String testLogs() {
    logger.trace("Message de TRACE");
    logger.debug("Message de DEBUG");
    logger.info("Message d'INFO");
    logger.warn("Message de WARN");
    logger.error("Message d'ERROR");
    return "Logs générés avec succès";
}

```

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub.

```

```

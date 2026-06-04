# Spécifications fonctionnelles — MoWoBank (POC microfinance desktop)

Version : 1.0
Date : 4 juin 2026
Statut : preuve de concept (POC)

## 1. Contexte et objectif

MoWoBank est une preuve de concept d'application de gestion de microfinance fonctionnant en mode desktop local. L'objectif est de démontrer les fonctionnalités essentielles d'un établissement de microfinance (EMF) : gestion des utilisateurs internes, ouverture et suivi de comptes d'épargne, opérations de dépôt et de retrait, historique des transactions et pilotage par tableau de bord.

L'application fonctionne intégralement en local, sans dépendance à un serveur distant. Les données sont persistées dans une base SQLite embarquée lorsque l'application tourne en mode desktop (Tauri), et dans le stockage local du navigateur en mode développement web.

### Critères de réussite

Le POC est considéré comme réussi lorsque les parcours suivants sont opérationnels de bout en bout :

- création d'un utilisateur interne (agent ou administrateur) ;
- ouverture d'un compte d'épargne rattaché à un client ;
- enregistrement d'un dépôt sur un compte ;
- enregistrement d'un retrait avec contrôle du solde disponible ;
- consultation de l'historique complet des transactions ;
- lecture du tableau de bord agrégeant les indicateurs clés.

## 2. Acteurs et rôles

| Rôle | Description | Périmètre |
| --- | --- | --- |
| Administrateur | Supervise l'établissement | Accès complet : utilisateurs, comptes, transactions, tableau de bord, paramètres |
| Agent | Opère au guichet | Gestion des comptes et des transactions, lecture du tableau de bord ; pas d'accès à la gestion des utilisateurs |

L'authentification est requise pour accéder à l'application. Le rôle conditionne la visibilité des menus et l'autorisation des actions sensibles (création d'utilisateur réservée à l'administrateur).

## 3. Modèle de données

Trois entités principales structurent le domaine.

### 3.1 Utilisateur (User)

Représente un membre du personnel de l'établissement.

| Champ | Type | Règles |
| --- | --- | --- |
| id | identifiant | clé technique, généré |
| fullName | texte | obligatoire |
| email | texte | obligatoire, unique, format courriel |
| role | énumération | `admin` ou `agent` |
| status | énumération | `active` ou `suspended` |
| passwordHash | texte | empreinte du mot de passe (POC : simple, non destiné à la production) |
| createdAt | horodatage | date de création |

### 3.2 Compte (Account)

Compte d'épargne détenu par un client de l'établissement.

| Champ | Type | Règles |
| --- | --- | --- |
| id | identifiant | clé technique, généré |
| number | texte | numéro de compte unique, généré (format `MW-XXXXXX`) |
| holderName | texte | nom du titulaire, obligatoire |
| holderPhone | texte | téléphone du titulaire |
| type | énumération | `epargne`, `courant`, `tontine` |
| balance | entier | solde en centimes (XOF), jamais négatif |
| status | énumération | `active`, `frozen`, `closed` |
| openedBy | référence User | agent ou administrateur ayant ouvert le compte |
| createdAt | horodatage | date d'ouverture |

### 3.3 Transaction (Transaction)

Mouvement enregistré sur un compte.

| Champ | Type | Règles |
| --- | --- | --- |
| id | identifiant | clé technique, généré |
| accountId | référence Account | obligatoire |
| type | énumération | `deposit` (dépôt) ou `withdrawal` (retrait) |
| amount | entier | montant en centimes, strictement positif |
| balanceAfter | entier | solde du compte après l'opération |
| label | texte | libellé ou motif de l'opération |
| performedBy | référence User | utilisateur ayant saisi l'opération |
| createdAt | horodatage | date de l'opération |

### 3.4 Invariants métier

- Le solde d'un compte est égal à la somme des dépôts moins la somme des retraits.
- Un retrait est refusé si le montant dépasse le solde disponible.
- Un montant d'opération est toujours strictement positif.
- Les montants sont stockés en centimes (entiers) pour éviter les erreurs d'arrondi, et formatés à l'affichage en franc CFA (XOF).
- Aucune opération n'est possible sur un compte `frozen` ou `closed`.

## 4. Périmètre fonctionnel

### 4.1 Authentification

- Écran de connexion avec courriel et mot de passe.
- Validation des identifiants contre la base locale.
- Session maintenue pendant l'utilisation ; déconnexion explicite possible.
- Comptes de démonstration pré-chargés (administrateur et agent).

### 4.2 Tableau de bord

Page d'accueil après connexion. Présente :

- des cartes indicateur (façon pastel du design system) : épargne totale collectée, nombre de comptes actifs, nombre de clients, volume des transactions du jour ;
- un graphique d'évolution des dépôts et retraits sur les derniers jours ;
- la liste des dernières transactions ;
- des actions rapides (nouveau dépôt, nouveau retrait, nouveau compte).

### 4.3 Gestion des utilisateurs (administrateur uniquement)

- Liste paginée et filtrable des utilisateurs.
- Création d'un utilisateur via formulaire (nom, courriel, rôle, mot de passe).
- Activation ou suspension d'un utilisateur.
- Validation des champs (courriel valide et unique, champs obligatoires).

### 4.4 Gestion des comptes

- Liste des comptes avec recherche (numéro, titulaire) et filtres (type, statut).
- Ouverture d'un compte : titulaire, téléphone, type, dépôt initial facultatif.
- Fiche compte (panneau latéral) : informations, solde, historique des mouvements du compte, actions dépôt ou retrait.
- Gel, réactivation ou clôture d'un compte.

### 4.5 Dépôts et retraits

- Dépôt : sélection du compte, montant, libellé. Le solde est crédité.
- Retrait : sélection du compte, montant, libellé. Le solde est débité après contrôle de disponibilité.
- Confirmation visuelle (toast) et mise à jour immédiate des soldes et indicateurs.

### 4.6 bis Clients et KYC

Module de gestion de la clientèle, distinct du personnel interne.

- Répertoire des clients avec recherche (nom, téléphone, pièce, ville) et filtre par statut KYC.
- Enregistrement d'un client : identité complète (nom, genre, date de naissance, profession), coordonnées, pièce d'identité (type et numéro) et adresse. Le dossier démarre au statut KYC « en attente ».
- Fiche client : dossier d'identité, statut KYC et actions de validation (vérifier, rejeter, remettre en attente), comptes rattachés avec solde cumulé.
- Ouverture d'un compte directement rattachée au client, conditionnée à un KYC vérifié.

Modèle de données complémentaire : entité `Client` (identité, KYC) reliée à `Account` par `clientId`. Statuts KYC : `pending`, `verified`, `rejected`.

### 4.6 Historique des transactions

- Liste chronologique de toutes les transactions, tous comptes confondus.
- Filtres par type (dépôt, retrait), par compte et par période.
- Affichage du compte concerné, du montant signé, du solde résultant et de l'opérateur.

## 5. Parcours utilisateur principaux

1. Connexion : l'utilisateur saisit ses identifiants et accède au tableau de bord.
2. Ouverture de compte : depuis la page Comptes, l'agent crée un compte pour un nouveau client avec un dépôt initial.
3. Dépôt : depuis la fiche compte ou les actions rapides, l'agent enregistre un versement ; le solde et les indicateurs se mettent à jour.
4. Retrait : l'agent saisit un retrait ; si le solde est insuffisant, l'opération est bloquée avec un message explicite.
5. Suivi : l'administrateur consulte l'historique global et le tableau de bord pour piloter l'activité.

## 6. Exigences d'interface et de design

L'interface respecte strictement le design system MoWoBank fourni (fichier `MoWoBank Design System (standalone).html`).

- Structure applicative : barre latérale sombre (encre `#11191F`), barre supérieure et zone de travail crème (`#F8F7F2`).
- Accent jaune lumineux (`#FFED90`) pour l'élément actif et les accents.
- Cartes indicateur aux pastels sage, jaune, lilas et pêche.
- Typographie : Instrument Sans pour les titres, Inter pour le corps de texte, police monospace pour les montants et identifiants.
- Rayons généreux, ombres douces et diffuses, transitions de 160 ms.
- Composants réutilisés tels que définis : boutons (primaire, accent, secondaire, fantôme, destructif), champs, cartes, tableaux, puces de statut, avatars, alertes, toasts, fenêtres modales, panneaux latéraux, états vides.
- Interface entièrement en français, montants au format franc CFA (XOF).

## 7. Architecture technique

### 7.1 Pile logicielle

Conforme au PRD :

- Frontend : React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Recharts.
- Style : design system CSS MoWoBank (variables `--mw-*`), polices Inter et Instrument Sans.
- Desktop : Tauri v2 (Rust).
- Base de données : SQLite local (via le plugin SQL officiel de Tauri en mode desktop).
- Qualité : ESLint, Prettier.
- Packaging cible : installeur Windows MSI, AppImage Linux, DMG macOS.

### 7.2 Couche d'accès aux données

L'accès aux données est abstrait derrière une interface `Repository`. Deux implémentations sont fournies :

- `SqlRepository` : SQLite réel via `@tauri-apps/plugin-sql`, active en mode desktop Tauri ;
- `LocalRepository` : persistance dans le stockage local du navigateur, active en mode développement web.

Le choix de l'implémentation est automatique selon l'environnement d'exécution (présence de l'API Tauri). Cette abstraction garantit un comportement identique en démonstration web et en desktop, tout en conservant SQLite comme cible de production.

Note d'écart par rapport au PRD : pour la robustesse du POC, l'accès SQLite se fait par requêtes SQL via le plugin officiel plutôt que par Drizzle ORM. Le schéma reste structuré et documenté de façon à pouvoir être repris par Drizzle ultérieurement sans refonte du domaine.

### 7.3 Organisation du code

```
src/
 ├─ pages          écrans (login, dashboard, utilisateurs, comptes, transactions)
 ├─ components      shell applicatif et composants d'interface réutilisables
 ├─ services        logique métier (auth, users, accounts, transactions, dashboard)
 ├─ hooks           hooks React (authentification, requêtes TanStack Query)
 ├─ lib             types, formatage, détection d'environnement, icônes
 ├─ database        schéma, repository et données de démonstration
 └─ styles          design system

src-tauri/
 ├─ src             point d'entrée Rust et configuration des plugins
 ├─ capabilities    permissions (accès SQL)
 └─ tauri.conf.json configuration de l'application desktop
```

## 8. Données de démonstration

Au premier lancement, la base est initialisée avec :

- deux utilisateurs : un administrateur et un agent ;
- un jeu de comptes clients avec soldes variés ;
- un historique de transactions sur les jours précédents permettant d'alimenter le tableau de bord et le graphique.

## 9. Hors périmètre du POC

Ne sont pas couverts dans cette version : la gestion multi-établissements en production, le circuit de validation maker-checker, la gestion des prêts et échéanciers, le chiffrement de niveau production des mots de passe, la synchronisation distante et la gestion fine des droits au-delà des deux rôles définis.

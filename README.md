# CAMPOST Core Banking

Application desktop locale de core banking pour les agences de CAMPOST : gestion de la clientèle et de sa conformité (KYC), des comptes, des dépôts et retraits, de l'historique des transactions, des relevés de compte et pilotage de l'activité.

Voir le détail fonctionnel dans [`SPECIFICATIONS_FONCTIONNELLES.md`](./SPECIFICATIONS_FONCTIONNELLES.md).

## Pile technique

- React 19, TypeScript, Vite
- React Router, TanStack Query, Zod
- Recharts (graphiques)
- Design system maison (CSS, variables `--mw-*`, polices Inter et Instrument Sans)
- Tauri v2 (desktop) et SQLite via `@tauri-apps/plugin-sql`

## Architecture hybride d'accès aux données

L'accès aux données passe par une interface `Repository` avec deux implémentations choisies automatiquement selon l'environnement :

- mode navigateur (`pnpm dev`) : persistance dans `localStorage` (démonstration immédiate) ;
- mode desktop (`pnpm tauri:dev`) : base SQLite réelle via le plugin SQL de Tauri.

Le code de l'interface et la logique métier sont identiques dans les deux cas.

## Démarrage (développement)

### Prérequis

- Node.js 20+ et pnpm
- Pour le mode desktop : la chaîne Rust (`rustup`) et les prérequis Tauri v2 (voir https://tauri.app)

### Installation

```bash
pnpm install
```

### Mode web (démonstration rapide)

```bash
pnpm dev
```

Ouvrir http://localhost:1420. Au premier lancement, un jeu de données de démonstration est créé automatiquement.

### Mode desktop (Tauri + SQLite)

```bash
pnpm tauri:dev
```

La première exécution compile le cœur Rust de Tauri (plusieurs minutes).

## Distribution Windows

L'installeur Windows (`CAMPOST_1.0.0_x64-setup.exe`, NSIS, assistant en français, installation sans droits administrateur) doit être généré sur Windows (impossible depuis macOS ou Linux). Deux options :

**Option 1 — GitHub Actions (sans machine Windows).** Le workflow [`.github/workflows/build-windows.yml`](./.github/workflows/build-windows.yml) compile l'installeur sur un runner `windows-latest` :

- pousser un tag de version produit une *Release* avec l'installeur attaché :
  ```bash
  git tag v1.0.0 && git push origin v1.0.0
  ```
- ou lancer le workflow manuellement (onglet Actions, « Run workflow ») : l'installeur est récupérable en artefact.

**Option 2 — build local sur Windows.** Procédure complète dans [`GUIDE_INSTALLATION_WINDOWS.md`](./GUIDE_INSTALLATION_WINDOWS.md) ; commande : `pnpm tauri build --bundles nsis`.

**Manuel d'utilisation** : [`docs/Manuel_CAMPOST_Core_Banking.pdf`](./docs/Manuel_CAMPOST_Core_Banking.pdf) (et la version `.docx` modifiable). Pour le régénérer : `python3 scripts/generer_manuel.py`.

## Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@campost.cm | admin123 |
| Agent | agent@campost.cm | agent123 |

L'administrateur a accès à la gestion des utilisateurs ; l'agent gère la clientèle, les comptes et les transactions.

## Structure du projet

```
src/
 ├─ pages/         écrans (connexion, tableau de bord, comptes, clients, transactions, utilisateurs)
 ├─ components/    shell applicatif et composants d'interface réutilisables
 ├─ services/      logique métier (auth, users, clients, accounts, transactions, dashboard)
 ├─ hooks/         contextes React (authentification, notifications)
 ├─ lib/           types, formatage, environnement, icônes, logo
 ├─ database/      schéma SQLite, repository et données de démonstration
 └─ styles/        design system + styles applicatifs
src-tauri/         configuration desktop Tauri (Rust, plugin SQLite, commande d'impression)
docs/              manuel d'utilisation (.docx, .pdf) et captures
scripts/           génération du manuel
```

## Notes

- Les montants sont stockés en centimes (entiers) et formatés en franc CFA (XAF, zone BEAC).
- L'empreinte des mots de passe (SHA-256, JavaScript pur) est volontairement simple et n'est pas destinée à la production.
- Données réinitialisables en mode web en vidant le stockage local du navigateur ; en mode desktop en supprimant le fichier `%APPDATA%/com.mowobank.poc/mowobank_v5.db`.

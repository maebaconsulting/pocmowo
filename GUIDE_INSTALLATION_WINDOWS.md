# Guide de génération de l'installeur Windows — CAMPOST Core Banking

Ce guide explique comment produire l'installeur Windows (`CAMPOST_1.0.0_x64-setup.exe`) à partir du code source, puis comment l'installer sur les postes des agences.

Important : un installeur Windows ne peut être généré que **sur une machine Windows** (la chaîne de compilation NSIS et le composant WebView2 sont propres à Windows). La compilation depuis macOS ou Linux n'est pas possible pour cette cible.

## 1. Prérequis sur la machine de compilation

Machine Windows 10 ou 11 (64 bits) avec :

1. **Microsoft C++ Build Tools**
   Télécharger « Visual Studio Build Tools » depuis https://visualstudio.microsoft.com/visual-cpp-build-tools/ et installer la charge de travail « Développement Desktop en C++ » (inclut le compilateur MSVC et le SDK Windows).

2. **Rust** (chaîne MSVC)
   Installer depuis https://rustup.rs (exécuter `rustup-init.exe`). Vérifier ensuite dans un terminal :
   ```powershell
   rustc --version
   cargo --version
   ```

3. **Node.js LTS** (version 20 ou supérieure)
   Télécharger depuis https://nodejs.org. Vérifier :
   ```powershell
   node --version
   ```

4. **pnpm**
   ```powershell
   npm install -g pnpm
   ```

5. **WebView2**
   Présent par défaut sur Windows 11 et la plupart des Windows 10 à jour. L'installeur l'ajoutera automatiquement si nécessaire (voir la configuration WebView2 plus bas).

## 2. Récupération du projet

Copier l'intégralité du dossier du projet sur la machine Windows. Si vous transférez une archive, **excluez** les dossiers suivants (ils seront régénérés) :

- `node_modules`
- `src-tauri/target`
- `dist`

## 3. Compilation de l'installeur

Dans un terminal (PowerShell) ouvert à la racine du projet :

```powershell
pnpm install
pnpm tauri build --bundles nsis
```

La première compilation Rust prend plusieurs minutes (téléchargement et compilation des dépendances Tauri). Les compilations suivantes sont beaucoup plus rapides.

## 4. Récupération du fichier produit

L'installeur se trouve à l'emplacement :

```
src-tauri\target\release\bundle\nsis\CAMPOST_1.0.0_x64-setup.exe
```

C'est le seul fichier à distribuer aux postes des agences.

## 5. Installation sur un poste utilisateur

1. Copier `CAMPOST_1.0.0_x64-setup.exe` sur le poste cible.
2. Double-cliquer sur le fichier. L'assistant d'installation s'affiche **en français**.
3. L'installation se fait **par utilisateur**, sans droits administrateur.
4. À la fin, un raccourci « CAMPOST » est créé (menu Démarrer, et bureau selon le choix).
5. Lancer l'application depuis le raccourci. Au premier démarrage, la base de données locale est créée et des données de démonstration sont chargées.

Identifiants de démonstration :

| Rôle | Identifiant | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@campost.cm | admin123 |
| Agent | agent@campost.cm | agent123 |

## 6. Où sont stockées les données

Les données (comptes, clients, transactions) sont enregistrées localement dans une base SQLite :

```
%APPDATA%\com.mowobank.poc\mowobank_v5.db
```

Pour réinitialiser l'application à son état de démonstration, fermer l'application puis supprimer ce fichier ; il sera recréé au prochain lancement.

## 7. Dépannage

### Avertissement SmartScreen au lancement de l'installeur

L'application n'étant pas signée numériquement, Windows peut afficher « Windows a protégé votre ordinateur ». Cliquer sur « Informations complémentaires » puis « Exécuter quand même ». Pour supprimer cet avertissement en production, il faut acquérir un certificat de signature de code et configurer la signature (option avancée, hors périmètre de ce guide).

### Postes sans accès Internet

Par défaut, l'installeur embarque un petit programme d'amorçage qui télécharge WebView2 s'il est absent (configuration `embedBootstrapper`). Pour des postes totalement hors-ligne, produire un installeur **autonome** qui embarque WebView2 (environ 130 Mo de plus) : dans `src-tauri/tauri.conf.json`, remplacer

```json
"webviewInstallMode": { "type": "embedBootstrapper" }
```

par

```json
"webviewInstallMode": { "type": "offlineInstaller" }
```

puis recompiler.

### Erreur de compilation liée au compilateur C++

Vérifier que la charge « Développement Desktop en C++ » est bien installée via Visual Studio Build Tools, puis redémarrer le terminal.

## 8. Manuel d'utilisation

Le manuel destiné aux agents et administrateurs se trouve dans le dossier `docs/` :

- `docs/Manuel_CAMPOST_Core_Banking.pdf` (à distribuer aux utilisateurs)
- `docs/Manuel_CAMPOST_Core_Banking.docx` (version modifiable)

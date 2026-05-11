# 📚 Book stuff

> 🎯 **Organiser des lieux, partager l’accès, éviter les doublons.**

[![Node](https://img.shields.io/badge/node-%3E%3D26-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![MUI](https://img.shields.io/badge/MUI-9-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-D22128?style=for-the-badge&logo=apache&logoColor=white)](LICENSE)

[![Frontend](https://img.shields.io/badge/🖥️_frontend-book--stuff-181717?style=for-the-badge&logo=github)](https://github.com/ripoul/book-stuff)
[![Backend](https://img.shields.io/badge/🔌_backend-dépôts_API-181717?style=for-the-badge&logo=github)](https://github.com/ripoul?tab=repositories)

---

## 💡 À propos

**Book stuff** est une appli **React** branchée sur une **API REST** (🔐 JWT, comptes, réservation / lieux) :

- 📍 **Places** — visibilité, droits
- 📎 **Ressources** — liées à chaque lieu
- ✉️ **Invitations** — invité ↔ gestionnaire

En dev, le proxy Vite envoie souvent `/api` vers un serveur local type **Django** (`127.0.0.1:8000`) → voir `vite.config.ts` et `VITE_API_BASE_URL`.

---

## 🔗 Dépôts

| Rôle            | Lien                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 🖥️ **Frontend** | [**github.com/ripoul/book-stuff**](https://github.com/ripoul/book-stuff) _(ce dépôt)_                                          |
| 🔌 **Backend**  | [**Dépôts @ripoul**](https://github.com/ripoul?tab=repositories) _(trouver l’API / OpenAPI : `/booking/`, `/accounts/`, etc.)_ |

💬 _Si l’API est ailleurs, mets à jour la ligne « Backend » avec l’URL exacte du dépôt._

---

## ✨ Fonctionnalités

### 👤 Côté utilisateur

| Zone           | Détail                                                          |
| -------------- | --------------------------------------------------------------- |
| 👋 Compte      | Inscription, connexion, profil (nom, email)                     |
| 📍 Lieux       | Liste, détail, ressources paginées                              |
| ✉️ Invitations | Liste + filtre statut, accepter / refuser selon le cycle de vie |
| 🔔 UX          | Pastille sur l’avatar = nombre d’invitations **pending**        |

### 🔧 Côté gestionnaire de lieu

| Zone           | Détail                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| 📍 Lieu        | Création / édition si `can_manage`                                                                            |
| 📎 Ressources  | CRUD sur la fiche lieu                                                                                        |
| ✉️ Invitations | Filtres (place, plusieurs statuts), inviter par email, révoquer, ré-inviter (`revoked` → `pending` via PATCH) |

---

## 🗺️ Schéma (vue d’ensemble)

```mermaid
flowchart TB
  subgraph spa [SPA_Vite_React]
    UI[Pages_MUI]
    API_CLIENT[authFetch_+_OpenAPI_shapes]
  end
  subgraph remote [Backend]
    REST["REST_JWT"]
  end
  UI --> API_CLIENT
  API_CLIENT --> REST
```

---

## 🛠️ Développement

### 📋 Prérequis

| Outil          | Version                                          | Badge                                                                                                      |
| -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Node.js**    | `>= 26`                                          | ![node](https://img.shields.io/badge/node-%3E%3D26-339933?logo=node.js&logoColor=white)                    |
| **pnpm**       | `9.x` (`packageManager` dans `package.json`)     | ![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)                              |
| **pre-commit** | Python 3 + [pre-commit](https://pre-commit.com/) | ![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=precommit&logoColor=white) |

### 📥 Installation

```bash
corepack enable
pnpm install
cp .env.example .env
```

| Variable            | Rôle                                                     |
| ------------------- | -------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base de l’API (ex. `/api` derrière le proxy Vite en dev) |

### 📜 Scripts

| Commande                            | Effet                         |
| ----------------------------------- | ----------------------------- |
| `pnpm dev`                          | Vite + proxy `/api` → backend |
| `pnpm build`                        | `tsc -b` + bundle production  |
| `pnpm test`                         | Vitest (happy-dom)            |
| `pnpm lint`                         | ESLint, zéro warning          |
| `pnpm format` / `pnpm format:check` | Prettier                      |
| `pnpm check`                        | `lint` + `format:check`       |

### 🪝 Pre-commit (hooks Git)

Définition : [`.pre-commit-config.yaml`](.pre-commit-config.yaml)

- 🧹 `trailing-whitespace`, `end-of-file-fixer`, `check-yaml`, `check-json`, `check-added-large-files`
- ✨ **eslint** — `pnpm exec eslint --fix --max-warnings=0` (TS/TSX)
- 💅 **prettier** — `pnpm exec prettier --write`

**Une fois par clone :**

```bash
pip install pre-commit   # ou : brew install pre-commit
pre-commit install
```

**Tout le dépôt :**

```bash
pre-commit run --all-files
```

> ⚠️ Les hooks appellent `pnpm exec` → lance `pnpm install` avant la première exécution.

### 🧰 Chaîne d’outils

| Domaine | Outil                                     |
| ------- | ----------------------------------------- |
| Build   | Vite 5, `@vitejs/plugin-react`            |
| Langage | TypeScript ~6                             |
| UI      | MUI 9, Emotion                            |
| Tests   | Vitest 2, Testing Library, happy-dom      |
| Qualité | ESLint 9, Prettier 3, `typescript-eslint` |
| CI      | GitHub Actions → `.github/workflows/`     |

---

☕ _Fait avec des flèches, des tableaux et un peu de café._

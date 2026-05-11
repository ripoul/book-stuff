# 📚 Book stuff

> 🎯 **Organise places, share access, avoid double bookings.**

[![Node](https://img.shields.io/badge/node-%3E%3D26-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![MUI](https://img.shields.io/badge/MUI-9-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-D22128?style=for-the-badge&logo=apache&logoColor=white)](LICENSE)

[![Frontend](https://img.shields.io/badge/🖥️_frontend-book--stuff-181717?style=for-the-badge&logo=github)](https://github.com/ripoul/book-stuff)
[![Backend](https://img.shields.io/badge/🔌_backend-API_repo-181717?style=for-the-badge&logo=github)](https://github.com/ripoul/book-stuff-api)

---

## 💡 About

**Book stuff** is a **React** app wired to a **REST API** (🔐 JWT, accounts, places / bookings):

- 📍 **Places** — visibility, permissions
- 📎 **Resources** — attached to each place
- ✉️ **Invitations** — guest ↔ manager

In dev, the Vite proxy usually forwards `/api` to a local server (e.g. **Django** at `127.0.0.1:8000`) → see `vite.config.ts` and `VITE_API_BASE_URL`.

---

## 🔗 Repositories

| Role            | Link                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 🖥️ **Frontend** | [**github.com/ripoul/book-stuff**](https://github.com/ripoul/book-stuff) _(this repo)_                                                       |
| 🔌 **Backend**  | [**github.com/ripoul/book-stuff-api**](https://github.com/ripoul/book-stuff-api) _(find the API / OpenAPI: `/booking/`, `/accounts/`, etc.)_ |

---

## ✨ Features

### 👤 User side

| Area           | Detail                                                    |
| -------------- | --------------------------------------------------------- |
| 👋 Account     | Sign up, sign in, profile (name, email)                   |
| 📍 Places      | List, detail, paginated resources                         |
| ✉️ Invitations | List + status filter, accept / decline based on lifecycle |
| 🔔 UX          | Avatar badge = number of **pending** invitations          |

### 🔧 Place manager side

| Area           | Detail                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 📍 Place       | Create / edit when `can_manage`                                                                          |
| 📎 Resources   | CRUD on the place page                                                                                   |
| ✉️ Invitations | Filters (place, multiple statuses), invite by email, revoke, re-invite (`revoked` → `pending` via PATCH) |

---

## 🛠️ Development

### 📋 Prerequisites

| Tool           | Version                                          | Badge                                                                                                      |
| -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Node.js**    | `>= 26`                                          | ![node](https://img.shields.io/badge/node-%3E%3D26-339933?logo=node.js&logoColor=white)                    |
| **pnpm**       | `9.x` (`packageManager` in `package.json`)       | ![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)                              |
| **pre-commit** | Python 3 + [pre-commit](https://pre-commit.com/) | ![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=precommit&logoColor=white) |

### 📥 Installation

```bash
corepack enable
pnpm install
cp .env.example .env
```

| Variable            | Role                                                    |
| ------------------- | ------------------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (e.g. `/api` behind the Vite proxy in dev) |

### 📜 Scripts

| Command                             | Effect                        |
| ----------------------------------- | ----------------------------- |
| `pnpm dev`                          | Vite + `/api` proxy → backend |
| `pnpm build`                        | `tsc -b` + production bundle  |
| `pnpm test`                         | Vitest (happy-dom)            |
| `pnpm lint`                         | ESLint, zero warning          |
| `pnpm format` / `pnpm format:check` | Prettier                      |
| `pnpm check`                        | `lint` + `format:check`       |

### 🪝 Pre-commit (Git hooks)

Definition: [`.pre-commit-config.yaml`](.pre-commit-config.yaml)

- 🧹 `trailing-whitespace`, `end-of-file-fixer`, `check-yaml`, `check-json`, `check-added-large-files`
- ✨ **eslint** — `pnpm exec eslint --fix --max-warnings=0` (TS/TSX)
- 💅 **prettier** — `pnpm exec prettier --write`

**Once per clone:**

```bash
pip install pre-commit   # or: brew install pre-commit
pre-commit install
```

**Across the whole repo:**

```bash
pre-commit run --all-files
```

> ⚠️ Hooks call `pnpm exec` → run `pnpm install` before the first execution.

### 🧰 Toolchain

| Area     | Tool                                      |
| -------- | ----------------------------------------- |
| Build    | Vite 5, `@vitejs/plugin-react`            |
| Language | TypeScript ~6                             |
| UI       | MUI 9, Emotion                            |
| Tests    | Vitest 2, Testing Library, happy-dom      |
| Quality  | ESLint 9, Prettier 3, `typescript-eslint` |
| CI       | GitHub Actions → `.github/workflows/`     |

---

<div align="center">

Made with care by [**ripoul**](https://github.com/ripoul)

</div>

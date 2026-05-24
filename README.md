# TimeStudy Portal YPII

[![CI](https://github.com/cakrawala-tumbuh/timestudy-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/cakrawala-tumbuh/timestudy-portal/actions/workflows/ci.yml)
[![Publish](https://github.com/cakrawala-tumbuh/timestudy-portal/actions/workflows/publish.yml/badge.svg)](https://github.com/cakrawala-tumbuh/timestudy-portal/actions/workflows/publish.yml)
[![Docker Image](https://img.shields.io/badge/container-ghcr.io%2Fcakrawala--tumbuh%2Ftimestudy--portal-blue?logo=docker)](https://github.com/cakrawala-tumbuh/timestudy-portal/pkgs/container/timestudy-portal)
[![Docs](https://img.shields.io/badge/docs-TypeDoc-orange?logo=readthedocs)](https://cakrawala-tumbuh.github.io/timestudy-portal/)

Admin portal for the TimeStudy YPII workforce time study application.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Auth | NextAuth v4 (Credentials + JWT) |
| State | TanStack Query v5 |
| HTTP client | Axios |
| Testing | Jest + Testing Library |
| Deployment | Vercel (default) / Docker (standalone) |

## Features

- Dashboard with KPI cards and time category distribution chart
- Respondent management (full CRUD + PIN management)
- Daily log browser with filters (respondent, date range, sync status)
- OAuth2 client registry — manage Android app credentials (PKCE)
- Fully server-side auth guard via NextAuth middleware

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# URL of the backend API (used server-side)
BACKEND_URL=http://localhost:8000

# URL exposed to browser (build-time)
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth signing secret — generate: openssl rand -base64 32
NEXTAUTH_SECRET=your_secret_here

# Canonical URL of this Next.js app
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
The login page redirects to `/dashboard` after successful authentication.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
| `npm test -- --coverage` | With coverage report |
| `npm run docs` | Generate TypeDoc HTML → `docs/` |

### Generating TypeDoc Documentation

```bash
# Install dependencies (includes typedoc)
npm install

# Generate HTML docs → docs/
npm run docs
```

The `typedoc.json` at the project root configures which modules are included.
Output is written to `docs/` and can be hosted as a static site.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BACKEND_URL` | ✅ | Backend base URL — **server-side only** |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL — **exposed to browser** |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret |
| `NEXTAUTH_URL` | ✅ | Canonical URL (must match deployment URL) |

> **Note:** `BACKEND_URL` and `NEXT_PUBLIC_API_URL` often share the same value. They are kept separate so that Docker deployments can route server-side calls through an internal network while browser calls use the public URL.

## Vercel Deployment

1. Import the repo in Vercel.
2. Set all four environment variables in **Project Settings → Environment Variables**.
3. Deploy — no additional configuration needed. Vercel auto-detects Next.js.

## Docker Deployment

### Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.ypii.example.com \
  -t timestudy-portal-ypii .
```

### Run

```bash
docker run -p 3000:3000 \
  -e BACKEND_URL=http://backend:8000 \
  -e NEXT_PUBLIC_API_URL=https://api.ypii.example.com \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXTAUTH_URL=https://portal.ypii.example.com \
  timestudy-portal-ypii
```

### Pre-built image (GHCR)

```bash
docker pull ghcr.io/ypii/timestudy-portal-ypii:latest
```

Images are automatically published on every `v*` tag via GitHub Actions.

## CI/CD

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | Every push / PR to `master` | Type check → Lint → Unit tests |
| `docker.yml` | Push tag `v*` | Build + push multi-arch image to GHCR |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Auth-protected layout + pages
│   │   ├── layout.tsx        # Sidebar + header shell
│   │   ├── dashboard/        # KPI cards + charts
│   │   ├── respondents/      # Respondent CRUD
│   │   ├── daily-logs/       # Log browser
│   │   └── oauth/            # OAuth2 client registry
│   ├── api/auth/             # NextAuth route handler
│   ├── login/                # Login page
│   └── providers.tsx         # SessionProvider + QueryClientProvider
├── components/
│   ├── layout/               # Sidebar, Header
│   ├── dashboard/            # DashboardContent
│   ├── respondents/          # RespondentList + modal
│   ├── daily-logs/           # DailyLogList
│   └── oauth/                # OAuthClientList + modal
├── lib/
│   ├── api.ts                # Axios API client functions
│   ├── auth.ts               # NextAuth configuration
│   └── utils.ts              # cn, formatDate, formatPercent, etc.
├── types/
│   ├── index.ts              # Domain types
│   └── next-auth.d.ts        # NextAuth session type augmentation
└── middleware.ts             # Route protection
```

## License

MIT

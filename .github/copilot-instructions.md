# Copilot Instructions — TimeStudy Portal YPII

## Stack

| Komponen | Detail |
|---|---|
| Framework | Next.js 14 (App Router, `output: "standalone"`) |
| Auth | NextAuth v4 — Credentials provider, JWT session strategy |
| HTTP Client | Axios (`baseURL: "/api/v1"`) |
| Backend | FastAPI via Docker internal `http://backend:8000` |
| Deployment | Docker + Traefik (HTTPS) |

---

## Arsitektur API (Proxy Pattern)

**Semua** request dari client ke backend harus melalui proxy internal Next.js.

```
Browser → GET /api/v1/respondents
       → Next.js middleware (auth check)
       → src/app/api/v1/[...path]/route.ts  (proxy)
       → http://backend:8000/api/v1/respondents
```

### Kenapa proxy?

- `BACKEND_URL=http://backend:8000` hanya tersedia di dalam container Docker — tidak bisa diakses browser.
- URL backend **tidak boleh** di-bake ke dalam image saat build time (tidak ada `NEXT_PUBLIC_API_URL` sebagai build arg).
- Proxy route handler membaca `BACKEND_URL` dari `process.env` **saat runtime**.

### Aturan proxy (`src/app/api/v1/[...path]/route.ts`)

- Proxy memanggil `getToken({ req })` sendiri untuk inject header `Authorization: Bearer <token>`.
- **Jangan** mengandalkan middleware untuk forward Authorization header ke Route Handler — `NextResponse.next({ request: { headers } })` **tidak reliably** propagate ke App Router Route Handlers di Next.js 14.
- `getToken()` membaca cookie NextAuth langsung dari request, jauh lebih andal.

---

## Authentication & Token Refresh

### Flow login

1. `authorize()` memanggil `POST /api/v1/auth/login` → dapat `access_token`, `refresh_token`, `expires_in`
2. JWT callback menyimpan `accessToken`, `refreshToken`, `accessTokenExpiry = Date.now() + expires_in * 1000`
3. Session callback meng-expose `session.accessToken` ke client

### Token refresh otomatis

Backend menerbitkan access token dengan TTL **60 menit** (`ACCESS_TOKEN_EXPIRE_MINUTES`). NextAuth JWT bisa hidup berhari-hari — tanpa refresh, semua API call akan **401** setelah 60 menit.

JWT callback di `auth.ts` melakukan refresh otomatis:

```typescript
// Jika token expired atau dalam 60 detik dari expiry → refresh
if (!expiry || Date.now() >= expiry - 60_000) {
  // POST /api/v1/auth/refresh dengan { refresh_token }
  // Simpan access_token, refresh_token, accessTokenExpiry baru
}
```

Endpoint refresh backend: `POST /api/v1/auth/refresh` — body `{ refresh_token: string }` — response sama dengan login (`access_token`, `refresh_token`, `expires_in`).

### Error handling refresh

Jika refresh gagal → `token.error = "RefreshTokenError"`. UI dapat membaca `session.error` dan redirect ke `/login`.

---

## Environment Variables (Runtime, bukan build-time)

| Variabel | Digunakan di | Catatan |
|---|---|---|
| `BACKEND_URL` | `auth.ts`, proxy route handler | Default `http://localhost:8000` |
| `NEXTAUTH_URL` | NextAuth internals | Harus diset di container |
| `NEXTAUTH_SECRET` | NextAuth + `getToken()` | Wajib ada; tanpa ini `getToken()` return `null` |

**Jangan** pakai `NEXT_PUBLIC_API_URL` sebagai build arg untuk URL backend — akan ter-bake ke dalam image dan tidak bisa diubah saat deployment.

---

## Hal yang Tidak Boleh Dilakukan

- ❌ `next.config.ts` rewrites dengan `BACKEND_URL` — dievaluasi saat build, bukan runtime
- ❌ `NEXT_PUBLIC_API_URL` sebagai Docker build arg yang di-bake ke image
- ❌ Inject Authorization header di middleware untuk diteruskan ke Route Handler — tidak reliable di Next.js 14
- ❌ Menyimpan access token tanpa `accessTokenExpiry` — akan menyebabkan 401 setelah 60 menit tanpa indikasi

---

## CI/CD

### Trigger GitHub Actions

| Event | Job |
|---|---|
| PR ke `master` | `lint`, `unit test`, `e2e` |
| Push tag `v*` | `publish` (build + push Docker image ke GHCR) |
| `workflow_dispatch` | Semua job CI |

- PR **tidak boleh** di-merge jika ada job CI yang gagal.
- Push langsung ke `master` **tidak** mentrigger CI — semua harus via PR.

### E2E Tests (`docker-compose.e2e.yml`)

- Backend dan portal di-build dari source lokal (bukan dari GHCR) — GHCR package bisa private.
- Backend menggunakan `DATABASE_URL: sqlite:////data/timestudy-e2e.db` — path absolut ke `/data` yang di-chown ke `appuser` di Dockerfile. **Jangan** pakai path relatif (`sqlite:///./...`) karena `/app` dimiliki root.
- Portal image di-tag `timestudy-portal:e2e` dan dipakai di compose.

---

## Workflow Git & Versioning

### Commit
- Saat diminta commit, lakukan langsung.
- Format commit message: `<type>(<scope>): <deskripsi singkat>`
  - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `build`
  - Scope opsional: nama komponen, halaman, atau file utama yang berubah
  - Tambahkan body untuk menjelaskan **apa** yang berubah dan **mengapa** jika tidak sudah jelas
- Contoh: `feat(respondents): tambah filter pencarian berdasarkan nama`

### Push
- Saat diminta push, push ke branch fitur aktif — **bukan** `master`.
- `master` hanya bisa diubah via Pull Request yang sudah lulus semua CI test.
- Contoh: `git push origin feature/nama-fitur`

### Branch Strategy
- `master`: protected — semua perubahan via PR.
- Nama branch: `feature/<nama>`, `fix/<nama>`, `chore/<nama>`, `docs/<nama>`

### Versioning & Tagging
Format: `vMAJOR.MINOR.PATCH` (Semantic Versioning)

| Jenis Perubahan | Bump | Contoh |
|---|---|---|
| Bug fix, hotfix, perbaikan kecil, docs | PATCH | `v1.0.0` → `v1.0.1` |
| Fitur baru, perubahan non-breaking | MINOR | `v1.0.0` → `v1.1.0` |
| Breaking change, perombakan arsitektur, perubahan API | MAJOR | `v1.0.0` → `v2.0.0` |

- Saat diminta membuat tag, tentukan bump berdasarkan tabel di atas, lalu:
  ```
  git tag -a vX.Y.Z -m "<ringkasan perubahan>"
  git push origin vX.Y.Z
  ```
- Tag dibuat di commit `master` terbaru (setelah PR di-merge).

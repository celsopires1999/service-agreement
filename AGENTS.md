# Service Agreement — Agent Instructions

## Quick start

```bash
npm install
npm run db:migrate   # apply Drizzle migrations
npm run db:seed      # seed data
npm run dev          # next dev --turbopack on :3000
```

## Commands

| Category | Command | Notes |
|----------|---------|-------|
| Dev | `npm run dev` | Turbopack |
| Lint | `npm run lint` | `next lint` (eslint config at `eslint.config.mjs`) |
| Build | `npm run build` | `next build` with `output: "standalone"` |
| DB studio | `npm run db:studio` | loads `.env.drizzle` |
| DB generate | `npm run db:generate` | creates migration from `src/db/schema.ts` |
| DB push | `npm run db:push` | pushes schema directly (dev only) |
| DB migrate | `npm run db:migrate` | runs `src/db/migrate.ts` via tsx |
| DB seed | `npm run db:seed` | runs `src/db/seed.ts` via tsx |
| Test all | `npm test` | jest coverage (core + ui projects) |
| Test core | `npm run test:core` | node env, uses Testcontainers (PostgreSQL) |
| Test ui | `npm run test:ui` | jsdom env |
| Test e2e | `npm run test:e2e` | Playwright, sequential, 1 worker |
| Test e2e update | `npm run test:e2e:update` | update ARIA snapshots |
| Test e2e headed | `npm run test:e2e:headed` | headed mode, no reporter |

## Architecture

- **`src/core/`** — Clean Architecture / DDD. Each domain (`agreement/`, `plan/`, `service/`, `system/`, `user/`, `users-list/`) has `domain/`, `application/`, `infra/` subdirs. Must NOT import React.
- **`src/app/`** — Next.js App Router pages. Route groups: `(auth)`, `(sam)` (agreements/plans/services/systems/users).
- **`src/actions/`** — Server Actions via `next-safe-action` (v7). Business logic delegates to `src/core/`, not embedded.
- **`src/db/schema.ts`** — Single-file Drizzle schema. Migrations in `src/db/migrations/`.
- **`src/components/ui/`** — shadcn/ui (New York style, RSC enabled).
- **`@/*`** maps to `./src/*`.

## Environment files

| File | Use |
|------|-----|
| `.env.local` | local dev (loaded by `src/db/index.ts` via dotenv) |
| `.env.drizzle` | DB tooling (studio, generate, push, migrate, seed) |
| `.env.e2e` | E2E tests |
| `.env.development` | Docker dev (used by docker-compose) |

## DB connection modes

Controlled by `DB_AUTH_MODE` env var:
- `connection-string` (default) — uses `DATABASE_URL` directly
- `managed-identity` — uses `AZURE_POSTGRESQL_CONNECTIONSTRING` + Azure AD token via `@azure/identity`. Token is auto-refreshed before expiry (`DB_TOKEN_REFRESH_MARGIN_MS`, default 5min). Failed refresh retries after 30s.

Additional DB env vars:
- `DB_POOL_MAX` — max connections in pool (default 10)
- `DB_TOKEN_REFRESH_MARGIN_MS` — ms before token expiry to trigger refresh (default 300000)

`drizzle-kit` commands (db:generate, db:push, db:studio) always read `DATABASE_URL` directly.

## Testing rules

- **Naming**: `*.spec.ts` (unit), `*.int-spec.ts` (integration/core), `*.spec.tsx`/`*.test.tsx` (ui), `*.e2e.ts` (e2e).
- **UI test location**: test file goes in a `__tests__/` folder next to the component (e.g. `src/components/__tests__/MyComponent.test.tsx`).
- **UI mocks**: centralized at `src/app/__mocks__/`. Use `setupMockFormHooks()` from `mock-form-hooks.ts` for form tests. `lucide-react` is auto-mocked.
- **Interactions**: prefer `@testing-library/user-event` over `fireEvent`.
- **IDs in mock data**: must be valid UUID v4 strings.
- **Core integration tests**: use Testcontainers (`jest.global.setup.ts` spins up `postgres:18.1-alpine`). DB config is shared via env.
- **E2E**: connected via Playwright websocket (`BROWSER_WSS_ENDPOINT`). Dev server auto-started by Playwright config. Tests run sequentially (`workers: 1`, `fullyParallel: false`). Uses ARIA snapshot testing (`--update-snapshots`).
- **Coverage thresholds**: statements 80%, branches 65%, functions 80%, lines 80%.

## Dev auth (local only, env `NODE_ENV=development`)

Credentials provider with password "password":
- `admin@admin.com` / `viewer@viewer.com` / `validator@validator.com`

## Code style

- Prettier: 4-space tabs, no semicolons, single quotes: false, Tailwind class sorting via `prettier-plugin-tailwindcss`
- ESLint: `next/core-web-vitals` + `next/typescript` extended

## Docker

Three services in `docker-compose.yaml`: `sav` (dev container), `db` (postgres:18.1-alpine), `playwright` (browser server). CI variant in `docker-compose.ci.yaml` with healthchecks. Run via `.docker/ci-test.sh`.

# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js App Router routes (auth flows like `login`/`signup`, dashboard, API endpoints in `app/api`).
- `components/` houses Radix/Tailwind UI plus `components/ui/` shadcn primitives declared in `components.json`; lean on these before adding new design tokens.
- `lib/` contains auth/client utilities; `db/` defines the Drizzle schema and connections (drizzle.ts for auth data via DATABASE_URL, backend-db.ts for banking data via DATABASE_URL_BACKEND); `migrations/` stores generated SQL.
- `types/` centralizes shared API/domain contracts (bank accounts, transactions). Keep these interfaces in sync with the Drizzle schema and any client fetchers that consume them.
- `server/` groups server-side helpers for members, organizations, permissions; `public/` keeps static assets; `scripts/` stores operational scripts (e.g., DB connection checks).
- `proxy.ts` is the Next middleware enforcing Better Auth on `/dashboard` routes—extend its `matcher` when new authenticated surfaces are introduced.
- Copy `env.example` to `.env` before running anything that touches the database or auth.

## Build, Test, and Development Commands
- Install: `pnpm install` (pnpm-first; avoid mixing npm/yarn).
- Run `pnpm prepare` after install so Husky can wire up any local hooks.
- Develop: `pnpm dev` to run the dev server on `http://localhost:3000` (Turbopack).
- Production: `pnpm build` then `pnpm start` to serve the compiled app.
- Quality: `pnpm lint` runs ESLint; `pnpm exec biome check .` for lint/format per `biome.jsonc` and `pnpm exec biome format . --write` to apply fixes.
- Database: `pnpm db:generate` emits migrations from `db/schema.ts`; `pnpm db:migrate` pushes them to the `DATABASE_URL` target; `pnpm db:studio` opens Drizzle Studio for inspection.

## Coding Style & Naming Conventions
- TypeScript/TSX with strict mode; prefer 2-space indentation, double quotes, and semicolons as seen in `app/` and `db/`.
- Components in PascalCase (`ModeSwitcher`), helpers/hooks in camelCase, route folders in kebab-case.
- Reach for Tailwind utility classes and shared shadcn components; keep global overrides in `app/globals.css`.
- Import via the `@/*` alias (see `tsconfig.json`) instead of deep relative paths, and expose new shared types through `@/types/*` when needed.
- Client-only helpers (e.g., `cn` from `@/lib/utils`) should be reused rather than re-implementing utility logic.

## Testing Guidelines
- No full test suite yet; add `*.test.ts(x)` near the code you modify when introducing logic.
- Favor lightweight component tests and contract tests for server/db utilities; mock external APIs such as Neon, Better Auth, Resend, and banking providers.
- Validate schema changes with a quick Drizzle query and a manual page check before merging.

## Commit & Pull Request Guidelines
- Mirror existing history: short, prefixed subjects (`FE: add TIDB connection`), imperative tone, one change-set per commit.
- Include commit bodies when touching data models, auth flows, or migrations; mention related issues if applicable.
- PRs should summarize changes, link issues, attach screenshots/GIFs for UI updates, and call out migrations or env additions. Ensure `pnpm lint` and `pnpm build` pass locally and note any skipped checks.

## Security & Configuration Tips
- Keep secrets in `.env`; never commit them. Rotate `DATABASE_URL`, `DATABASE_URL_BACKEND`, and auth credentials when changing environments.
- Respect the Better Auth middleware in `proxy.ts`—protect new authenticated routes there and verify session cookies before issuing server actions.
- Prefer regenerating migrations via Drizzle over hand-editing SQL; review generated files in `migrations/` into PRs.
- Treat `public/` assets as non-sensitive and move anything dynamic behind the API instead of exposing it statically.

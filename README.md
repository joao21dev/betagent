# BetAgent

Initial BetAgent monorepo scaffold based on Turborepo, PNPM, strict TypeScript, and a shared Prisma setup.

## Base Stack

- Turborepo for workspace orchestration
- PNPM workspaces
- TypeScript in strict mode
- Biome for linting and formatting
- Prisma with the central schema in `services/api/prisma/schema.prisma`
- Prisma Client generated into `packages/prisma-client/generated`

## Structure

```text
apps/
  web/
services/
  api/
  ingest/
  worker/
packages/
  components/
  core/
  domain/
  graphql/
  prisma-client/
  ui/
```

## Prerequisites

- Node.js >= 20
- Corepack enabled

## Setup

```bash
corepack pnpm install
```

## Main Commands

```bash
corepack pnpm install
corepack pnpm run prisma:generate
corepack pnpm run db:migrate # requires DATABASE_URL — creates/applies Postgres schema
corepack pnpm run db:seed    # inserts dev Sport/League/Team/Match rows
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm dev            # Turborepo: runs dev scripts (API + Web and other packages)
```

## Environment

Copy [.env.example](.env.example) to `.env` in the repo root for Prisma/`services/api`. For Next, also create `apps/web/.env.local` with the `NEXT_PUBLIC_*` entries from the sample file (`SUPABASE_JWT_SECRET` must match the Signing secret used by your Supabase JWTs).

## Smoke test (manual)

With Postgres reachable and migrations applied plus seed:

```bash
# terminal A
corepack pnpm --filter @repo/api dev

# terminal B
corepack pnpm --filter @repo/web dev
```

Sign in on `http://localhost:3000` with a Supabase user; the homepage sends the Supabase session `access_token` as `Authorization: Bearer` to GraphQL (`NEXT_PUBLIC_GRAPHQL_URL`). The API must verify those tokens using the same JWT secret configured as `SUPABASE_JWT_SECRET`.

## Notes

- `services/api` serves NestJS 11 + Apollo GraphQL (`/graphql`) with Supabase-signed JWT bearer auth (`GqlAuthGuard`) on sports read queries (`leagues`, `matches`).
- `apps/web` is a thin Next.js 15 dashboard that logs in via Supabase and queries matches through Apollo Client.

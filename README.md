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
corepack pnpm run prisma:generate
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

## Notes

- This repository is currently in the initial scaffold state.
- `api`, `ingest`, `worker`, and `apps/web` still use placeholder scripts.
- The next step is a vertical bootstrap of `services/api` (NestJS + GraphQL) with a read-only `League` and `Match` module.

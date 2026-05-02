# BetAgent Workspace Preferences

## Learned User Preferences

- Always draft a plan and confirm before implementation.
- Plan files live in `~/.cursor/plans/` and are not edited during implementation.
- Standard implementation trigger phrase: "Implement the plan as specified...".
- Commit messages are requested as a separate follow-up after implementation; use **Conventional Commits** (`type(scope): subject`, see `.cursor/rules/commits.mdc`).
- Tests must use plain descriptive names without REQ tags.

## Learned Workspace Facts

- Monorepo: Turborepo with `apps/web`, `services/api`, `services/ingest`, `services/worker`, and shared `packages/*`.
- Backend stack: NestJS 11 + Apollo GraphQL + Prisma + PostgreSQL.
- Vector search: pgvector in PostgreSQL.
- Queue and transport: Redis for BullMQ, pubsub, and microservice RPC.
- Agent orchestration: LangGraph with async execution in workers.
- EV+ calculation is deterministic and must not be delegated to LLM reasoning.
- AI model access goes through `ModelFactoryService`; no direct provider instantiation in domain services.
- Agent runs must persist checkpoints for idempotent retries.
- Cost tracking uses `costUsdMicros` (BigInt micros), not floating-point money.
- `OddSnapshot` is append-only and partitioned by month.
- CASL access for analysis combines jurisdiction, plan tier, league scope, and EV thresholds.
- New analysis versions supersede previous versions via `supersededAt`.

---
name: add-agent-tool
description: Add a new typed agent tool in services/worker with Zod-validated inputs, explicit outputs, telemetry persistence, and guardrails whenever a graph node needs deterministic side effects beyond pure LLM reasoning.
---

Use anytime a planner node needs deterministic side-effects (retrieve odds snapshots, hydrate injury reports, enqueue downstream jobs).

### Module layout blueprint

```plaintext
services/worker/src/tools/<tool-slug>/
  <tool-slug>.module.ts
  <tool-slug>.service.ts       # exposes executeTool(...)
  <tool-slug>.types.ts         # zod wrappers + inferred TS types
  index.ts                     # factories consumed by AgentsModule aggregates
```

### Engineering rules

| Concern | Policy |
| --- | --- |
| Input validation | `z.strictObject(...)` wrappers with explicit enums + transforms |
| Output typing | Declared branded interfaces for downstream graph state reducers |
| External IO | Respect provider abstraction tokens (`SportsDataProvider`, `OddsProvider`, etc.) |
| Timeouts | Default 10s HTTP plus two bounded retries unless ADR dictates otherwise |
| Telemetry | Persist `ToolCall` row with durations, vendor metadata, sanitized payload hash |
| Error handling | Classify transient vs fatal; bubble structured error codes consumed by supervisors |

Never embed plaintext secrets or user PII in persisted telemetry JSON blobs; redact or hash payloads first.

### Guardrail expectations

Sensitive tools (PII-heavy, jurisdiction governed) must funnel through centralized guard wrappers that enforce:

```typescript
await guardRails.assertScopes({
  userId,
  jurisdictions,
  leagues,
});
```

If guard fails, annotate `ToolCall.errorMessage`, surface retry guidance to supervisors, and avoid partial writes inconsistent with SOC2 logging policy.

### Registration loop

1. Export `provideToolSlugDefinition()` helper from `index.ts`.
2. Import module into `tools.module.ts` aggregator.
3. Update LangGraph blueprint JSON snapshot stored with `AgentVersion`.
4. Add vitest suites covering validation failures, deterministic success, provider outage simulation.

### Checklist gate

| Task | Completed |
| --- | --- |
| Zod schema hardened with `.strict()` semantics | mandatory |
| `ToolCall` logger writes sanitized metadata | mandatory |
| DI tokens registered uniquely | mandatory |
| Unit tests referencing fixtures | mandatory |
| Graph metadata references new tool semver | coordinated |

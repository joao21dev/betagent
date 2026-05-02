---
name: add-langgraph-agent
description: Register a new LangGraph-backed analyst in services/worker with mandatory Postgres checkpointing, deterministic idempotency keys, and persisted run telemetry whenever you ship a new automated match analysis pipeline.
---

Apply when onboarding a novel automated analyst persona that writes `Analysis` rows from BullMQ payloads.

### Target layout

```plaintext
services/worker/src/agents/<agent-name>/
  <agent-name>.module.ts          # declares providers scoped to AgentsModule imports
  <agent-name>.service.ts        # exposes run(), resume(), cancel()
  <agent-name>.prompt.ts         # deterministic prompt versioning metadata
  <agent-name>.schema.ts         # zod/json-schema contracts for prompts + tool IO
  tools/ optional per-tool collaborators
  <agent-name>.spec.ts           # integration harness with mocked LLM + prisma
```

### Mandatory architecture pillars

1. Acquire chat/completions exclusively through injected `ModelFactoryService` wrappers; forbid `new OpenAI(...)` sprinkled in services.
2. Execute graphs inside asynchronous Bull processors (never synchronous HTTP hops) with bounded parallelism per queue policy.
3. Persist graph lifecycle into `analysis_runs`: status transitions, checkpoints, hashed idempotency key, timestamps, aggregates for token usage rows.
4. Emit structured logs per node plus tool boundary; escalate failures with correlation ids referencing run ids.
5. When EV math executes, tunnel odds snapshots through deterministic services already covered by QA fixtures.

### Checkpoint plus idempotency recipe

```typescript
const idempotencySeed = `${matchId}:${agentVersionId}:${triggerReason}`;
const idempotencyKey = deterministicHashHex(idempotencySeed);

await prisma.analysisRun.upsert({
  where: { idempotencyKey },
  create: {
    matchId,
    agentVersionId,
    idempotencyKey,
    // ...
  },
  update: {},
});

const graphRunner = orchestrator.compile(graph, {
  checkpointer,
});

await graphRunner.invoke(initialState, { configurable: { thread_id: idempotencyKey } });
```

- Mandatory Postgres-backed LangGraph checkpointer for resume semantics.
- On duplicate enqueue, reuse existing checkpoints instead of restarting LLM spend.

### Streaming expectations

Prefer `await graph.streamEvents({ version: "v2", ...configuration })`. Pipe deltas through reusable stream helpers bridging worker processes to SSE/WebSocket gateways without leaking vendor-specific SDK objects.

### Checklist prior to rollout

| Item | Requirement |
| --- | --- |
| Module wired into `AgentsModule` import graph | yes |
| `ModelFactoryService` dependency graph validated | yes |
| `AnalysisRun`, `AgentStep`, `ToolCall`, `token_usage_daily` writes implemented | yes |
| Idempotent job id aligns with hashed key | documented |
| Unit tests mocking LLM + Prisma interplay | minimally happy + failure propagation |
| Telemetry dashboards updated or ticket referenced | tracked |

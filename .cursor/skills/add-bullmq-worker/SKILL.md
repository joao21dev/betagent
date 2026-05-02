---
name: add-bullmq-worker
description: Create BullMQ queues, typed producers, workers, and repeatable schedulers with retries and idempotent job IDs whenever services/ingest or services/worker gains a new async workflow.
---

Reference when shipping async workflows that hydrate sports data or publish analyses downstream.

### Target layout template

```plaintext
services/<service>/src/queues/<queue-slug>/
  <queue-slug>.constants.ts     # names, concurrency defaults, backoff constants
  <queue-slug>.types.ts         # payload envelopes + branded job ids when needed
  <queue-slug>.producer.ts      # only artifact allowed to invoke queue.add(...)
  <queue-slug>.worker.ts        # instantiates Processor with DI hookups
  <queue-slug>.module.ts        # binds Redis connection tokens + lifecycle hooks
```

### Naming playbook

| Kind | Guidance |
| --- | --- |
| Queue identifiers | ASCII kebab-case (`match-analysis`, `lineup-refresh`) |
| Job constants | `SCREAMING_SNAKE_CASE` mirroring backlog domain (`MATCH_ANALYSIS_JOB`) |
| Producer verbs | Reflect intent (`enqueueMatchAnalysis`, `scheduleOddsSweep`) |
| Deterministic IDs | Compose stable strings such as `analysis:${matchId}:${agentVersion}` |

### Operational defaults baseline

```typescript
const defaultJobOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: true,
  removeOnFail: false,
};
```

Adjust per SLA but document deviations with ADRs.

### Reliability doctrines

| Rule | Requirement |
| --- | --- |
| Producer exclusivity | Services never call `.add` directly; depend on injected producer classes |
| Idempotency surfaces | Mandatory hashed job ids whenever double-enqueue threatens wallet spend |
| Scheduler alignment | Repeated jobs MUST use BullMQ `upsertJobScheduler`; never rely solely on Nest `@Cron` without matching dedupe safeguards |
| Logging | Structured JSON events at enqueue, pickup, retry, exhaustion |
| Poison handling | Persist failure payloads referencing `hypothesis.graded` or manual ops queue |

### Module wiring checklist

1. Constants centralized for observability exporters.
2. Worker registers concurrency metrics + graceful shutdown flushing Redis connections.
3. Integration tests verifying producer dedupe collisions.
4. Feature flags/environment toggles enumerated in queue module constructors.

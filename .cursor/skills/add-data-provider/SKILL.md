---
name: add-data-provider
description: Implement a new SportsDataProvider or OddsProvider behind packages/domain contracts with mapping, retries, timeouts, and DataSourceRun logging whenever ingest integrates a new upstream vendor.
---

Leverage anytime a new SaaS/API vendor supplies sports statistics or wagering lines.

### Contract ownership

Declare abstract interfaces strictly inside:

```plaintext
packages/domain/src/providers/<contract>.provider.ts     # typings + factories
packages/domain/src/providers/index.ts                   # aggregated exports if needed
```

Every ingest service binds concrete implementations exclusively through Nest DI tokens (e.g. `SPORTS_DATA_PROVIDER`, `ODDS_PROVIDER`). Environment selectors choose active vendor without hard-coded branch logic scattered between modules.

### Target implementation folder

```plaintext
services/ingest/src/providers/<vendor-slug>/
  <vendor-slug>.module.ts
  <vendor-slug>.service.ts           # fulfills interface contract methods
  <vendor-slug>.types.ts             # mirrors vendor JSON verbatim
  <vendor-slug>.mapper.ts            # deterministic transforms → domain primitives
```

### Implementation guidelines

| Layer | Requirement |
| --- | --- |
| HTTP wrappers | Axios/fetch wrappers with timeouts and retry policies encapsulated per request |
| DTO fidelity | Persist raw payloads only when SOC2 dictates; otherwise store hashed canonical JSON |
| Domain mapping | `mapper.ts` returns typed records ready for Prisma adapters + queue fanout |
| Audit trail | Upsert `DataSourceRun` with provider string, ingest mode, durations, sampled payload stats |
| Error taxonomy | Normalize vendor codes into enums so alerts route consistently |

Avoid referencing Prisma enums directly inside mapper helpers; dependency direction flows mapper -> dto -> prisma writer service.

### Testing matrix expectations

| Test | Purpose |
| --- | --- |
| Mapper golden tests | Exhaust happy + weird vendor combinations |
| Service retry simulations | Validates exponential backoff interplay |
| HTTP stub integration | Validates timeout boundaries |
| Observability asserts | Ensures metadata columns populated |

### Checklist gate

| Item | Status |
| --- | --- |
| Interface registration via dynamic module | done |
| Environment flag documented (.env.sample) | done |
| Mapper isolates casing differences | enforced |
| `DataSourceRun` rows inserted per batch | verified |
| Playbook referencing incident response escalation | optionally linked |

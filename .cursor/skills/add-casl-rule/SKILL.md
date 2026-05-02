---
name: add-casl-rule
description: Extend CASL abilities, subject typing, and rule factories in services/api plus tests and cache invalidation hooks whenever GraphQL fields change authorization for wagering data or subscriptions.
---

Engage whenever new GraphQL fields require authorization nuance spanning jurisdictions, wagering compliance, subscriber tiers.

### Typical files to touch

| Path | Responsibility |
| --- | --- |
| `services/api/src/core/casl/ability/ability.types.ts` | Subject unions, action enums, contextual fields referencing Prisma enums |
| `services/api/src/core/casl/ability/ability.factory.ts` | Imports subject-specific factories in deterministic order |
| `services/api/src/core/casl/ability/rules/<subject>.rules.ts` | Dedicated builder returning rule tuples |
| `services/api/src/core/casl/subject/<subject>-subject-resolver.ts` | Hydrates relational rows when rule compares nested columns |
| `services/api/src/core/casl/__tests__/rules/<subject>.rules.spec.ts` | Matrix tests for privileged vs constrained actors |

Never embed Prisma imports directly inside unrelated subject rules; hydrate via injected resolvers honoring RO-RO style parameter objects.

### Required implementation steps sequence

1. Extend ability typing with narrowed literal unions for subjects plus conditional fields (`allowedJurisdictions`, EV thresholds).
2. Author `build<Subject>Rules` returning pure synchronous factories receiving context snapshot objects.
3. Register builder inside `AbilityFactory` aggregator before integration tests regenerate snapshots.
4. Add subject resolver if rule inspects hydrated relations such as nested `analysis.match.leagueId`.
5. Update GraphQL decorators (`@Policies`, field guards) aligning with CASL exposures.
6. Ensure subscription upgrade/downgrade mutations call `caslContextService.invalidateUser(userId)` afterward.

### BetAgent wagering rule template

Treat `Analysis` reads as deterministic joins of:

1. Publication state: deny when `supersededAt` is non-null unless the resolver explicitly exposes history.
2. Jurisdiction envelopes: intersect `analysis.allowedJurisdictions` with the viewer profile; empty arrays mean globally visible.
3. Subscription tier lattice: derive `viewerTierRank` versus `analysis.minPlanTier` using the same ordinal mapping as billing provisioning.
4. League entitlements: `analysis.match.leagueId` MUST appear inside `subscriptionPlan.allowedLeagueIds`; treat empty entitlement arrays as "all leagues unlocked".
5. EV visibility: iterate each attached `ValueHypothesis`, comparing `hypothesis.evPercent` against plan threshold `plan.minEvPercentToShow`; fail closed when a hypothesis falls below thresholds while still flagged for disclosure.

Compose these predicates as pure synchronous functions injected into CASL factories so snapshots remain unit-test deterministic.

Adjust predicate signatures when loaders batch nested relations but keep business logic centralized to avoid divergence between resolver field guards versus list queries.

### Cache invalidation policy

TTL cached ability contexts (~60 seconds) invalidate immediately after mutations toggling CASL-bearing fields (roles, leagues, quotas). Tests must recreate stale-cache scenarios asserting GraphQL denies until refresh completes.

### Checklist confirmation

| Blocker audit | Requirement |
| --- | --- |
| Rule file wired into factory | Mandatory |
| Subject resolver guarded from N+1 | Covered |
| Test matrix referencing admin/jurisdiction edges | Passed |
| Invalidation hooked + documented | Mandatory |
| Product/legal copy references updated alongside rule text | Coordinate |

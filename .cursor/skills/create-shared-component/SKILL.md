---
name: create-shared-component
description: Pick the correct workspace package (or apps/web folder) for a new React UI building block before you write JSX, so primitives stay in @repo/ui and shared business UI stays in @repo/components.
---

Consult this checklist each time UX demands a new JSX tree that might be reusable.

### Placement decision tree

1. Straight shadcn primitive reuse or stylistic shim only -> extend `@repo/ui`.
2. Business-specific widget consumed by multiple flows but still purely presentational -> `@repo/components`.
3. Stateful logic reused across dashboards (hooks + UI) -> colocate hooks under `@repo/components/hooks/` (or sibling package if scope explodes later).
4. Feature-only widget tied to routing metadata or App Router quirks -> host under `apps/web/widgets/` or `apps/web/shared/` based on cohesion with pages.

BetAgent presently ships **only `apps/web`**, so defer hypothetical `apps/admin` guidance until additional surfaces exist.

### Package responsibility matrix

| Area | Add bespoke UI here? | Notes |
| --- | --- | --- |
| `@repo/ui` | Only primitives | Mirrors shadcn registry; forbids fetching data or reaching GraphQL hooks. |
| `@repo/components` | Yes | Domain compositions (cards, timelines, wagering summaries). Accept props only. |
| `@repo/core` | No JSX except tiny providers/icons | Holds hooks/utilities bridging auth + Apollo wrappers. |
| `apps/web/widgets/` | Feature-level glue | Imports `@repo/graphql` hooks; avoids leaking into packages when single-app specific. |
| `apps/web/shared/` | Cross-route helpers | Mirrors design tokens/layout shells when not worth promoting yet. |

### `@repo/components` directory expectations

```plaintext
components/<Name>/index.tsx       # default export boundary
layouts/<DashboardShell>/...
widgets/<FeaturedAnalysisCard>/...
hooks/useAnalysisFilters.ts       # optionally colocated helpers
```

### Authoring checklist

1. Confirm final destination using the matrix before coding.
2. Keep `@repo/ui` free of Apollo imports.
3. Co-locate Storybook stubs only if infra exists; otherwise provide minimal usage doc block above component exports.
4. Export via package entry wildcards declared in `@repo/components/package.json` `exports`.
5. Enforce props typing strictly; forbid implicit untyped spreads from remote JSON.

### Recommended import patterns

| Consumer | Imports |
| --- | --- |
| App route | `@repo/components/widgets/MatchBrief` |
| App route primitives | `@repo/ui/button`, `@repo/ui/card` |
| Component needing auth token | Props passed from `@repo/core/session` wrappers |

Merge blockers if someone tries to circumvent boundaries (e.g. GraphQL hook inside `@repo/ui`).

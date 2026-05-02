---
name: create-graphql-operation
description: Add new GraphQL queries, mutations, or subscriptions to apps/web by authoring domain-scoped .gql files under packages/graphql and running npm run codegen whenever the API schema changes.
---

Use when shipping new Apollo operations (queries, mutations, subscriptions) referencing `services/api`.

### Canonical structure

Organize authored documents per domain:

```plaintext
packages/graphql/src/match/
  match.gql         # handwritten
  match.g.ts        # generated (never edit manually)
packages/graphql/src/analysis/
  analysis.gql
  analysis.g.ts
```

Each domain owns exactly one handwritten `.gql` plus codegen output sibling.

### Operational flow

#### Step 1: author fragments first

Fragments capture reused selection sets and keep components tree-shakable.

```graphql
fragment AnalysisCore on Analysis {
  id
  confidence
  publishedAt
}

fragment AnalysisRelations on Analysis {
  ...AnalysisCore
  match {
    id
    kickoffAt
  }
}
```

#### Step 2: declare operations referencing fragments

```graphql
query GetAnalysis($id: ID!) {
  analysis(id: $id) {
    ...AnalysisRelations
  }
}

query GetAnalyses($input: GetAnalysesArgs!) {
  analyses(input: $input) {
    items {
      ...AnalysisCore
    }
    totalCount
  }
}

mutation PublishAnalysisDraft($input: PublishAnalysisDraftInput!) {
  publishAnalysisDraft(input: $input) {
    id
  }
}

subscription OnAnalysisChanged($analysisId: ID!) {
  analysisChanged(analysisId: $analysisId) {
    id
    supersededAt
  }
}
```

Replace field names once backend exposes final schema version.

#### Step 3: run codegen

Execute `npm run codegen` after saving `.gql` files so `*.g.ts` stays synchronized.

#### Step 4: consume typed hooks inside UI

Imports generally follow:

```tsx
import { useGetAnalysisQuery } from "@repo/graphql/analysis/analysis.g";
import type { AnalysisCoreFragment } from "@repo/graphql/_generated/graphql";
```

Leverage suspense-friendly helpers when migrating to Apollo Client suspense APIs.

### Naming conventions cheat sheet

| Artifact | Naming |
| --- | --- |
| Fragment without joins | `<Entity>PascalCase` suffix `Core`, `Basics`, etc. |
| Fragment with joins | Append `Relations`, `Detailed`, etc. |
| Singleton query | `Get<Entity>` camelCase exported hook uses `useGet<Entity>Query` |
| Paginated listing | plural entity name + descriptive filter suffix |
| Mutations | verb-first (`PublishAnalysisDraft`, `MarkHypothesisVoid`) |

### Operational hygiene

- Prefer colocated suspense boundaries or `ApolloError` fallbacks referencing domain copy decks.
- For pagination feeds, hydrate `fetchMore` with typed variables; forbid stringifying variables manually without Zod validators.
- Reuse fragments via Apollo `useFragment` on nested widgets to avoid accidental overfetching drift.

### Checklist prior to merging

1. Fragments centralized and referenced by queries/mutations.
2. Naming matches table above plus backend schema reality.
3. `npm run codegen` executed locally; regenerated files staged intentionally.
4. Storybook/widget consumers import typed hooks exclusively from `@repo/graphql`.
5. Loading, empty, and error UX paths implemented or ticketed deliberately.

---
name: graphql-module
description: Create or extend NestJS GraphQL modules with Prisma-backed services, class-validator DTOs, CASL checks, and request-scoped dataloaders whenever you add read/write API surface in services/api.
---

Use this playbook whenever you scaffold a CRUD-heavy GraphQL slice inside `services/api`, especially when CASL predicates depend on hydrated domain rows.

### Target layout

Place everything under `services/api/src/<entity>/`:

```plaintext
<entity>/
  <entity>.module.ts
  <entity>.resolver.ts
  <entity>.service.ts
  <entity>.dataloader.ts        # omit when redundant
  dto/
    get-<entities>.args.ts
    get-<entity>.args.ts
    create-<entity>.input.ts
    update-<entity>.input.ts
    <entity>.output.ts
```

### Non negotiable guardrails

- Decorate every `@Field()` with decorators from `class-validator` / `class-transformer`, aligning with the serialized shape (prefer `@Length`, `@Matches`, `@IsEnum`, `@ValidateNested`; only rely on `@IsUUID` when the identifier truly conforms to RFC 4122 strings).
- Resolvers orchestrate CASL assertions then delegate; services encapsulate filtering, paging, transactional writes.
- Incoming DTOs never accept raw Prisma filter operators (`contains`, `_in`, chained OR trees). Normalize into internal builder helpers that emit `Prisma.<Model>WhereInput`.
- Read paths paginate exclusively with `skip` plus `take` (or opaque cursors modeled as typed inputs translated to `(cursor, direction)` predicates).
- Enforce deterministic ordering plus schema-level uniqueness where product rules demand dedupe semantics.

### Resolver pattern sketch

```typescript
@UseGuards(GqlAuthGuard, PoliciesGuard)
@Resolver(() => TeamOutput)
export class TeamResolver {
  constructor(private readonly teams: TeamService, private readonly abilityFactory: AbilityFactory) {}

  @Query(() => TeamPaginatedOutput)
  async getTeams(
    @Args("input") args: GetTeamsArgs,
    @Ctx() ctx: GqlRequestContext,
  ): Promise<TeamPaginatedOutput> {
    const ability = await this.abilityFactory.forUser(ctx.user.id);
    if (!ability.can("read", "Team")) throw new UnauthorizedException();
    return this.teams.findManyPaginated(mapGetTeamsDto(args));
  }
}
```

> Replace concrete types (`TeamOutput`, guards, CASL verbs) per module; omit unnecessary transport stack details after parity with codebase helpers.

Resolver naming remains `getX`, `getXs`, `createX`, `updateX`, `deleteX` for predictable GraphQL ergonomics across clients.

### Service pattern checklist

1. Instantiate Prisma clauses inside services with typed helpers returning `{ items; totalCount }`.
2. Escape textual search payloads before injecting into `contains`/`startsWith`; prefer Prisma parameterized filters.
3. Map sort enums to explicit whitelist tuples (`[{ createdAt: 'desc' }]`) avoiding user-controlled raw strings.
4. Wrap multi-record writes in transactional helpers with event emissions after commits when side effects publish bus messages.

### DataLoader blueprint

```typescript
@Injectable({ scope: Scope.REQUEST })
export class TeamDataLoader implements OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  private readonly loader = new DataLoader<string, TeamOutput>(async (ids) => {
    const uniq = [...new Set(ids)];
    const rows = await this.prisma.team.findMany({ where: { id: { in: uniq } } });
    const table = new Map(rows.map((row) => [row.id, adaptTeam(row)]));
    return ids.map((id) => table.get(id) ?? new Error(`Missing team ${id}`));
  });

  load(id: string) {
    return this.loader.load(id);
  }

  onModuleDestroy() {
    this.loader.clearAll();
  }
}
```

DataLoaders MUST preserve requested ordering. Never leak Prisma models across GraphQL layers without mapping helpers.

### class-validator decorators cheat sheet

| GraphQL scalar | Typical decorators |
| --- | --- |
| ID | Prefer `@Length(24)`, `@Matches(/^[a-z0-9]{24,32}$/)`, or UUID-specific validators when identifiers are standardized |
| optional string | `@IsOptional()`, `@IsString()`, `@MinLength()`, `@MaxLength()` |
| enum | `@IsEnum(EnumType)` plus `@Field(() => EnumType)` |
| int | `@IsInt()`, `@Min()`, `@Max()` |
| boolean | `@IsBoolean()` |
| repeated ids | `@IsArray()`, `@ArrayNotEmpty()`, paired per-id validators (`@Length`, `@Matches`, or `@IsUUID` when warranted) scoped with `{ each: true }` |
| JSON blob inputs | Prefer dedicated nested DTOs with `@ValidateNested()` |

### Closing checklist before merge

1. Resolver contains zero Prisma constructs.
2. Service produces internal `WhereInput` objects guarded by enums + input DTO adapters.
3. Pagination always bounds `take` (`<= 100` unless product states otherwise).
4. Data loaders batch + reorder correctly.
5. CASL matrix updated with fixtures under `services/api/src/core/casl/__tests__`.
6. Unit tests validate happy path plus CASL denies for representative contexts.

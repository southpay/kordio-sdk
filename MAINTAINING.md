# Maintaining this SDK

The SDK wraps 155 operations across two APIs. Nobody is going to keep that in sync by hand, so almost none of it is kept in sync by hand.

## The rule

**The OpenAPI specs in `docs-kordio` are the source of truth.** Types are generated from them. Hand-written code is only the thin ergonomic layer on top, and CI fails the moment that layer falls behind the specs.

```
docs-kordio/{ledger,agents}/api-reference/openapi.yaml
        │  bun run sync
        ▼
specs/{ledger,control}.openapi.yaml          vendored, committed
        │  bun run generate
        ▼
src/{ledger,control}/generated.ts            10k lines, committed, never edited
        │  type aliases
        ▼
src/{ledger,control}/types.ts                Account, Transaction, Budget, Decision, …
        │  used by
        ▼
src/*/resources/*.ts                         hand-written, ~1 line of transport per method
```

## The everyday loop

Someone changed an API. To pick it up:

```bash
bun run sync        # copy the specs out of docs-kordio (or --from-url)
bun run generate    # regenerate src/*/generated.ts
bun run verify      # generated-freshness, coverage, typecheck, tests, lint, build
```

`bun run verify` is the whole gate. Run it before you push; CI runs the same thing.

If `sync` reports changes, commit the vendored specs and the regenerated types together with whatever SDK code the change required. The vendored copies exist so the package builds without the docs repo checked out — CI, a fresh clone, and `npm publish` all work standalone.

By default `sync` reads a sibling `../docs-kordio` checkout. Point it elsewhere with `KORDIO_DOCS_REPO=/path/to/docs-kordio`, or pull the published specs with `bun run sync --from-url`.

## The two guards

Generated code that nobody regenerates is worse than no generated code, so both failure modes are checked.

**`bun run check:generated`** regenerates types in memory and fails if they differ from what is committed. You cannot land a spec change and forget to regenerate.

**`bun run check:coverage`** parses both specs, then parses the SDK source for the paths it actually calls, and fails on any operation no method reaches. When someone adds an endpoint to a spec, this is what tells you. Every exception is explicit and lives in `scripts/check-coverage.ts`:

- `INTENTIONALLY_UNWRAPPED` — operations that should not have a method, each with a reason. `DELETE /v1/transactions/{id}` is a documented `405` because the ledger is append-only; `POST /oauth/token` is handled inside the auth provider.
- `COVERED_BY` — operations served by a method whose path is built dynamically, so the static scan cannot see it (the shared `ApprovalQueue`, the cosign calls). Each entry names the class and method that serves it, **and the checker verifies that symbol still exists**. Rename the method and the build fails rather than the exemption quietly becoming a lie.

Both lists are small on purpose. If either starts growing, that is the signal to change the code rather than the list.

## What is hand-written, and why

Generated clients are unpleasant to use, so the resource layer is written by hand. It should stay boring — a method is a path, a body, and a return type. Ergonomics that are worth hand-writing:

- **Signed amounts.** `amount: -1200` becomes `{ amount: '1200', direction: 'credit' }`. Callers think in signed deltas; the API wants magnitude plus direction.
- **Big amounts.** Ledger amounts are `numeric(38,0)`. Floats are rejected, unsafe integers are rejected, `bigint` and decimal strings pass through. An 18-decimal token amount must never round-trip through a JS `Number`.
- **Balance before the round trip.** Postings are checked per currency client-side, so an unbalanced write fails with a message naming the currency instead of a `422`.
- **Decisions are not exceptions.** `POST /v1/agent/actions` answers `201`, `202` or `403` and all three are answers. `actions.authorize()` returns a discriminated union on `outcome`. Only genuine failures throw. Getting this wrong — letting a denial surface as a caught exception — is the single easiest way to build an agent that treats "no" as "retry".
- **Two control clients.** An agent key and an identity token are deliberately not interchangeable. `KordioAgent` and `KordioWorkspace` are separate classes so the type system carries that boundary instead of a comment.
- **Idempotency keys are required, not generated.** The ledger's contract is that a key returns the same transaction forever. Generating one per call would make internal retries safe and cross-process retries meaningless, so the SDK asks for one and says why.

Everything else is a pass-through. Resist adding cleverness that has to be maintained per endpoint.

## Casing, and why responses are snake_case

Requests accept camelCase for modelled fields. Responses are returned exactly as the API sends them.

A deep camelCase↔snake_case converter was considered and rejected. Response types come straight from the generated types, so a rewriting pass would need its own hand-maintained type transform and — worse — would have to know which objects are free-form maps whose keys are caller data. `metadata`, `tags`, `detail`, `headroom` and `by_currency` all have user-controlled keys. Rewriting `metadata.order_id` to `metadata.orderId` silently corrupts data. The exception list to avoid that is exactly the per-endpoint maintenance burden this design exists to avoid.

## Adding an endpoint

1. `bun run sync && bun run generate`.
2. `bun run check:coverage` — it names the new operation.
3. Add the method to the matching resource class. Copy the nearest neighbour; it will be about six lines.
4. Add a test asserting the method, path, and body that go over the wire. `test/helpers.ts` has the mock server.
5. `bun run verify`.

## Releasing

`prepublishOnly` runs `verify`, so a broken build cannot be published.

```bash
npm version <patch|minor|major>
npm publish --access public
git push --follow-tags
```

Bump `SDK_VERSION` in `src/core/http.ts` alongside the package version — it is the `User-Agent` the API sees, and it is how a bad release gets identified in server logs.

## Adding another language

The generation step is the only language-specific piece. `specs/` is the contract; point another generator at the same vendored files. Keep the ergonomic decisions above identical across languages — especially decisions-are-not-exceptions and required idempotency keys — because they are product behaviour, not TypeScript conveniences.

## Known spec drift

Worth fixing in `docs-kordio`, currently worked around here:

- The spend control spec still calls a budget a `Session`: schema `Session`/`SessionEnvelope`, operation ids `createSession`/`getSession`. The paths are already `/v1/agent/budgets` and the fields are `budget_cents`, `remaining_cents`, `parent_budget_id`. The SDK exposes `Budget` and aliases it to `Schemas['Session']`. When the spec is renamed, change the alias in `src/control/types.ts`; nothing else moves.
- Ledger list responses reference a generic `List` schema with no item type, so list item types are supplied by hand in the resource methods rather than generated. Giving each list endpoint a typed `data` array in the spec would let those come from the generator too.
- Most control schemas declare no `required` fields, so every property in `src/control/generated.ts` is optional and callers write `budget.id ?? ''`. The ledger spec marks required fields properly (`Account`, `Transaction`, `Balance`), and its generated types are correspondingly sharper. Adding `required` to the control schemas would remove a lot of `??` from user code without touching a line of SDK source.
- The ledger spec has no `operationId` anywhere; the control spec has 72. Not load-bearing here, but any generator that keys off operation ids will only work for one of the two.

## Examples are compile-checked

`examples/usage.ts` mirrors every snippet in the README and is included in `tsconfig.json`, so `bun run typecheck` fails if a README example stops compiling. It caught a `within_policy` field that does not exist on `ApprovalImpact` before the first commit. When you change the README, change the example with it.

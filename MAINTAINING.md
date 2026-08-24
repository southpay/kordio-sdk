# Maintaining this SDK

The SDK wraps 155 operations across two APIs. Keeping that in sync by hand is not realistic, so most of it is not kept in sync by hand.

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
src/{ledger,control}/types.ts                Account, Transaction, Budget, Decision, ...
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

If `sync` reports changes, commit the vendored specs and the regenerated types together with whatever SDK code the change required. The vendored copies exist so the package builds without the docs repo checked out, which is what makes CI, a fresh clone and `npm publish` work standalone.

By default `sync` reads a sibling `../docs-kordio` checkout. Point it elsewhere with `KORDIO_DOCS_REPO=/path/to/docs-kordio`, or pull the published specs with `bun run sync --from-url`.

## The two guards

Generated code goes stale quietly, so both failure modes are checked.

**`bun run check:generated`** regenerates types in memory and fails if they differ from what is committed. You cannot land a spec change and forget to regenerate.

**`bun run check:coverage`** parses both specs, then parses the SDK source for the paths it actually calls, and fails on any operation no method reaches. When someone adds an endpoint to a spec, this is what tells you. Every exception is explicit and lives in `scripts/check-coverage.ts`:

`INTENTIONALLY_UNWRAPPED` lists operations that should not have a method, each with a reason. `DELETE /ledger/v1/transactions/{id}` is a documented `405` because the ledger is append-only. `POST /oauth/token` is handled inside the auth provider.

`COVERED_BY` lists operations served by a method whose path is built dynamically, so the static scan cannot see it. The shared `ApprovalQueue` and the cosign calls are the two cases. Each entry names the class and method that serves it, and the checker confirms that symbol still exists, so renaming the method fails the build instead of leaving a stale exemption behind.

Both lists are small on purpose. If either starts growing, that is the signal to change the code rather than the list.

## What is hand-written, and why

Generated clients are unpleasant to use, so the resource layer is written by hand. It should stay boring. A method is a path, a body and a return type. The ergonomics worth hand-writing:

- **Signed amounts.** `amount: -1200` becomes `{ amount: '1200', direction: 'credit' }`. Callers think in signed deltas; the API wants magnitude plus direction.
- **Big amounts.** Ledger amounts are `numeric(38,0)`. Floats are rejected, unsafe integers are rejected, `bigint` and decimal strings pass through. An 18-decimal token amount must never round-trip through a JS `Number`.
- **Balance before the round trip.** Postings are checked per currency client-side, so an unbalanced write fails with a message naming the currency instead of a `422`.
- **Decisions are not exceptions.** `POST /control/v1/agent/actions` answers `201`, `202` or `403` and all three are answers. `actions.authorize()` returns a discriminated union on `outcome`, and only genuine failures throw. If a denial surfaces as a caught exception, whoever wrote the catch block will eventually retry into it.
- **Two control clients.** An agent key and an identity token are deliberately not interchangeable. `KordioAgent` and `KordioWorkspace` are separate classes so the type system carries that boundary instead of a comment.
- **Idempotency keys are required, not generated.** The ledger's contract is that a key returns the same transaction forever. Generating one per call would make internal retries safe and cross-process retries meaningless, so the SDK asks for one and says why.

Everything else is a pass-through. Resist adding cleverness that has to be maintained per endpoint.

## Casing, and why responses are snake_case

Requests accept camelCase for modelled fields. Responses are returned exactly as the API sends them.

A deep camelCase↔snake_case converter was considered and rejected. Response types come straight from the generated types, so a rewriting pass would need its own hand-maintained type transform. It would also have to know which objects are free-form maps whose keys are caller data. `metadata`, `tags`, `detail`, `headroom` and `by_currency` all have user-controlled keys. Rewriting `metadata.order_id` to `metadata.orderId` silently corrupts data. The exception list to avoid that is exactly the per-endpoint maintenance burden this design exists to avoid.

## Adding an endpoint

1. `bun run sync && bun run generate`.
2. Run `bun run check:coverage`. It names the new operation.
3. Add the method to the matching resource class. Copy the nearest neighbour; it will be about six lines.
4. Add a test asserting the method, path, and body that go over the wire. `test/helpers.ts` has the mock server.
5. `bun run verify`.

## Live validation catches what the specs cannot

`bun run verify` proves the SDK is self-consistent. It cannot prove the SDK matches the running API, because both are checked against the same spec, and the spec can be wrong or the code can misread it.

`bun run validate:live` closes that gap by exercising a real ledger. Run it before any release. The first time it ran it found four defects that every static check had passed:

- `transactions.lookup` was sending `idempotency_key`; the endpoint takes a required `rail`/`kind`/`value` tuple. The spec said so plainly and the method had been written from a guess.
- `accounts.statement` was typed as a page of postings; it returns a single `account_statement` object with opening and closing balances.
- `accounts.create` demanded `overdraft_policy` because openapi-typescript treats a property with a `default` as always present. That holds for responses but not for request bodies. Fixed globally with `defaultNonNullable: false` in `scripts/generate.ts`.
- The OAuth token endpoint lives at the host root while the ledger sits under `/api`, so the token URL is resolved with `new URL('/oauth/token', baseUrl)` rather than by concatenation. That also keeps working if a caller points `baseUrl` at a gateway path.

None of those are visible to `check:coverage`, which only asks whether some method calls a path, not whether it calls it correctly. Coverage tells you something is missing. Only the live run tells you the parts you did write are right.

## Releasing

`prepublishOnly` runs `verify`, so a broken build cannot be published.

```bash
npm version <patch|minor|major>
npm publish --access public
git push --follow-tags
```

Bump `SDK_VERSION` in `src/core/http.ts` alongside the package version. It is the `User-Agent` the API sees, which is how a bad release gets identified in server logs.

## Adding another language

The generation step is the only language-specific piece. `specs/` is the contract; point another generator at the same vendored files. Keep the ergonomic decisions above identical across languages, particularly decisions-are-not-exceptions and required idempotency keys. Those are product behaviour rather than TypeScript conveniences.

## Known spec drift

Worth fixing in `docs-kordio`, currently worked around here:

- The spend control spec still calls a budget a `Session`: schema `Session`/`SessionEnvelope`, operation ids `createSession`/`getSession`. The paths are already `/control/v1/agent/budgets` and the fields are `budget_cents`, `remaining_cents`, `parent_budget_id`. The SDK exposes `Budget` and aliases it to `Schemas['Session']`. When the spec is renamed, change the alias in `src/control/types.ts`; nothing else moves.
- Ledger list responses reference a generic `List` schema with no item type, so list item types are supplied by hand in the resource methods rather than generated. Giving each list endpoint a typed `data` array in the spec would let those come from the generator too.
- Most control schemas declare no `required` fields, so every property in `src/control/generated.ts` is optional and callers write `budget.id ?? ''`. The ledger spec marks required fields properly (`Account`, `Transaction`, `Balance`), and its generated types are correspondingly sharper. Adding `required` to the control schemas would remove a lot of `??` from user code without touching a line of SDK source.
- `GET /v1/accounts?kind=` accepts `standard | reserve`, but the `account_kind` field it filters on is `standard | restricted`, so the documented filter value `reserve` matches no field value. The SDK carries both: `AccountKindFilter` for the query and `AccountKind` for the field. One of the two enums is wrong upstream.
- `BillingOverview.plan` is a bare `string` while `POST /billing/checkout` enumerates `sandbox | build | growth | scale | enterprise`. The request is typed as `BillingPlan`; the response cannot be until the schema declares the enum.
- The ledger spec has no `operationId` anywhere; the control spec has 72. Not load-bearing here, but any generator that keys off operation ids will only work for one of the two.

## Examples are compile-checked

Everything in `examples/` is included in `tsconfig.json`, so `bun run typecheck` fails if an example stops compiling. That has already caught two real defects: a `within_policy` field that does not exist on `ApprovalImpact`, and a `strategy: 'amount_and_time'` that the reconciliation endpoint would have rejected at runtime. Examples import through the `@kordio/sdk` path alias so they read exactly as a user's code would. When you change the README, change the examples with it.

## Spec enums belong in the type system

Where the spec declares a string enum, the SDK surfaces a union rather than `string`: `ReconciliationStrategy`, `ExportResource`, `ExternalTransactionStatus`, `WebhookDeliveryStatus`, `AgentStatus`, `IntentState`, `BillingPlan` and the rest. `test/types.test.ts` pins them with `@ts-expect-error` assertions, so loosening one back to `string` fails the build rather than silently removing a guard rail.

Two deliberate exceptions. Genuinely open sets stay open: source `kind` has a documented default and no enum, and ledger event types use `KnownLedgerEventType | (string & {})` so editors autocomplete the known ones without rejecting an event the API adds later. Do not turn those into closed unions.

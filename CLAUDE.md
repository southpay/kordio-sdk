# Kordio SDK

TypeScript client for two APIs: the ledger (`KordioLedger`) and spend control
(`KordioAgent`, `KordioWorkspace`, `KordioCosign`). Published as `@kordio/sdk`.

Read [MAINTAINING.md](./MAINTAINING.md) before changing how the build works. The
short version: the OpenAPI specs are the source of truth, `src/*/generated.ts`
is generated and must never be hand-edited, and `bun run verify` is the gate.

## Code style

This is a public SDK. Code must be robust at runtime, have clear public APIs,
and fail predictably. Do not confuse SDK quality with excessive abstraction or
defensive boilerplate.

Write like an experienced library engineer maintaining a real SDK, not like an
AI generating a "production-grade" example.

### Core principles

- Public APIs must be predictable and safe to call.
- Validate runtime input at public boundaries, especially where TypeScript
  cannot protect a JavaScript caller.
- Keep internal code simple and trust established invariants.
- Prefer explicit domain concepts over generic abstractions.
- Preserve backwards compatibility and API stability.
- Match existing conventions here before introducing a new pattern.
- Prefer boring, obvious implementations over clever ones.
- Do not optimise for how complete or enterprise-grade the code looks.

### Avoid AI-looking code

Do not add complexity to make code appear robust. Avoid:

- Defensive checks after validation has already happened
- The same validation repeated across internal functions
- Extremely verbose error messages
- Tiny helpers with no semantic value
- Abstractions for hypothetical future use
- Generic utility layers around simple operations
- Types that merely rename an obvious structure
- Comments explaining self-evident code
- JSDoc repeating the function signature
- Long functional pipelines where a loop is clearer
- Options with no current consumer
- Enterprise patterns without an actual requirement

The SDK is robust because it has clear contracts, not because every function
handles every imaginable scenario.

### Public API versus internal code

Public functions, classes, types and exported utilities should have stable
intentional names, validate untrusted runtime input, produce consistent errors,
behave predictably at the edges, avoid surprising coercion, and stay backwards
compatible.

Once data has crossed a public boundary, trust it. Do not re-validate the same
conditions, do not wrap every operation in a guard, keep helpers direct.

### What this looks like here

`transactions.create` validates at the boundary: it normalises postings, checks
they balance per currency, and requires an idempotency key. `normalizePostings`
then trusts what it was given. There is no second balance check downstream.

Errors name the fix and stop: `postings do not balance per currency (EUR: debit
100 vs credit 99)`. Not a paragraph.

`compact` and `isoDate` exist because dropping undefined keys and formatting
dates happen in almost every resource method. A helper used twice is usually
not worth naming.

## No comments

No inline comments, block comments, docstrings or JSDoc anywhere in this repo.
Naming and structure carry the meaning. The only exceptions are directives that
change tool behaviour: `biome-ignore`, `@ts-expect-error`.

## Types come from the spec

Where the spec declares a string enum, expose a union, never `string`.
`test/types.test.ts` pins these with `@ts-expect-error`. Genuinely open sets
stay open: source `kind`, and ledger event types via
`KnownLedgerEventType | (string & {})`.

Response shapes are the API's own, in snake_case, straight from the generated
types. Requests take camelCase for the fields the SDK models. Do not add a
casing conversion layer; `metadata`, `tags`, `detail` and `headroom` have
caller-controlled keys that a rewriting pass would corrupt.

## Before you push

`bun run verify` covers generated-type freshness, endpoint coverage, typecheck,
tests, Biome and the build.

`bun run validate:live` runs against a real ledger and is the only thing that
catches spec-versus-reality drift. It writes data, so point it at a test-mode
ledger. Run it when you touch request or response shapes.

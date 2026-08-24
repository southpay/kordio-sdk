# Contributing

## Getting set up

```bash
bun install
bun run verify
```

`verify` is the whole gate: generated-type freshness, endpoint coverage,
typecheck, tests, Biome, and the build. CI runs the same command, so if it
passes locally it passes in CI.

## The one rule that matters

The OpenAPI specs are the source of truth and `src/*/generated.ts` is written by
a generator. Never edit a generated file. If the API changed:

```bash
bun run sync        # pull the specs from ../docs-kordio, or --from-url
bun run generate    # regenerate the types
bun run verify
```

Commit the updated `specs/` and `src/*/generated.ts` together with whatever
resource code the change required. [MAINTAINING.md](./MAINTAINING.md) explains
why the build is set up this way and what the two guard scripts protect.

## Adding an endpoint

1. Sync and regenerate.
2. Run `bun run check:coverage`. It names any operation no method reaches.
3. Add the method to the matching resource class, copying its nearest neighbour.
4. Add a test asserting the method, path, and body that go over the wire.
   `test/helpers.ts` has a mock server for this.
5. Run `bun run verify`.

## Style

Biome handles formatting and linting. Run `bun run format` before pushing, or
let `bun run verify` tell you.

This codebase has no comments by design. Names and structure carry the meaning.
The exceptions are tool directives such as `biome-ignore`. If a piece of code
needs a comment to be understood, that is usually a sign the code should change.

## Tests

Unit tests run against a mock server and are the fast loop. They assert the
exact HTTP method, path, headers, and body a call produces, because that is the
contract that breaks silently.

`bun run validate:live` runs the SDK against a real ledger and is the slow loop.
It needs credentials and it writes real data, so point it at a test-mode ledger.
Run it before a release. It has caught defects that every static check passed.

## Pull requests

Keep the change and its tests in one PR. If you change behaviour, say what
breaks. If you change the README, update `examples/` to match, since the
examples are typechecked and will fail the build if they drift.

# Changelog

All notable changes to this package are documented here. This project follows
[semantic versioning](https://semver.org/).

## Unreleased

Spec enums are now unions rather than `string`, so an invalid value fails to
compile instead of failing at the API. Where the generated types already carry
the enum the union is derived from them, so it cannot drift.

Removed three options that had no consumer and no test: `onToken` and
`expirySkewSeconds` on `OAuthAuthProvider`, and the unused `Query` and `Body`
type helpers. Implement `AuthProvider` if you need to control token caching.

## 0.1.2

Fixed: every ledger call reached a path the API does not serve. The client
addressed `https://api.kordio.io/v1/...` while the ledger is mounted under
`/api/v1`, so all 33 ledger operations returned 404. Control was unaffected.

The tests asserted the broken paths, which is why the bug shipped. They now
assert the paths production answers on, and one test pins the default base URL
so a prefix change cannot pass silently again.

The paths are generated from the ledger OpenAPI spec, which carried the same
fault: its local server included the `/api` prefix while its production server
did not, so the spec resolved correctly against localhost and never against
production. The spec was corrected first and the client regenerated from it.

## 0.1.1

No functional change. Republished so the tarball carries a provenance
attestation, which 0.1.0 could not have: the first publish had to be done by
hand, and provenance requires an OIDC token only CI can mint.

## 0.1.0

Initial release. Covers all 155 operations across the Kordio ledger and spend
control APIs.

- `KordioLedger` with OAuth client-credentials auth, token caching, and refresh
  on rejection.
- `KordioAgent`, `KordioWorkspace`, and `KordioCosign` for spend control, split
  by credential so the three cannot be mixed up.
- Signed posting amounts, validated to balance per currency before the request
  is sent. `bigint` and decimal-string amounts; floats and unsafe integers are
  rejected rather than truncated.
- Authorization decisions returned as a discriminated union. A `403` denial is a
  result, not a thrown error.
- Cursor and `starting_after` pagination behind one auto-paginating `Page`.
- Typed error hierarchy carrying `status`, `code`, `hint`, and `request_id`.
- Retries with backoff and jitter on rate limits and 5xx, restricted to reads
  and to writes carrying an idempotency key.
- Webhook signature verification with replay tolerance, shared by both APIs.

# Changelog

All notable changes to this package are documented here. This project follows
[semantic versioning](https://semver.org/).

## 0.5.0

Breaking. The ledger API is now served by kordio-api with TigerBeetle as its
balance engine, and several ledger surfaces were dropped upstream. The SDK
follows the spec.

Removed:

- `reserves` (`sweep`, `release`, `claw`) and `reports.reservesOutstanding`,
  `reports.fundSegregation`.
- `sources`, `reconciliationRuns`, `externalTransactions` and
  `postings.reconcile`.
- `webhookEndpoints` and `webhookDeliveries` on `KordioLedger`. Ledger events
  are delivered by workspace webhooks; register them with
  `KordioWorkspace#webhookEndpoints`. `events.list` and `events.get` remain.
- `exports` and `KordioLedger#health`.
- Types for the above, plus `AccountKindFilter`, `ReconciliationStrategy`,
  `ExternalTransactionStatus`, `WebhookDeliveryStatus`, `ExportResource` and
  `ExportFormat`. `accounts.list({ kind })` takes `AccountKind`
  (`standard | restricted`); the old `reserve` value matched nothing.

Changed:

- `transactions.create` takes `externalRefs` and `conditions`. `externalRef`
  and `bookingDate` are gone; the API never read them.
- `transactions.bulk` returns `{ atomic, partial_failure, results }` as the API
  does, and accepts `atomic` and a per-item `valueDate`.
- `transactions.commit` no longer requires an idempotency key.
- `accounts.categoryBalance` returns a `CategoryBalance`.
- `reports.balanceSheet`, `incomeStatement` and `cashFlow` no longer send
  `currency`, which the API ignores. The period reports take `granularity`.

Added: `accounts.close` and `transactions.refunds`, and `accounts.update`
accepts every field the API lets you change. Also added: transaction list filters (`account`, `currency`, `status`, `reversed`,
`valueDateFrom`, `valueDateTo`, `includeTotal`), account list filters
(`parentId`, `ledgerableType`, `ledgerableId`), `force` on period closes,
`description` and `archived_at` on ledgers, and the `ExternalRef`,
`TransactionCondition`, `TransactionStatus`, `ReportGranularity` and
`ReportBucket` types.

## 0.1.2

Fixes a broken base path. The ledger is served under `/api/v1` in production,
not `/v1`, so every ledger call in 0.1.0 and 0.1.1 returned a 404. Spend
control is unaffected: it is served at `/v1` and always was. If you are on an
earlier version, upgrade. There is no workaround on 0.1.x below this.

For local development `KORDIO_BASE_URL` is now `http://localhost:4000`, without
the `/api` suffix, since the prefix has moved into the paths.

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

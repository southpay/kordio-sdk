# Security policy

## Reporting a vulnerability

Email tech@southpay.io. Do not open a public issue for anything that could be
used against a live ledger or a production agent.

Include what you found, how to reproduce it, and what an attacker could do with
it. We will acknowledge within two business days and keep you updated until the
issue is closed. If you would like credit in the release notes, say so.

## Scope

This repository is a client library. Vulnerabilities in the Kordio APIs
themselves also go to tech@southpay.io, but say which one you mean.

Things we consider security issues in this SDK:

- Credentials leaking into logs, error messages, or thrown objects.
- Webhook signature verification accepting a payload it should reject.
- Retry logic replaying a write that carries no idempotency key.
- Cosignature verification returning `valid: true` on a signature that does not verify.

## Handling credentials

Three credential types reach this library and none of them are interchangeable.

An OAuth client secret (`sk_live_...`, `sk_test_...`) mints ledger tokens. An
agent key (`krt_live_...`, `krt_test_...`) authorizes agent actions. An identity
token manages a workspace. All three belong in environment variables or a secret
manager, never in source control and never in a browser bundle.

The SDK never logs credentials. Error objects carry the request method, path,
status, and `request_id`, but not request headers. If you serialize a
`KordioError` into your own logs, that is safe.

## Test and live modes

An OAuth client is registered as either `test` or `live` and the mode is encoded
in the token, so a test credential cannot reach live data. Every response
carries a `livemode` boolean. When running the live validation script, point it
at a test-mode credential; it writes real transactions.

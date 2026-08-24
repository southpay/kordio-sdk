# Examples

Every file here is typechecked as part of `bun run verify`, so none of them can
drift from the SDK. Most read configuration from the environment:

```bash
export KORDIO_CLIENT_ID=... KORDIO_CLIENT_SECRET=... KORDIO_LEDGER_ID=...
export KORDIO_AGENT_KEY=krt_test_...
export KORDIO_DASHBOARD_TOKEN=... KORDIO_WORKSPACE=your-workspace
export KORDIO_BASE_URL=http://localhost:4000/api   # omit for production
```

Run one with `bun examples/01-ledger-basics.ts`. The scripts that write data are
marked below; point those at a test-mode ledger.

## Ledger

**[01-ledger-basics.ts](./01-ledger-basics.ts)** (writes) walks the whole loop:
open three accounts, capture a payment across them, read the balance, replay the
same idempotency key to prove it returns the original transaction, then reverse
it and watch the balance return to zero.

**[02-marketplace-payout.ts](./02-marketplace-payout.ts)** is a realistic
multi-party flow. Capture splits gross into what the seller is owed and what the
platform keeps, payouts drain a seller balance, partial refunds claw back a
proportional share of the fee, and a month-end check reads the balance sheet and
asserts every currency has a zero residual.

**[07-reconciliation.ts](./07-reconciliation.ts)** (writes) registers a custody
source, ingests external transactions, runs a matching pass, and resolves what
did not match by hand.

## Spend control

**[03-agent-spend.ts](./03-agent-spend.ts)** (writes) is the shortest useful
agent loop. Open a run budget, ask for authorization before spending, branch on
all three outcomes, and report the result so the reservation is released. It
deliberately attempts one purchase that policy should refuse.

**[04-agent-procurement.ts](./04-agent-procurement.ts)** is the fuller version.
It simulates several quotes to find which ones policy would allow before
committing to any, mints a spend token pinned to the chosen vendor, authorizes
the payment against that token, and verifies the cosignature in the settlement
worker before money moves.

**[05-approval-console.ts](./05-approval-console.ts)** is the human side. It
walks the queue of intents a rule held for review, reads the impact of each, and
approves or denies against a desk limit.

## Both

**[06-webhook-server.ts](./06-webhook-server.ts)** is a small Bun server that
verifies deliveries from either API with one routine, rejects replays outside the
tolerance window, and dedupes by event id before doing any work.

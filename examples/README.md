# Examples

These are typechecked as part of `bun run verify`, so they cannot drift from the
SDK. They read configuration from the environment:

```bash
export KORDIO_CLIENT_ID=... KORDIO_CLIENT_SECRET=... KORDIO_LEDGER_ID=...
export KORDIO_AGENT_KEY=krt_test_...
export KORDIO_DASHBOARD_TOKEN=... KORDIO_WORKSPACE=your-workspace
export KORDIO_BASE_URL=http://localhost:4000/api   # omit for production
```

Run one with `bun examples/record-a-sale.ts`. Several of them write real data.
Point those at a test-mode ledger.

| File | What it does | Writes |
| --- | --- | --- |
| [record-a-sale.ts](./record-a-sale.ts) | Opens three accounts, books one sale across them, reads what the roaster is owed. The smallest useful thing. | yes |
| [marketplace.ts](./marketplace.ts) | Capture, proportional partial refund, per-seller payout, and a month-end check that throws if any currency fails to close. Written as a module an app imports. | yes |
| [agent-restock.ts](./agent-restock.ts) | An agent works a shortage list: asks the control layer before each purchase, books the allowed ones in the ledger, and reports each outcome so the reservation is released. Uses both APIs. | yes |
| [agent-procurement.ts](./agent-procurement.ts) | Simulates every quote to find which ones policy would allow before committing, mints a spend token pinned to the winner, and verifies the cosignature in the settlement path. | yes |
| [approvals.ts](./approvals.ts) | Works the review queue against a desk limit and a trusted-vendor list, denying anything far over and leaving the judgement calls for a person. | yes |
| [webhooks.ts](./webhooks.ts) | A Bun server that verifies deliveries from both APIs with one routine, dedupes by event id, and returns 500 on a handler error so Kordio retries. | no |
| [reconcile-custody.ts](./reconcile-custody.ts) | Ingests custody deposits, runs a windowed match, then resolves the leftovers by looking each one up by its chain reference. | yes |

`agent-restock.ts` is the one to read if you only read one. It is the whole
point of the two APIs together: the control layer decides, the ledger records,
and nothing moves without both.

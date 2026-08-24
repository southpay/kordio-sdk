# @kordio/sdk

TypeScript SDK for the two Kordio APIs:

`KordioLedger` talks to the ledger, a double-entry book you call over HTTP.

`KordioAgent` and `KordioWorkspace` talk to spend control, which decides whether an AI agent may take an action before it takes it and signs the answer.

The two APIs share a host and very little else. Their credentials, response envelopes and pagination all differ, so this package gives each one its own client rather than one object that can reach both.

```bash
npm install @kordio/sdk
```

Runs on Node 18+, Bun, Deno, Cloudflare Workers and browsers. There are no runtime dependencies; it uses `fetch` and Web Crypto.

---

## Ledger

```ts
import { KordioLedger } from '@kordio/sdk/ledger'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
})
```

The SDK mints an OAuth token from those credentials, caches it, and refreshes it when it expires or is rejected. Pass `accessToken` instead if you mint tokens yourself. With no options it reads `KORDIO_CLIENT_ID`, `KORDIO_CLIENT_SECRET`, `KORDIO_TOKEN` and `KORDIO_LEDGER_ID` from the environment.

Set `ledgerId` even though it is optional. The server resolves the ledger from the token's `ledger_id` claim, then the `X-Ledger-Id` header the SDK sends for you, and if it gets neither it falls back to the default ledger for the token's mode. A client credential registered as `test` can only ever reach test ledgers, so that fallback cannot cross into live data, but on a tenant with several test ledgers it will quietly pick one for you. `kordio.ledgers.list()` shows which ones exist.

### Writing a transaction

```ts
await kordio.transactions.create({
  idempotencyKey: `order:${order.id}:debit`,
  postings: [
    { accountId: acc(order.customerId), amount: -amountCents, currency: 'EUR' },
    { accountId: acc('merchant_payable'), amount: amountCents, currency: 'EUR' },
  ],
  metadata: { orderId: order.id },
})
```

Positive is a debit, negative is a credit. The SDK converts signed amounts into the `direction` plus positive-magnitude shape the API expects, and checks that the postings balance per currency before spending a round trip. If you prefer the wire form, write it directly. Both are accepted:

```ts
postings: [
  { account: 'cash:usd', amount: '10000000', currency: 'USDC', direction: 'debit' },
  { account: 'revenue:fees', amount: '10000000', currency: 'USDC', direction: 'credit' },
]
```

Amounts take a `bigint`, a safe integer, or a decimal string of minor units. Floats are rejected rather than silently truncated. So are values past `Number.MAX_SAFE_INTEGER`, unless you pass them as a `bigint` or a string, which is what keeps an 18-decimal token amount from losing precision on the way out.

`idempotencyKey` is required on writes and is yours to choose. The same key returns the same transaction forever, so make it derive from the thing you are recording (`order:4471:capture`), not from a random per-attempt value.

Validate without writing:

```ts
const check = await kordio.transactions.dryRun({ postings })
```

### Balances

```ts
const balance = await kordio.balances.get(acc(account.id))
```

`kordio.accounts.balance(id)` is the same call if you prefer the shape to mirror the URL, and `kordio.balances.category(id)` rolls up an account's whole category.

Balances come back as decimal strings in `posted`, `pending` and `available`. Parse them with `BigInt`, never `Number`:

```ts
import { formatMinorUnits } from '@kordio/sdk'

const available = BigInt(balance.available)
formatMinorUnits(available, 6)
```

A balance is signed by the account's **natural balance**, not by debit-minus-credit. Debiting an asset and crediting a liability both read positive. An asset with a negative balance is overdrawn; a liability with a negative balance has been overpaid.

To find a transaction you may have already booked from an external event, look it up by its reference tuple. All three parts are required:

```ts
const existing = await kordio.transactions.lookup({
  rail: 'ethereum',
  kind: 'tx_hash',
  value: '0xabc123...',
})
```

### Statements

`accounts.statement(id)` returns the auditor's view of one account: an opening balance, every posting in the period ordered by value date, then a closing balance. It is a single object rather than a paginated list.

```ts
const statement = await kordio.accounts.statement('cash:usd', {
  from: new Date('2026-04-01'),
  to: new Date('2026-05-01'),
})

statement.opening_balance.posted
statement.entries.length
statement.truncated
```

### Lists

Every list returns a `Page` that paginates itself when you iterate it:

```ts
for await (const tx of await kordio.transactions.list({ metadata: { orderId: '4471' } })) {
  console.log(tx.id)
}
```

Or take one page at a time with `page.data`, `page.hasMore`, `page.nextPage()`, or stop early with `page.toArray({ limit: 100 })`.

### The rest

`accounts`, `balances`, `transactions`, `postings`, `reserves`, `events`, `reports`, `sources`, `reconciliationRuns`, `externalTransactions`, `periodCloses`, `accountTemplates`, `exports`, `webhookEndpoints`, `webhookDeliveries`, `oauthClients`, `ledgers`, `organizations`.

---

## Spend control

Two credentials that are deliberately not interchangeable, so two clients.

### The agent

An agent key (`krt_live_...`) asks for authorization. It can never write policy.

```ts
import { KordioAgent } from '@kordio/sdk/control'

const kordio = new KordioAgent({ agentKey: process.env.KORDIO_AGENT_KEY })

const budget = await kordio.budgets.create({ budgetCents: 50_000, currency: 'USD' })

const decision = await kordio.actions.authorize({
  budgetId: budget.id,
  actionType: 'payment.create',
  resource: 'acme-supplies.example',
  costCents: 12_000,
  idempotencyKey: `order-${order.id}-attempt-1`,
})
```

A denial is a result, not an exception. The API answers `201`, `202` or `403`, and all three are real answers, so the SDK returns a discriminated union instead of throwing on the refusal:

```ts
switch (decision.outcome) {
  case 'allowed':
    await settle(order, decision.cosignature)
    await kordio.actions.complete(decision.intent.id)
    break
  case 'requires_approval':
    await parkForReview(decision.intent.id)
    break
  case 'denied':
    await pickCheaperVendor(decision.rule, decision.headroom)
    break
}
```

Genuine failures still throw. A bad key, a rate limit and a server error are all exceptions.

`decision.headroom` is what is left on every limit that applied. Give it to your agent: one that knows it has $380 left picks a cheaper vendor; one that only knows it was refused retries into the same wall.

If you would rather have an exception, `assertAllowed(decision)` narrows the union and throws `KordioDeniedError` otherwise.

Reporting the outcome is not optional. An intent left pending holds its budget until the budget closes, so call `actions.complete(id)` or `actions.fail(id, { reason })` once you know.

Also on the agent client: `spendTokens.create(...)` to mint a single-use ceiling, and `paymentIntents.authorize(...)` for payments. Note the asymmetry the API documents: payment intents carry their idempotency key in the body, actions carry it in a header. The SDK takes `idempotencyKey` in both cases and puts it where it belongs.

### The workspace

An identity token manages agents, policy, approvals and members. It can never authorize an action as an agent.

```ts
import { KordioWorkspace } from '@kordio/sdk/control'

const workspace = new KordioWorkspace({
  token: process.env.KORDIO_DASHBOARD_TOKEN,
  workspace: process.env.KORDIO_WORKSPACE,
})

const held = await workspace.actionIntents.list({ state: 'requires_approval' })

for await (const intent of held) {
  const impact = await workspace.actionIntents.impact(intent.id)

  if ((impact.amount_cents ?? 0) <= 25_000) {
    await workspace.actionIntents.approve(intent.id)
  } else {
    await workspace.actionIntents.deny(intent.id, { reason: 'above the desk limit' })
  }
}
```

Every path is scoped to the workspace slug for you. Resources: `agents`, `policies`, `policyModules`, `actionIntents`, `paymentIntents`, `budgets`, `spendTokens`, `funds`, `auditEvents`, `webhookEndpoints`, `members`, `invitations`, `billing`, `workspaces`.

### Cosignatures

Verification needs no credential, so it has its own client:

```ts
import { KordioCosign } from '@kordio/sdk/control'

const check = await new KordioCosign().consume({
  authorization: request.headers.get('authorization'),
  consumedBy: 'settlement-worker',
})

if (!check.valid) throw new Error(`refusing to settle: ${check.reason}`)
```

---

## Webhooks

One routine verifies deliveries from either API.

```ts
import { constructWebhookEvent } from '@kordio/sdk'

const event = await constructWebhookEvent({
  payload: await request.text(),
  header: request.headers.get('Kordio-Signature'),
  secret: process.env.KORDIO_WEBHOOK_SECRET,
})
```

Verify against the **raw** body, not a re-serialized object. Deliveries older than five minutes are rejected as replays; pass `toleranceSeconds: 0` to disable that for replay tooling, or an array of secrets to accept both during a rotation.

---

## Errors

Every failure is a `KordioError` carrying `status`, `code`, `message`, `hint`, `requestId`, and the `method` and `path` that produced it.

```ts
import { KordioRateLimitError, KordioUnbalancedError } from '@kordio/sdk'

try {
  await kordio.transactions.create({ ... })
} catch (error) {
  if (error instanceof KordioUnbalancedError) console.error(error.byCurrency)
  if (error instanceof KordioRateLimitError) console.error(error.retryAfterSeconds)
}
```

Subclasses: `KordioAuthenticationError`, `KordioPermissionError`, `KordioNotFoundError`, `KordioConflictError`, `KordioValidationError`, `KordioUnbalancedError`, `KordioIdempotencyConflictError`, `KordioRateLimitError`, `KordioServerError`, `KordioConnectionError`, `KordioTimeoutError`.

Rate limits and 5xx responses are retried with exponential backoff and jitter, honouring `Retry-After`. Only reads and writes carrying an idempotency key are ever retried; a write without one is sent exactly once. A rejected token is refreshed and the call retried once.

Tune with `timeoutMs` and `maxRetries` on the client or per call, and cancel with a standard `AbortSignal`.

---

## Escape hatch

Anything the typed surface does not cover:

```ts
const response = await kordio.request('POST', '/v1/some/new/endpoint', {
  body: { ... },
  idempotencyKey: 'k',
})
response.status
response.requestId
response.rateLimit.remaining
```

---

## Casing

Requests take camelCase for the fields the SDK models (`idempotencyKey`, `accountId`, `budgetId`, `costCents`). **Responses are returned exactly as the API sends them, in snake_case.** That is deliberate: response types are generated from the OpenAPI specs, so they cannot drift from the API, and no key-rewriting pass can corrupt free-form `metadata`, `tags`, `detail` or `headroom` maps whose keys are your data.

## Validating against a real API

Unit tests run against a mock. To check the SDK against a live ledger:

```bash
export KORDIO_CLIENT_ID=... KORDIO_CLIENT_SECRET=...
export KORDIO_BASE_URL=http://localhost:4000/api   # omit for production
bun run validate:live
```

It creates throwaway accounts, writes and reverses a transaction, ingests external transactions for a reconciliation pass, and asserts the balances land where double-entry says they should. Point it at a **test-mode** ledger; it writes real data. Set `KORDIO_AGENT_KEY` to also exercise budgets and authorization decisions, and `KORDIO_LEDGER_ID` to pin the ledger instead of letting it pick the first test-mode one.

## Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](./CONTRIBUTING.md) has
the setup, and `bun run verify` is the whole gate. Security reports go to
security@kordio.io rather than the issue tracker; see
[SECURITY.md](./SECURITY.md).

MIT licensed.

## Maintaining

See [MAINTAINING.md](./MAINTAINING.md). Short version: the OpenAPI specs are the source of truth, types are generated from them, and CI fails if the generated types are stale or if an endpoint exists that no SDK method calls.

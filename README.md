# @kordio/sdk

TypeScript SDK for the two Kordio APIs:

- **Ledger** — a double-entry ledger you call over HTTP. `KordioLedger`.
- **Spend control** — decides whether an AI agent may take an action before it takes it, and signs the answer. `KordioAgent` and `KordioWorkspace`.

They share a host and nothing else: different credentials, different envelopes, different pagination. This package gives each one its own client so you cannot accidentally cross the wires.

```bash
npm install @kordio/sdk
```

Node 18+, Bun, Deno, Cloudflare Workers, and browsers. No runtime dependencies — `fetch` and Web Crypto only.

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

The SDK mints an OAuth token from those credentials, caches it, and refreshes it when it expires or is rejected. Pass `accessToken` instead if you mint tokens yourself. With no options it reads `KORDIO_CLIENT_ID` / `KORDIO_CLIENT_SECRET` / `KORDIO_TOKEN` / `KORDIO_LEDGER_ID` from the environment.

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

**Positive is a debit, negative is a credit.** The SDK converts signed amounts into the `direction` + positive-magnitude shape the API expects, and checks the postings balance per currency before spending a round trip. If you prefer the wire form, write it directly — both are accepted:

```ts
postings: [
  { account: 'cash:usd', amount: '10000000', currency: 'USDC', direction: 'debit' },
  { account: 'revenue:fees', amount: '10000000', currency: 'USDC', direction: 'credit' },
]
```

Amounts take a `bigint`, a safe integer, or a decimal string of minor units. Floats are rejected rather than silently truncated, and values past `Number.MAX_SAFE_INTEGER` are rejected unless you pass a `bigint` or string — an 18-decimal token amount will not quietly lose precision.

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

Balances come back as signed decimal strings — `posted`, `pending`, `available`. Parse them with `BigInt`, never `Number`:

```ts
import { formatMinorUnits } from '@kordio/sdk'

const available = BigInt(balance.available)
formatMinorUnits(available, 6)
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

`accounts`, `transactions`, `postings`, `reserves`, `events`, `reports`, `sources`, `reconciliationRuns`, `externalTransactions`, `periodCloses`, `accountTemplates`, `exports`, `webhookEndpoints`, `webhookDeliveries`, `oauthClients`, `ledgers`, `organizations`.

---

## Spend control

Two credentials that are deliberately not interchangeable, so two clients.

### The agent

An agent key (`krt_live_…`) asks for authorization. It can never write policy.

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

**A denial is a result, not an exception.** The API answers `201`, `202` or `403` and all three are real answers, so the SDK returns a discriminated union rather than throwing on the refusal:

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

Genuine failures — a bad key, a rate limit, a server error — still throw.

`decision.headroom` is what is left on every limit that applied. Give it to your agent: one that knows it has $380 left picks a cheaper vendor; one that only knows it was refused retries into the same wall.

If you would rather have an exception, `assertAllowed(decision)` narrows the union and throws `KordioDeniedError` otherwise.

Reporting the outcome is not optional. An intent left pending holds its budget until the budget closes — call `actions.complete(id)` or `actions.fail(id, { reason })`.

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

Rate limits and 5xx are retried with exponential backoff and jitter, honouring `Retry-After`. **Only reads and writes carrying an idempotency key are ever retried** — a write without one is sent exactly once. A rejected token is refreshed and the call retried once.

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

## Maintaining

See [MAINTAINING.md](./MAINTAINING.md). Short version: the OpenAPI specs are the source of truth, types are generated from them, and CI fails if the generated types are stale or if an endpoint exists that no SDK method calls.

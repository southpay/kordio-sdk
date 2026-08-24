import { KordioAgent, KordioCosign, KordioWorkspace } from '../src/control/index'
import {
  constructWebhookEvent,
  formatMinorUnits,
  KordioRateLimitError,
  KordioUnbalancedError,
} from '../src/index'
import { KordioLedger } from '../src/ledger/index'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
})

const acc = (id: string) => `accounts_receivable:${id}`

export async function recordOrder(order: { id: string; customerId: string }, amountCents: number) {
  return await kordio.transactions.create({
    idempotencyKey: `order:${order.id}:debit`,
    postings: [
      { accountId: acc(order.customerId), amount: -amountCents, currency: 'EUR' },
      { accountId: acc('merchant_payable'), amount: amountCents, currency: 'EUR' },
    ],
    metadata: { orderId: order.id },
  })
}

export async function wireFormat() {
  return await kordio.transactions.create({
    idempotencyKey: 'pi_acme_1234_capture',
    postings: [
      { account: 'cash:usd', amount: '10000000', currency: 'USDC', direction: 'debit' },
      {
        account: 'accounts_receivable:acme',
        amount: '9700000',
        currency: 'USDC',
        direction: 'credit',
      },
      { account: 'revenue:subscriptions', amount: '300000', currency: 'USDC', direction: 'credit' },
    ],
  })
}

export async function bigAmounts() {
  return await kordio.transactions.create({
    idempotencyKey: 'eth_settlement_1',
    postings: [
      { account: 'wallet:eth', amount: 10_000000000000000000n, currency: 'ETH' },
      { account: 'revenue:eth', amount: -10_000000000000000000n, currency: 'ETH' },
    ],
  })
}

export async function readBalance(account: { id: string }) {
  const balance = await kordio.balances.get(acc(account.id))
  const available = BigInt(balance.available ?? '0')
  return formatMinorUnits(available, 6)
}

export async function listOrderTransactions(orderId: string) {
  const ids: string[] = []
  for await (const tx of await kordio.transactions.list({ metadata: { orderId } })) {
    if (tx.id) ids.push(tx.id)
  }
  return ids
}

export async function dryRun() {
  return await kordio.transactions.dryRun({
    postings: [
      { account: 'a', amount: 100, currency: 'EUR' },
      { account: 'b', amount: -100, currency: 'EUR' },
    ],
  })
}

const agent = new KordioAgent({ agentKey: process.env.KORDIO_AGENT_KEY })

export async function spend(order: { id: string }) {
  const budget = await agent.budgets.create({ budgetCents: 50_000, currency: 'USD' })

  const decision = await agent.actions.authorize({
    budgetId: budget.id ?? '',
    actionType: 'payment.create',
    resource: 'acme-supplies.example',
    costCents: 12_000,
    idempotencyKey: `order-${order.id}-attempt-1`,
  })

  switch (decision.outcome) {
    case 'allowed':
      await settle(decision.cosignature)
      return await agent.actions.complete(decision.intent.id ?? '')
    case 'requires_approval':
      return await parkForReview(decision.intent.id ?? '')
    case 'denied':
      return pickCheaperVendor(decision.rule, decision.headroom)
  }
}

export async function mintSpendToken(budgetId: string) {
  return await agent.spendTokens.create({
    budgetId,
    amountCeilingCents: 20_000,
    counterparty: 'acme-supplies.example',
  })
}

export async function payWithToken(budgetId: string, spendTokenId: string) {
  return await agent.paymentIntents.authorize({
    budgetId,
    amountCents: 9_900,
    counterparty: 'acme-supplies.example',
    spendTokenId,
    idempotencyKey: 'pay-1',
  })
}

export async function reviewQueue() {
  const workspace = new KordioWorkspace({
    token: process.env.KORDIO_DASHBOARD_TOKEN,
    workspace: process.env.KORDIO_WORKSPACE,
  })

  const held = await workspace.actionIntents.list({ state: 'requires_approval' })

  for await (const intent of held) {
    const impact = await workspace.actionIntents.impact(intent.id ?? '')

    if ((impact.amount_cents ?? 0) <= 25_000) {
      await workspace.actionIntents.approve(intent.id ?? '')
    } else {
      await workspace.actionIntents.deny(intent.id ?? '', { reason: 'above the desk limit' })
    }
  }
}

export async function verifyCosignature(request: Request) {
  const check = await new KordioCosign().consume({
    authorization: request.headers.get('authorization') ?? '',
    consumedBy: 'settlement-worker',
  })

  if (!check.valid) throw new Error(`refusing to settle: ${check.reason}`)
  return check.intent_id
}

export async function handleWebhook(request: Request) {
  return await constructWebhookEvent<{ type: string }>({
    payload: await request.text(),
    header: request.headers.get('Kordio-Signature'),
    secret: process.env.KORDIO_WEBHOOK_SECRET ?? '',
  })
}

export async function typedErrors() {
  try {
    await recordOrder({ id: '1', customerId: 'c' }, 100)
  } catch (error) {
    if (error instanceof KordioUnbalancedError) return error.byCurrency
    if (error instanceof KordioRateLimitError) return error.retryAfterSeconds
    throw error
  }
}

export async function escapeHatch() {
  const response = await kordio.request('POST', '/v1/some/new/endpoint', {
    body: { hello: 'world' },
    idempotencyKey: 'k',
  })
  return [response.status, response.requestId, response.rateLimit.remaining] as const
}

async function settle(_cosignature: string | null): Promise<void> {}
async function parkForReview(_id: string): Promise<void> {}
function pickCheaperVendor(_rule: string | null, _headroom: Record<string, number>): void {}

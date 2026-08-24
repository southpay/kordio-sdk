import { KordioLedger } from '@kordio/sdk'
import { KordioAgent } from '@kordio/sdk/control'

const control = new KordioAgent({
  agentKey: process.env.KORDIO_AGENT_KEY,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const ledger = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const shortages = [
  { sku: 'ETH-YIRGACHEFFE-1KG', vendor: 'moplaco.example', unitCents: 2400, units: 40 },
  { sku: 'COL-HUILA-1KG', vendor: 'pergamino.example', unitCents: 1900, units: 60 },
  { sku: 'KEN-NYERI-1KG', vendor: 'kahawa.example', unitCents: 3100, units: 80 },
]

const run = process.env.RUN_ID ?? 'restock-2026-08'
const budget = await control.budgets.create({ budgetCents: 400_000, currency: 'USD' })

for (const line of shortages) {
  const cost = line.unitCents * line.units

  const decision = await control.actions.authorize({
    budgetId: budget.id ?? '',
    actionType: 'payment.create',
    resource: line.vendor,
    costCents: cost,
    idempotencyKey: `${run}:${line.sku}`,
    metadata: { sku: line.sku, units: line.units },
  })

  if (decision.outcome === 'denied') {
    const left = decision.headroom.session_remaining_cents ?? 0
    console.log(`${line.sku}: refused by ${decision.rule}, ${left} cents left in this run`)
    continue
  }

  if (decision.outcome === 'requires_approval') {
    console.log(`${line.sku}: waiting on a human (${decision.rule})`)
    continue
  }

  const purchase = await ledger.transactions.create({
    idempotencyKey: `${run}:${line.sku}:purchase`,
    metadata: { intent_id: decision.intent.id, sku: line.sku, vendor: line.vendor },
    postings: [
      { accountId: 'expense:green_coffee', amount: cost, currency: 'USD' },
      { accountId: 'payable:vendors', amount: -cost, currency: 'USD' },
    ],
  })

  await control.actions.complete(decision.intent.id ?? '')
  console.log(`${line.sku}: bought ${line.units} units for ${cost} cents, booked as ${purchase.id}`)
}

const spent = await control.budgets.get(budget.id ?? '')
console.log(`run ${run}: spent ${spent.spent_cents} of ${spent.budget_cents} cents`)

import { KordioAgent } from '@kordio/sdk/control'

const kordio = new KordioAgent({
  agentKey: process.env.KORDIO_AGENT_KEY,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const budget = await kordio.budgets.create({ budgetCents: 50_000, currency: 'USD' })
console.log(`run budget ${budget.id}: ${budget.remaining_cents} cents`)

async function buy(vendor: string, cents: number, attempt: number) {
  const decision = await kordio.actions.authorize({
    budgetId: budget.id ?? '',
    actionType: 'payment.create',
    resource: vendor,
    costCents: cents,
    idempotencyKey: `restock-${vendor}-${attempt}`,
    metadata: { category: 'supplies' },
  })

  switch (decision.outcome) {
    case 'allowed': {
      console.log(`${vendor}: allowed, cosignature ${decision.cosignature ? 'issued' : 'absent'}`)
      const settled = await settleOnYourRail(vendor, cents, decision.cosignature)
      if (settled) {
        await kordio.actions.complete(decision.intent.id ?? '')
      } else {
        await kordio.actions.fail(decision.intent.id ?? '', { reason: 'rail declined' })
      }
      return settled
    }

    case 'requires_approval':
      console.log(`${vendor}: held for a human by rule ${decision.rule}`)
      return false

    case 'denied':
      console.log(`${vendor}: denied by ${decision.rule}`, decision.detail)
      console.log(`  headroom left: ${JSON.stringify(decision.headroom)}`)
      return false
  }
}

await buy('acme-supplies.example', 12_000, 1)
await buy('overpriced-vendor.example', 240_000, 1)

const after = await kordio.budgets.get(budget.id ?? '')
console.log(
  `spent ${after.spent_cents}, remaining ${after.remaining_cents}, status ${after.status}`,
)

async function settleOnYourRail(_vendor: string, _cents: number, _cosignature: string | null) {
  return true
}

import { KordioAgent, KordioCosign } from '@kordio/sdk/control'

const agent = new KordioAgent({
  agentKey: process.env.KORDIO_AGENT_KEY,
  baseUrl: process.env.KORDIO_BASE_URL,
})

export interface Quote {
  vendor: string
  cents: number
  leadTimeDays: number
}

export async function chooseAndPay(quotes: Quote[], runId: string) {
  const budget = await agent.budgets.create({ budgetCents: 200_000, currency: 'USD' })

  const viable: Quote[] = []

  for (const quote of quotes) {
    const preview = await agent.actions.simulate({
      budgetId: budget.id ?? '',
      actionType: 'payment.create',
      resource: quote.vendor,
      costCents: quote.cents,
    })

    if (preview.outcome === 'allowed') viable.push(quote)
  }

  if (viable.length === 0) return null

  viable.sort((a, b) => a.cents - b.cents || a.leadTimeDays - b.leadTimeDays)
  const chosen = viable[0]
  if (!chosen) return null

  const token = await agent.spendTokens.create({
    budgetId: budget.id ?? '',
    amountCeilingCents: chosen.cents,
    counterparty: chosen.vendor,
    expiresAt: new Date(Date.now() + 15 * 60_000),
  })

  const payment = await agent.paymentIntents.authorize({
    budgetId: budget.id ?? '',
    amountCents: chosen.cents,
    counterparty: chosen.vendor,
    spendTokenId: token.id,
    idempotencyKey: `procure:${runId}`,
    metadata: { run_id: runId, lead_time_days: chosen.leadTimeDays },
  })

  if (payment.outcome !== 'allowed') {
    return { held: payment.outcome, rule: payment.rule, vendor: chosen.vendor }
  }

  return {
    intentId: payment.intent.id,
    vendor: chosen.vendor,
    cents: chosen.cents,
    authorization: payment.cosignature,
  }
}

export async function settle(authorization: string, moveMoney: (cents: number) => Promise<string>) {
  const cosign = new KordioCosign({ baseUrl: process.env.KORDIO_BASE_URL })
  const check = await cosign.consume({ authorization, consumedBy: 'settlement-worker' })

  if (!check.valid) {
    throw new Error(`refusing to move money: ${check.reason}`)
  }

  const reference = await moveMoney(check.amount_cents ?? 0)

  await agent.paymentIntents.complete(check.intent_id ?? '')

  return { intentId: check.intent_id, reference }
}

export async function abandon(intentId: string, reason: string) {
  return await agent.paymentIntents.fail(intentId, { reason })
}

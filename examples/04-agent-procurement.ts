import { KordioAgent, KordioCosign } from '@kordio/sdk/control'

const agent = new KordioAgent({
  agentKey: process.env.KORDIO_AGENT_KEY,
  baseUrl: process.env.KORDIO_BASE_URL,
})

interface Quote {
  vendor: string
  cents: number
}

export async function procure(quotes: Quote[], runId: string) {
  const budget = await agent.budgets.create({ budgetCents: 200_000, currency: 'USD' })

  const affordable: Quote[] = []

  for (const quote of quotes) {
    const preview = await agent.actions.simulate({
      budgetId: budget.id ?? '',
      actionType: 'payment.create',
      resource: quote.vendor,
      costCents: quote.cents,
    })

    if (preview.outcome === 'allowed') affordable.push(quote)
    else console.log(`skipping ${quote.vendor}: ${preview.outcome} (${preview.rule})`)
  }

  affordable.sort((a, b) => a.cents - b.cents)
  const chosen = affordable[0]
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
    idempotencyKey: `procure-${runId}`,
    metadata: { run_id: runId },
  })

  if (payment.outcome !== 'allowed') {
    console.log(`payment ${payment.outcome} by ${payment.rule}`)
    return null
  }

  const receipt = await payOnChain(chosen, payment.cosignature)

  if (!receipt) {
    await agent.paymentIntents.fail(payment.intent.id ?? '', { reason: 'rail declined' })
    return null
  }

  await agent.paymentIntents.complete(payment.intent.id ?? '')
  return receipt
}

export async function verifyBeforeSettling(authorization: string) {
  const cosign = new KordioCosign({ baseUrl: process.env.KORDIO_BASE_URL })
  const check = await cosign.consume({ authorization, consumedBy: 'settlement-worker' })

  if (!check.valid) {
    throw new Error(`refusing to move money: ${check.reason}`)
  }

  return {
    intentId: check.intent_id,
    amountCents: check.amount_cents,
    counterparty: check.resource,
  }
}

async function payOnChain(_quote: Quote, _cosignature: string | null) {
  return { txHash: '0xdeadbeef' }
}

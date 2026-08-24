import { KordioWorkspace } from '@kordio/sdk/control'

const workspace = new KordioWorkspace({
  token: process.env.KORDIO_DASHBOARD_TOKEN,
  workspace: process.env.KORDIO_WORKSPACE,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const DESK_LIMIT_CENTS = 25_000

const held = await workspace.actionIntents.list({ state: 'requires_approval' })

for await (const intent of held) {
  const impact = await workspace.actionIntents.impact(intent.id ?? '')
  const amount = impact.amount_cents ?? 0

  if (amount <= DESK_LIMIT_CENTS) {
    await workspace.actionIntents.approve(intent.id ?? '')
    console.log(`approved ${intent.id} (${amount} cents, held by ${impact.rule})`)
    continue
  }

  await workspace.actionIntents.deny(intent.id ?? '', {
    reason: `above the ${DESK_LIMIT_CENTS} cent desk limit`,
  })
  console.log(`denied ${intent.id} (${amount} cents)`)
}

const funds = await workspace.funds.get()
console.log('workspace funds:', funds)

for await (const agent of await workspace.agents.list()) {
  console.log(`${agent.name} (${agent.mode}) status=${agent.status}`)
}

const recent = await workspace.auditEvents.list({ limit: 20 })
for (const event of recent.data) {
  console.log(`${event.created_at} ${event.action} on ${event.subject_type} ${event.subject_id}`)
}

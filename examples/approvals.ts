import { KordioWorkspace } from '@kordio/sdk/control'

const workspace = new KordioWorkspace({
  token: process.env.KORDIO_DASHBOARD_TOKEN,
  workspace: process.env.KORDIO_WORKSPACE,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const DESK_LIMIT_CENTS = 25_000
const TRUSTED_VENDORS = new Set(['moplaco.example', 'pergamino.example'])

const held = await workspace.actionIntents.list({ state: 'requires_approval', limit: 50 })

let approved = 0
let denied = 0
let escalated = 0

for await (const intent of held) {
  const id = intent.id ?? ''
  const impact = await workspace.actionIntents.impact(id)
  const amount = impact.amount_cents ?? 0
  const vendor = intent.resource

  if (vendor && TRUSTED_VENDORS.has(vendor) && amount <= DESK_LIMIT_CENTS) {
    await workspace.actionIntents.approve(id)
    approved++
    continue
  }

  if (amount > DESK_LIMIT_CENTS * 10) {
    await workspace.actionIntents.deny(id, {
      reason: `${amount} cents is more than ten times the desk limit, needs a signer`,
    })
    denied++
    continue
  }

  escalated++
  const holds = impact.session?.open_holds ?? 0
  console.log(`${id}  ${vendor ? `${vendor}  ` : ''}${amount} cents  held by ${impact.rule}`)
  if (holds > 0) console.log(`  ${holds} other intents are waiting on the same budget`)
}

console.log(`approved ${approved}, denied ${denied}, left for a person ${escalated}`)

const funds = await workspace.funds.get()
console.log(`committed ${funds.committed_cents}, held ${funds.held_cents}`)

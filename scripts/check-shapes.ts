import YAML from 'yaml'
import { SPECS } from './specs'

interface Probe {
  spec: 'ledger' | 'control'
  path: string
  method: string
  base: string
  headers: Record<string, string>
  body?: unknown
  pick?: (json: any) => unknown
}

const LEDGER = process.env.KORDIO_BASE_URL ?? 'https://api.kordio.io'
const CONTROL = process.env.KORDIO_CONTROL_BASE_URL ?? 'https://api.kordio.io'

function resolve(doc: any, schema: any, seen = 0): any {
  if (!schema || seen > 12) return schema
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()
    return resolve(doc, doc.components.schemas[name], seen + 1)
  }
  if (schema.allOf) {
    const merged: any = { type: 'object', properties: {}, required: [] }
    for (const part of schema.allOf) {
      const r = resolve(doc, part, seen + 1)
      Object.assign(merged.properties, r.properties ?? {})
      merged.required.push(...(r.required ?? []))
    }
    return merged
  }
  return schema
}

function schemaFor(doc: any, path: string, method: string) {
  const op = doc.paths?.[path]?.[method.toLowerCase()]
  if (!op) return null
  const ok = Object.entries<any>(op.responses ?? {}).find(([c]) => c.startsWith('2'))
  const raw = ok?.[1]?.content?.['application/json']?.schema
  if (!raw) return null
  const outer = resolve(doc, raw)
  return outer?.properties?.data ? resolve(doc, outer.properties.data) : outer
}

function compare(label: string, schema: any, value: any, issues: string[]) {
  if (!schema?.properties || typeof value !== 'object' || value === null) return
  const declared = new Set(Object.keys(schema.properties))
  for (const key of Object.keys(value)) {
    if (!declared.has(key) && schema.additionalProperties !== true) {
      issues.push(`${label}: response has "${key}", the spec does not declare it`)
    }
  }
  for (const req of schema.required ?? []) {
    if (!(req in value)) issues.push(`${label}: spec requires "${req}", the response omits it`)
  }
}

const issues: string[] = []
let checked = 0
let skipped = 0

const docs: Record<string, any> = {}
for (const s of SPECS) docs[s.name] = YAML.parse(await Bun.file(s.vendored).text())

async function check(
  spec: 'ledger' | 'control',
  method: string,
  specPath: string,
  url: string,
  init: RequestInit,
): Promise<any> {
  const res = await fetch(url, { method, ...init })
  const json = await res.json().catch(() => null)

  if (!res.ok || !json) {
    issues.push(`${method} ${specPath}: probe returned ${res.status}`)
    return null
  }

  const schema = schemaFor(docs[spec], specPath, method)
  if (!schema) {
    skipped++
    return json.data ?? json
  }

  checked++
  const payload = json.data ?? json
  const rows = Array.isArray(payload) ? payload.slice(0, 1) : [payload]
  for (const row of rows) compare(`${method} ${specPath}`, schema, row, issues)
  return payload
}

const agentKey = process.env.KORDIO_AGENT_KEY
if (agentKey) {
  const h = { authorization: `Bearer ${agentKey}`, 'content-type': 'application/json' }
  const j = (body: unknown) => ({ headers: h, body: JSON.stringify(body) })

  const budget = await check(
    'control',
    'POST',
    '/control/v1/agent/budgets',
    `${CONTROL}/control/v1/agent/budgets`,
    j({ budget_cents: 100_000, currency: 'USD' }),
  )

  if (budget?.id) {
    await check(
      'control',
      'GET',
      '/control/v1/agent/budgets/{id}',
      `${CONTROL}/control/v1/agent/budgets/${budget.id}`,
      { headers: h },
    )

    await check(
      'control',
      'POST',
      '/control/v1/agent/actions/simulate',
      `${CONTROL}/control/v1/agent/actions/simulate`,
      j({ budget_id: budget.id, action_type: 'payment.create', cost_cents: 100 }),
    )

    const token = await check(
      'control',
      'POST',
      '/control/v1/agent/spend_tokens',
      `${CONTROL}/control/v1/agent/spend_tokens`,
      j({ budget_id: budget.id, amount_ceiling_cents: 5_000 }),
    )
    void token

    const stamp = Date.now()
    const action = await check(
      'control',
      'POST',
      '/control/v1/agent/actions',
      `${CONTROL}/control/v1/agent/actions`,
      {
        headers: { ...h, 'idempotency-key': `shape-${stamp}` },
        body: JSON.stringify({
          budget_id: budget.id,
          action_type: 'payment.create',
          cost_cents: 100,
        }),
      },
    )

    if (action?.id) {
      await check(
        'control',
        'GET',
        '/control/v1/agent/actions/{id}',
        `${CONTROL}/control/v1/agent/actions/${action.id}`,
        { headers: h },
      )
      await check(
        'control',
        'POST',
        '/control/v1/agent/actions/{id}/complete',
        `${CONTROL}/control/v1/agent/actions/${action.id}/complete`,
        { headers: h },
      )
    }
  }
}

const clientId = process.env.KORDIO_CLIENT_ID
const clientSecret = process.env.KORDIO_CLIENT_SECRET
if (clientId && clientSecret) {
  const origin = new URL(LEDGER).origin
  const tok = await fetch(`${origin}/oauth/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  }).then((r) => r.json())

  const ledgerId = process.env.KORDIO_LEDGER_ID
  const h: Record<string, string> = {
    authorization: `Bearer ${tok.access_token}`,
    'content-type': 'application/json',
  }
  if (ledgerId) h['x-ledger-id'] = ledgerId

  for (const [p, url] of [
    ['/ledger/v1/accounts', `${LEDGER}/ledger/v1/accounts?limit=1`],
    ['/ledger/v1/transactions', `${LEDGER}/ledger/v1/transactions?limit=1`],
    ['/ledger/v1/events', `${LEDGER}/ledger/v1/events?limit=1`],
    ['/ledger/v1/ledgers', `${LEDGER}/ledger/v1/ledgers?limit=1`],
    ['/ledger/v1/sources', `${LEDGER}/ledger/v1/sources`],
    ['/ledger/v1/organizations/me', `${LEDGER}/ledger/v1/organizations/me`],
    ['/ledger/v1/reports/trial_balance', `${LEDGER}/ledger/v1/reports/trial_balance`],
    ['/ledger/v1/reports/balance_sheet', `${LEDGER}/ledger/v1/reports/balance_sheet`],
    ['/ledger/v1/reports/income_statement', `${LEDGER}/ledger/v1/reports/income_statement`],
    ['/ledger/v1/reports/cash_flow', `${LEDGER}/ledger/v1/reports/cash_flow`],
    ['/ledger/v1/external_transactions', `${LEDGER}/ledger/v1/external_transactions?limit=1`],
  ] as const) {
    await check('ledger', 'GET', p, url, { headers: h })
  }
}

if (checked === 0) {
  console.error('No endpoint could be compared. Set credentials before trusting this:')
  console.error('  ledger : KORDIO_CLIENT_ID, KORDIO_CLIENT_SECRET, KORDIO_LEDGER_ID')
  console.error('  control: KORDIO_AGENT_KEY')
  process.exit(1)
}

console.log(`Endpoints compared: ${checked}`)
console.log(`No schema declared: ${skipped}`)
console.log(`Findings:           ${issues.length}`)
for (const i of issues) console.log(`  ${i}`)
if (issues.length > 0) process.exit(1)
console.log('\nEvery response matches the shape the spec declares.')

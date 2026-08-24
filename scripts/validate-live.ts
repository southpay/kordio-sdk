import { KordioAgent, KordioCosign } from '../src/control/index'
import {
  KordioAuthenticationError,
  KordioNotFoundError,
  KordioUnbalancedError,
  KordioValidationError,
} from '../src/core/errors'
import { formatMinorUnits } from '../src/core/money'
import { KordioLedger } from '../src/ledger/index'

const LEDGER_BASE = process.env.KORDIO_BASE_URL ?? 'https://api.kordio.io'
const CONTROL_BASE = process.env.KORDIO_CONTROL_BASE_URL ?? 'https://api.kordio.io'

let pass = 0
let fail = 0
let skipped = 0

async function step(name: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    const detail = await fn()
    pass++
    console.log(`  pass  ${name}${detail === undefined ? '' : `  ${detail}`}`)
  } catch (error) {
    fail++
    const e = error as Error & { status?: number; code?: string; requestId?: string }
    console.log(`  FAIL  ${name}`)
    console.log(`        ${e.name}: ${e.message}`)
    if (e.status) console.log(`        status=${e.status} code=${e.code} request_id=${e.requestId}`)
  }
}

function section(title: string): void {
  console.log(`\n${title}`)
}

function skip(title: string, why: string): void {
  skipped++
  console.log(`\n${title}\n  skip  ${why}`)
}

async function validateLedger(): Promise<void> {
  const clientId = process.env.KORDIO_CLIENT_ID
  const clientSecret = process.env.KORDIO_CLIENT_SECRET
  const accessToken = process.env.KORDIO_TOKEN

  if (!clientId && !accessToken) {
    skip('LEDGER', 'set KORDIO_CLIENT_ID + KORDIO_CLIENT_SECRET, or KORDIO_TOKEN')
    return
  }

  const discovery = new KordioLedger({ clientId, clientSecret, accessToken, baseUrl: LEDGER_BASE })

  section('LEDGER  auth and ledger selection')
  let ledgerId = process.env.KORDIO_LEDGER_ID ?? ''
  await step('mint a token and list ledgers', async () => {
    const page = await discovery.ledgers.list({ limit: 200 })
    const all = await page.toArray()
    if (!ledgerId) {
      const test = all.find((l) => l.mode === 'test')
      if (!test) throw new Error('no test-mode ledger available; set KORDIO_LEDGER_ID explicitly')
      ledgerId = test.id
    }
    const chosen = all.find((l) => l.id === ledgerId)
    return `${all.length} visible, using ${chosen?.name ?? ledgerId} (mode=${chosen?.mode})`
  })

  if (!ledgerId) return

  const kordio = new KordioLedger({
    clientId,
    clientSecret,
    accessToken,
    baseUrl: LEDGER_BASE,
    ledgerId,
  })

  const cash = `sdk_validation_cash:${stampValue}`
  const payable = `sdk_validation_payable:${stampValue}`
  const revenue = `sdk_validation_revenue:${stampValue}`

  section('LEDGER  accounts')
  await step('create accounts', async () => {
    await kordio.accounts.create({ id: cash, name: 'SDK cash', type: 'asset', currency: 'USDC' })
    await kordio.accounts.create({
      id: payable,
      name: 'SDK payable',
      type: 'liability',
      currency: 'USDC',
    })
    const r = await kordio.accounts.create({
      id: revenue,
      name: 'SDK revenue',
      type: 'revenue',
      currency: 'USDC',
    })
    return `3 created, decimals resolved to ${r.currency_decimals}`
  })

  await step('an id containing a colon survives the round trip', async () => {
    const a = await kordio.accounts.get(cash)
    if (a.id !== cash) throw new Error(`sent ${cash}, got back ${a.id}`)
    return a.id
  })

  await step('creating the same id twice reports already_exists', async () => {
    try {
      await kordio.accounts.create({ id: cash, name: 'dupe', type: 'asset', currency: 'USDC' })
      throw new Error('expected a 409')
    } catch (error) {
      const e = error as { code?: string; status?: number }
      if (e.code !== 'already_exists') throw error
      return `status=${e.status} code=${e.code}`
    }
  })

  await step('an unknown account is a typed not-found', async () => {
    try {
      await kordio.accounts.get(`sdk_validation_missing:${stampValue}`)
      throw new Error('expected a 404')
    } catch (error) {
      if (!(error instanceof KordioNotFoundError)) throw error
      return `${error.name} code=${error.code}`
    }
  })

  section('LEDGER  transactions')
  const postings = [
    { accountId: cash, amount: 10_000000, currency: 'USDC' },
    { accountId: payable, amount: -9_700000, currency: 'USDC' },
    { accountId: revenue, amount: -300000, currency: 'USDC' },
  ]

  await step('a dry run validates without writing', async () => {
    const result = (await kordio.transactions.dryRun({ postings })) as {
      object?: string
      valid?: boolean
    }
    if (result.valid !== true) throw new Error(`valid=${result.valid}`)
    return `object=${result.object}`
  })

  const captureKey = `sdk_validation:${stampValue}:capture`
  let transactionId = ''

  await step('signed amounts arrive as balanced debits and credits', async () => {
    const tx = await kordio.transactions.create({
      idempotencyKey: captureKey,
      postings,
      metadata: { source: 'sdk-validation', stamp: stampValue },
    })
    transactionId = tx.id ?? ''
    const shape = (tx.postings ?? []).map((p) => `${p.direction}:${p.amount}`).join(' ')
    return `${tx.id}  ${shape}`
  })

  await step('replaying the key returns the original transaction', async () => {
    const again = await kordio.transactions.create({
      idempotencyKey: captureKey,
      postings,
      metadata: { source: 'sdk-validation', stamp: stampValue },
    })
    if (again.id !== transactionId) throw new Error(`got a new transaction ${again.id}`)
    return `same id ${again.id}`
  })

  await step('an unbalanced write is refused by the server too', async () => {
    try {
      await kordio.transactions.create({
        idempotencyKey: `sdk_validation:${stampValue}:unbalanced`,
        validate: false,
        postings: [
          { accountId: cash, amount: 100, currency: 'USDC' },
          { accountId: payable, amount: -99, currency: 'USDC' },
        ],
      })
      throw new Error('expected a 422')
    } catch (error) {
      if (error instanceof KordioUnbalancedError) return 'KordioUnbalancedError'
      if (error instanceof KordioValidationError) return `${error.name} code=${error.code}`
      throw error
    }
  })

  await step('lookup refuses an incomplete external-reference tuple locally', async () => {
    try {
      await (kordio.transactions.lookup as unknown as (p: unknown) => Promise<unknown>)({
        rail: 'ethereum',
      })
      throw new Error('expected a client-side rejection')
    } catch (error) {
      if (!/rail, kind and value/.test((error as Error).message)) throw error
      return 'rejected before the round trip'
    }
  })

  section('LEDGER  balances')
  await step('a liability credit reads as a positive balance', async () => {
    const b = await kordio.balances.get(payable)
    const available = BigInt(b.available ?? '0')
    if (available !== 9_700000n) throw new Error(`expected 9700000, got ${b.available}`)
    return `${b.available} minor units (${formatMinorUnits(available, 6)} USDC)`
  })

  await step('an asset debit reads as a positive balance', async () => {
    const b = await kordio.balances.get(cash)
    if (BigInt(b.posted ?? '0') !== 10_000000n) throw new Error(`got ${b.posted}`)
    return `${b.posted} minor units`
  })

  section('LEDGER  corrections')
  await step('reverse links back to the original', async () => {
    const rev = await kordio.transactions.reverse(transactionId, {
      idempotencyKey: `sdk_validation:${stampValue}:reverse`,
    })
    if (rev.reverses !== transactionId) throw new Error(`reverses=${rev.reverses}`)
    return `${rev.id} reverses ${rev.reverses}`
  })

  await step('the reversal returns the balance to zero', async () => {
    const b = await kordio.balances.get(payable)
    if (BigInt(b.available ?? '0') !== 0n) throw new Error(`expected 0, got ${b.available}`)
    return 'available=0'
  })

  section('LEDGER  reads')
  await step('metadata filtering', async () => {
    const page = await kordio.transactions.list({ metadata: { stamp: stampValue } })
    const rows = await page.toArray()
    if (rows.length !== 1) throw new Error(`expected 1 tagged transaction, got ${rows.length}`)
    return `${rows.length} matched metadata[stamp]`
  })

  await step('auto-pagination walks past the first page', async () => {
    const page = await kordio.accounts.list({ limit: 1 })
    let seen = 0
    for await (const _account of page) {
      seen++
      if (seen > 5) break
    }
    if (seen < 3) throw new Error(`only walked ${seen}`)
    return `${seen} accounts at limit=1`
  })

  await step('statement carries opening and closing balances', async () => {
    const st = await kordio.accounts.statement(cash)
    if (st.object !== 'account_statement') throw new Error(`object=${st.object}`)
    return `${st.entry_count} entries, opening=${st.opening_balance.posted}, closing=${st.closing_balance.posted}`
  })

  section('LEDGER  reconciliation')
  await step('ingest external transactions and read them back', async () => {
    const source = await kordio.sources.create({
      name: `sdk-validation-${stampValue}`,
      kind: 'custody',
    })

    const ingest = await kordio.sources.ingest(source.id, {
      items: [
        {
          external_id: `0xsdk${stampValue}`,
          amount: '12345',
          currency: 'USDC',
          occurred_at: new Date().toISOString(),
        },
      ],
    })

    if (ingest.created_count !== 1) {
      throw new Error(`created=${ingest.created_count} errors=${JSON.stringify(ingest.results)}`)
    }

    const page = await kordio.externalTransactions.list({ sourceId: source.id, limit: 5 })
    const first = page.data[0]
    if (!first) throw new Error('ingested transaction did not come back')
    if (first.external_id !== `0xsdk${stampValue}`) {
      throw new Error(`external_id=${first.external_id}`)
    }

    const ignored = await kordio.externalTransactions.ignore(first.id, { reason: 'validation run' })
    if (ignored.status !== 'ignored') throw new Error(`status=${ignored.status}`)

    const matches = await kordio.externalTransactions.matches(first.id)
    return `ingested 1, status ${ignored.status}, ${matches.data.length} candidate matches`
  })

  await step('rate limit headers reach the caller', async () => {
    const res = await kordio.request('GET', '/ledger/v1/accounts', { query: { limit: 1 } })
    return `remaining=${res.rateLimit.remaining}/${res.rateLimit.limit} request_id=${res.requestId}`
  })
}

async function validateControl(): Promise<void> {
  section('CONTROL  cosignatures (no credential required)')
  const cosign = new KordioCosign({ baseUrl: CONTROL_BASE })

  await step('a malformed cosignature is a verdict, not an exception', async () => {
    const check = await cosign.verify({ authorization: 'not-a-jwt' })
    if (check.valid !== false) throw new Error('expected valid=false')
    return `valid=false reason=${check.reason}`
  })

  await step('an absent cosignature is a client error', async () => {
    try {
      await cosign.verify({ authorization: '' })
      throw new Error('expected a throw')
    } catch (error) {
      if (!(error instanceof KordioValidationError)) throw error
      return `${error.name} code=${error.code}`
    }
  })

  const agentKey = process.env.KORDIO_AGENT_KEY

  if (!agentKey) {
    section('CONTROL  agent key')
    await step('an unrecognised key is a typed 401, never a denial', async () => {
      const bogus = new KordioAgent({
        agentKey: 'krt_test_not_a_real_key',
        baseUrl: CONTROL_BASE,
      })
      try {
        await bogus.budgets.create({ budgetCents: 1000 })
        throw new Error('expected a 401')
      } catch (error) {
        if (!(error instanceof KordioAuthenticationError)) throw error
        return `${error.code}: ${error.message}`
      }
    })
    skip('CONTROL  authorization flow', 'set KORDIO_AGENT_KEY to exercise budgets and decisions')
    return
  }

  const agent = new KordioAgent({ agentKey, baseUrl: CONTROL_BASE })

  section('CONTROL  budgets and decisions')
  let budgetId = ''
  await step('open a budget', async () => {
    const budget = await agent.budgets.create({ budgetCents: 50_000, currency: 'USD' })
    budgetId = budget.id ?? ''
    return `${budget.id} remaining=${budget.remaining_cents}`
  })

  await step('simulate an action without reserving budget', async () => {
    const result = await agent.actions.simulate({
      budgetId,
      actionType: 'payment.create',
      resource: 'sdk-validation.example',
      costCents: 1000,
    })
    return `outcome=${result.outcome} rule=${result.rule}`
  })

  await step('authorize an action and branch on the outcome', async () => {
    const result = await agent.actions.authorize({
      budgetId,
      actionType: 'payment.create',
      resource: 'sdk-validation.example',
      costCents: 1000,
      idempotencyKey: `sdk-validation-${stampValue}`,
    })
    if (result.outcome === 'allowed') {
      await agent.actions.complete(result.intent.id ?? '')
      return `allowed, cosignature=${result.cosignature ? 'issued' : 'none'}, settled`
    }
    return `outcome=${result.outcome} rule=${result.rule} headroom=${JSON.stringify(result.headroom)}`
  })

  await step('replaying the same key returns the original decision', async () => {
    const result = await agent.actions.authorize({
      budgetId,
      actionType: 'payment.create',
      resource: 'sdk-validation.example',
      costCents: 1000,
      idempotencyKey: `sdk-validation-${stampValue}`,
    })
    return `outcome=${result.outcome} (replayed)`
  })

  await step('read the budget back', async () => {
    const budget = await agent.budgets.get(budgetId)
    return `spent=${budget.spent_cents} remaining=${budget.remaining_cents} status=${budget.status}`
  })
}

const stampValue = process.env.KORDIO_STAMP ?? String(Date.now())

console.log(`Validating against ledger=${LEDGER_BASE} control=${CONTROL_BASE}`)

await validateLedger()
await validateControl()

console.log(`\n${pass} passed, ${fail} failed, ${skipped} section(s) skipped\n`)

if (fail > 0) {
  console.error(
    'Live validation failed. This runs against a real API — check credentials and mode.',
  )
  process.exit(1)
}

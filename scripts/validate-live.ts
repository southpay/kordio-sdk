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

  section('LEDGER  external references')
  const ref = { rail: 'sdk-validation', kind: 'probe', value: `ref_${stampValue}` }
  let referencedId = ''
  await step('a transaction carries external_refs and lookup finds it', async () => {
    const tx = await kordio.transactions.create({
      idempotencyKey: `sdk_validation:${stampValue}:ref`,
      postings: [
        { accountId: cash, amount: 500, currency: 'USDC' },
        { accountId: payable, amount: -500, currency: 'USDC' },
      ],
      externalRefs: [ref],
    })
    referencedId = tx.id
    const found = await kordio.transactions.lookup(ref)
    if (found.id !== tx.id) throw new Error(`lookup returned ${found.id}, expected ${tx.id}`)
    const attached = found.external_refs?.[0]
    if (attached?.value !== ref.value)
      throw new Error(`external_refs=${JSON.stringify(found.external_refs)}`)
    return `${tx.id} via ${ref.rail}/${ref.kind}`
  })

  await step('the same external ref on a second transaction is refused', async () => {
    try {
      await kordio.transactions.create({
        idempotencyKey: `sdk_validation:${stampValue}:ref-dupe`,
        postings: [
          { accountId: cash, amount: 1, currency: 'USDC' },
          { accountId: payable, amount: -1, currency: 'USDC' },
        ],
        externalRefs: [ref],
      })
      throw new Error('expected a 409')
    } catch (error) {
      const e = error as { code?: string; status?: number }
      if (e.code !== 'duplicate_external_ref') throw error
      return `status=${e.status} code=${e.code}`
    }
  })

  await step('refund books a partial inverse of the original', async () => {
    const refund = await kordio.transactions.refund(referencedId, {
      idempotencyKey: `sdk_validation:${stampValue}:refund`,
      amount: '200',
    })
    if (refund.reverses !== referencedId) throw new Error(`reverses=${refund.reverses}`)
    return `${refund.id} legs=${(refund.postings ?? []).map((p) => `${p.direction}:${p.amount}`).join(' ')}`
  })

  await step('refunds lists the refund against the original', async () => {
    const page = await kordio.transactions.refunds(referencedId)
    if (page.data.length !== 1) throw new Error(`expected 1 refund, got ${page.data.length}`)
    return `${page.data[0]?.id}`
  })

  section('LEDGER  account lifecycle')
  const spare = `sdk_validation_spare:${stampValue}`
  await step('update changes name and classification', async () => {
    await kordio.accounts.create({ id: spare, name: 'SDK spare', type: 'asset', currency: 'USDC' })
    const updated = await kordio.accounts.update(spare, {
      name: 'SDK spare renamed',
      fund_classification: 'operator',
    })
    if (updated.name !== 'SDK spare renamed' || updated.fund_classification !== 'operator') {
      throw new Error(`name=${updated.name} classification=${updated.fund_classification}`)
    }
    return `lock_version=${updated.lock_version}`
  })

  await step('a non-zero account cannot be closed', async () => {
    try {
      await kordio.accounts.close(payable, { closedByLabel: 'sdk-validation' })
      throw new Error('expected a 409')
    } catch (error) {
      const e = error as { code?: string; status?: number }
      if (e.code !== 'account_balance_nonzero') throw error
      return `status=${e.status} code=${e.code}`
    }
  })

  await step('a zero-balance account closes, idempotently, and rejects postings', async () => {
    const closed = await kordio.accounts.close(spare, { closedByLabel: 'sdk-validation' })
    if (closed.status !== 'closed') throw new Error(`status=${closed.status}`)
    const again = await kordio.accounts.close(spare, { closedByLabel: 'someone-else' })
    if (again.closed_by_label !== 'sdk-validation') throw new Error('re-close changed the record')
    try {
      await kordio.transactions.create({
        idempotencyKey: `sdk_validation:${stampValue}:closed`,
        postings: [
          { accountId: spare, amount: 1, currency: 'USDC' },
          { accountId: payable, amount: -1, currency: 'USDC' },
        ],
      })
      throw new Error('expected account_closed')
    } catch (error) {
      const e = error as { code?: string }
      if (e.code !== 'account_closed') throw error
    }
    return `closed_at=${closed.closed_at}`
  })

  section('LEDGER  pending holds and overdraft policy')
  const wallet = `sdk_validation_wallet:${stampValue}`
  const funding = `sdk_validation_funding:${stampValue}`
  await step('create a no-overdraft liability and its funding asset', async () => {
    await kordio.accounts.create({
      id: wallet,
      name: 'SDK wallet',
      type: 'liability',
      currency: 'USDC',
      overdraft_policy: 'none',
    })
    await kordio.accounts.create({
      id: funding,
      name: 'SDK funding',
      type: 'asset',
      currency: 'USDC',
    })
    return 'overdraft_policy=none'
  })

  let inflowId = ''
  await step('a pending inflow does not count toward available funds', async () => {
    const inflow = await kordio.transactions.create({
      idempotencyKey: `sdk_validation:${stampValue}:pending-in`,
      postings: [
        { accountId: funding, amount: 1000, currency: 'USDC', pending: true },
        { accountId: wallet, amount: -1000, currency: 'USDC', pending: true },
      ],
    })
    inflowId = inflow.id
    const b = await kordio.balances.get(wallet)
    if (b.pending !== '1000' || b.available !== '0') {
      throw new Error(`posted=${b.posted} pending=${b.pending} available=${b.available}`)
    }
    try {
      await kordio.transactions.create({
        idempotencyKey: `sdk_validation:${stampValue}:spend-pending`,
        postings: [
          { accountId: wallet, amount: 1, currency: 'USDC' },
          { accountId: funding, amount: -1, currency: 'USDC' },
        ],
      })
      throw new Error('spending a pending inflow should have been refused')
    } catch (error) {
      const e = error as { code?: string }
      if (e.code !== 'insufficient_funds') throw error
    }
    return `pending=${b.pending} available=${b.available}, spend refused`
  })

  let holdId = ''
  await step(
    'committing the inflow funds the account and a pending outflow reserves it',
    async () => {
      const committed = await kordio.transactions.commit(inflowId)
      if (committed.status !== 'posted') throw new Error(`status=${committed.status}`)
      const hold = await kordio.transactions.create({
        idempotencyKey: `sdk_validation:${stampValue}:hold`,
        postings: [
          { accountId: wallet, amount: 800, currency: 'USDC', pending: true },
          { accountId: funding, amount: -800, currency: 'USDC', pending: true },
        ],
      })
      holdId = hold.id
      if (hold.status !== 'pending') throw new Error(`status=${hold.status}`)
      const b = await kordio.balances.get(wallet)
      if (b.available !== '200') throw new Error(`available=${b.available}, expected 200`)
      try {
        await kordio.transactions.create({
          idempotencyKey: `sdk_validation:${stampValue}:overspend`,
          postings: [
            { accountId: wallet, amount: 300, currency: 'USDC' },
            { accountId: funding, amount: -300, currency: 'USDC' },
          ],
        })
        throw new Error('a write past the reserved funds should have been refused')
      } catch (error) {
        const e = error as { code?: string }
        if (e.code !== 'insufficient_funds') throw error
      }
      return `available=${b.available} after an 800 hold, 300 refused`
    },
  )

  await step('reversing the hold voids it and frees the funds', async () => {
    const rev = await kordio.transactions.reverse(holdId, {
      idempotencyKey: `sdk_validation:${stampValue}:void-hold`,
    })
    const original = await kordio.transactions.get(holdId)
    if (original.status !== 'archived') throw new Error(`status=${original.status}`)
    const voided = (original.postings ?? []).every((p) => p.voided_at)
    if (!voided) throw new Error('pending postings were not voided')
    const b = await kordio.balances.get(wallet)
    if (b.available !== '1000' || b.pending !== '0') {
      throw new Error(`pending=${b.pending} available=${b.available}`)
    }
    return `${rev.id}, original archived, available=${b.available}`
  })

  await step('a reversed transaction can no longer be committed', async () => {
    try {
      await kordio.transactions.commit(holdId)
      throw new Error('expected a 409')
    } catch (error) {
      const e = error as { code?: string; status?: number }
      if (e.code !== 'invalid_state') throw error
      return `status=${e.status} code=${e.code}`
    }
  })

  section('LEDGER  bulk')
  await step('non-atomic bulk items succeed or fail independently', async () => {
    const result = await kordio.transactions.bulk({
      transactions: [
        {
          idempotencyKey: `sdk_validation:${stampValue}:bulk-ok`,
          postings: [
            { accountId: cash, amount: 10, currency: 'USDC' },
            { accountId: payable, amount: -10, currency: 'USDC' },
          ],
        },
        {
          idempotencyKey: `sdk_validation:${stampValue}:bulk-overdraft`,
          postings: [
            { accountId: wallet, amount: 1_000_000, currency: 'USDC' },
            { accountId: funding, amount: -1_000_000, currency: 'USDC' },
          ],
        },
      ],
    })
    const statuses = result.results.map((r) => r.error?.code ?? r.status)
    if (statuses[0] !== 'created' || statuses[1] !== 'insufficient_funds') {
      throw new Error(`statuses=${statuses.join(',')}`)
    }
    return `partial_failure=${result.partial_failure} ${statuses.join(',')}`
  })

  await step('an atomic bulk batch writes nothing when one item fails', async () => {
    const okKey = `sdk_validation:${stampValue}:atomic-ok`
    const before = await kordio.balances.get(cash)
    const result = await kordio.transactions.bulk({
      atomic: true,
      transactions: [
        {
          idempotencyKey: okKey,
          postings: [
            { accountId: cash, amount: 10, currency: 'USDC' },
            { accountId: payable, amount: -10, currency: 'USDC' },
          ],
        },
        {
          idempotencyKey: `sdk_validation:${stampValue}:atomic-overdraft`,
          postings: [
            { accountId: wallet, amount: 1_000_000, currency: 'USDC' },
            { accountId: funding, amount: -1_000_000, currency: 'USDC' },
          ],
        },
      ],
    })
    if (result.results.some((r) => r.status !== 'error')) {
      throw new Error(`statuses=${result.results.map((r) => r.status).join(',')}`)
    }
    const after = await kordio.balances.get(cash)
    if (after.posted !== before.posted)
      throw new Error(`cash moved ${before.posted} -> ${after.posted}`)
    return `atomic=${result.atomic}, every item errored, cash unchanged at ${after.posted}`
  })

  section('LEDGER  reports and metadata')
  await step('trial balance is healthy', async () => {
    const tb = await kordio.reports.trialBalance()
    if (!tb.healthy) throw new Error(`residuals=${JSON.stringify(tb.totals_by_currency)}`)
    return `${tb.accounts.length} accounts, healthy`
  })

  await step('balance sheet, income statement and cash flow answer', async () => {
    const bs = await kordio.reports.balanceSheet()
    const is = await kordio.reports.incomeStatement()
    const now = new Date()
    const cf = await kordio.reports.cashFlow({
      from: new Date(now.getTime() - 3 * 86_400_000),
      to: now,
      granularity: 'day',
    })
    return `${bs.object}, ${is.object}, ${cf.object} with ${cf.series?.length} buckets`
  })

  await step('events tail records the writes', async () => {
    const page = await kordio.events.list({ type: 'transaction.created', limit: 5 })
    const first = page.data[0]
    if (!first) throw new Error('no transaction.created events')
    return `${first.type} ${first.id}`
  })

  await step('capabilities report the engine and dropped features', async () => {
    const caps = await kordio.capabilities()
    return `engine=${caps.engine} webhooks=${caps.features.webhooks} reserves=${caps.features.reserves}`
  })

  await step('every response carries a request id', async () => {
    const res = await kordio.request('GET', '/ledger/v1/accounts', { query: { limit: 1 } })
    if (!res.requestId) throw new Error('no request id')
    return `request_id=${res.requestId}`
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
    const before = await agent.budgets.get(budgetId)
    const result = await agent.actions.simulate({
      budgetId,
      actionType: 'payment.create',
      resource: 'sdk-validation.example',
      costCents: 1000,
    })
    const after = await agent.budgets.get(budgetId)
    if (before.spent_cents !== after.spent_cents) {
      throw new Error(
        `a simulation moved the budget: ${before.spent_cents} -> ${after.spent_cents}`,
      )
    }
    return `outcome=${result.outcome} headroom=${JSON.stringify(result.headroom)}, budget untouched`
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

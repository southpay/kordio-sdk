import { formatMinorUnits, KordioLedger } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const suffix = process.env.DEMO_SUFFIX ?? 'demo'

await kordio.accounts.create({
  id: `cash:${suffix}`,
  name: 'Operating cash',
  type: 'asset',
  currency: 'USDC',
})

await kordio.accounts.create({
  id: `payable:acme:${suffix}`,
  name: 'Owed to Acme',
  type: 'liability',
  currency: 'USDC',
})

await kordio.accounts.create({
  id: `revenue:fees:${suffix}`,
  name: 'Platform fees',
  type: 'revenue',
  currency: 'USDC',
})

const orderId = 'ord_10021'

const capture = await kordio.transactions.create({
  idempotencyKey: `order:${orderId}:capture`,
  metadata: { order_id: orderId },
  postings: [
    { accountId: `cash:${suffix}`, amount: 10_000000, currency: 'USDC' },
    { accountId: `payable:acme:${suffix}`, amount: -9_700000, currency: 'USDC' },
    { accountId: `revenue:fees:${suffix}`, amount: -300000, currency: 'USDC' },
  ],
})

console.log(`captured ${capture.id}`)

const owed = await kordio.balances.get(`payable:acme:${suffix}`)
console.log(`owed to Acme: ${formatMinorUnits(BigInt(owed.available ?? '0'), 6)} USDC`)

const replay = await kordio.transactions.create({
  idempotencyKey: `order:${orderId}:capture`,
  metadata: { order_id: orderId },
  postings: [
    { accountId: `cash:${suffix}`, amount: 10_000000, currency: 'USDC' },
    { accountId: `payable:acme:${suffix}`, amount: -9_700000, currency: 'USDC' },
    { accountId: `revenue:fees:${suffix}`, amount: -300000, currency: 'USDC' },
  ],
})

console.log(`replay returned ${replay.id === capture.id ? 'the same' : 'a DIFFERENT'} transaction`)

const refund = await kordio.transactions.reverse(capture.id, {
  idempotencyKey: `order:${orderId}:reverse`,
})

console.log(`reversed by ${refund.id}`)

const settled = await kordio.balances.get(`payable:acme:${suffix}`)
console.log(`owed to Acme after reversal: ${settled.available}`)

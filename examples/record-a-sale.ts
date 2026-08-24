import { formatMinorUnits, KordioLedger } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const CASH = 'cash:usdc'
const OWED_TO_ROASTER = 'payable:blue-bottle'
const COMMISSION = 'revenue:commission'

for (const account of [
  { id: CASH, name: 'USDC received', type: 'asset' } as const,
  { id: OWED_TO_ROASTER, name: 'Owed to Blue Bottle', type: 'liability' } as const,
  { id: COMMISSION, name: 'Marketplace commission', type: 'revenue' } as const,
]) {
  await kordio.accounts.create({ ...account, currency: 'USDC' }).catch((error) => {
    if (error.code !== 'already_exists') throw error
  })
}

const order = { id: 'ord_8814', totalCents: 10_000000, commissionCents: 300000 }

const sale = await kordio.transactions.create({
  idempotencyKey: `order:${order.id}:capture`,
  metadata: { order_id: order.id, roaster: 'blue-bottle' },
  postings: [
    { accountId: CASH, amount: order.totalCents, currency: 'USDC' },
    {
      accountId: OWED_TO_ROASTER,
      amount: -(order.totalCents - order.commissionCents),
      currency: 'USDC',
    },
    { accountId: COMMISSION, amount: -order.commissionCents, currency: 'USDC' },
  ],
})

const owed = await kordio.balances.get(OWED_TO_ROASTER)

console.log(`${sale.id}`)
console.log(`Blue Bottle is owed ${formatMinorUnits(BigInt(owed.available ?? '0'), 6)} USDC`)

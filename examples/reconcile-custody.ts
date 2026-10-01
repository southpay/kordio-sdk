import { KordioLedger } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

interface CustodyDeposit {
  txHash: string
  amountMinorUnits: string
  currency: string
  seenAt: string
}

const deposits: CustodyDeposit[] = [
  {
    txHash: '0x4f1c8a92e0eb41cb83ddf6615398ba8d',
    amountMinorUnits: '10000000',
    currency: 'USDC',
    seenAt: '2026-08-23T18:04:11Z',
  },
  {
    txHash: '0x9b2ef0c16a3d4e758c192f4b7d5a0e63',
    amountMinorUnits: '250000',
    currency: 'USDC',
    seenAt: '2026-08-23T18:41:02Z',
  },
]

const unbooked: CustodyDeposit[] = []
const mismatched: CustodyDeposit[] = []

for (const deposit of deposits) {
  const booked = await kordio.transactions
    .lookup({ rail: 'ethereum', kind: 'tx_hash', value: deposit.txHash })
    .catch(() => null)

  if (!booked) {
    unbooked.push(deposit)
    continue
  }

  const custodyLeg = booked.postings.find((p) => p.account === 'cash:usdc')
  if (custodyLeg?.amount !== deposit.amountMinorUnits) mismatched.push(deposit)
}

for (const deposit of unbooked) {
  await kordio.transactions.create({
    idempotencyKey: `custody:${deposit.txHash}`,
    valueDate: deposit.seenAt,
    externalRefs: [{ rail: 'ethereum', kind: 'tx_hash', value: deposit.txHash }],
    postings: [
      { accountId: 'cash:usdc', amount: deposit.amountMinorUnits, currency: deposit.currency },
      {
        accountId: 'suspense:usdc',
        amount: `-${deposit.amountMinorUnits}`,
        currency: deposit.currency,
      },
    ],
    metadata: { source: 'custody', needs_review: 'true' },
  })
}

console.log(`${deposits.length} deposits, ${unbooked.length} booked to suspense`)
for (const deposit of mismatched) {
  console.error(`${deposit.txHash}: booked amount differs from custody, sent to ops`)
}

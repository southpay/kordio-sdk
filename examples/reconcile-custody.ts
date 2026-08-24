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

const source =
  (await kordio.sources.list().then((page) => page.data.find((s) => s.name === 'cobo'))) ??
  (await kordio.sources.create({
    name: 'cobo',
    kind: 'custody',
    default_strategy: 'exact',
    default_window_seconds: 3600,
    default_account_id: 'cash:usdc',
  }))

const ingest = await kordio.sources.ingest(source.id, {
  items: deposits.map((deposit) => ({
    external_id: deposit.txHash,
    amount: deposit.amountMinorUnits,
    currency: deposit.currency,
    occurred_at: deposit.seenAt,
    reference_rail: 'ethereum',
    reference_kind: 'tx_hash',
    reference_value: deposit.txHash,
  })),
})

if (ingest.error_count > 0) {
  for (const result of ingest.results) {
    if (result.error) console.error(`${result.external_id}: ${result.error.message}`)
  }
}

const run = await kordio.sources.reconcile(source.id, {
  strategy: 'sum_in_window',
  window_seconds: 3600,
})

console.log(`run ${run.id}: matched ${run.matched_count}, unmatched ${run.unmatched_count}`)

const open = await kordio.externalTransactions.list({ sourceId: source.id, status: 'open' })

for await (const external of open) {
  const booked = await kordio.transactions
    .lookup({ rail: 'ethereum', kind: 'tx_hash', value: external.external_id })
    .catch(() => null)

  if (!booked) {
    await kordio.externalTransactions.ignore(external.id, {
      reason: 'no internal posting, sent to ops',
    })
    continue
  }

  const postingId = booked.postings?.[0]?.id
  if (postingId === undefined) continue

  await kordio.externalTransactions.match(external.id, {
    postingIds: [postingId],
    note: `matched on ${external.external_id}`,
  })
}

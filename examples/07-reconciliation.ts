import { KordioLedger } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

const source = await kordio.sources.create({
  name: 'cobo-custody',
  kind: 'custody',
  default_account_id: 'cash:usd',
  default_window_seconds: 3600,
})

await kordio.sources.ingest(source.id, {
  items: [
    {
      external_id: '0xabc123',
      amount: '10000000',
      currency: 'USDC',
      occurred_at: new Date().toISOString(),
    },
    {
      external_id: '0xdef456',
      amount: '250000',
      currency: 'USDC',
      occurred_at: new Date().toISOString(),
    },
  ],
})

const run = await kordio.sources.reconcile(source.id, {
  strategy: 'amount_and_time',
  window_seconds: 3600,
})

console.log(`matched ${run.matched_count}, unmatched ${run.unmatched_count}`)

const unmatched = await kordio.externalTransactions.list({
  sourceId: source.id,
  status: 'open',
})

for await (const external of unmatched) {
  const booked = await findBooking(external.external_id)

  if (!booked) {
    await kordio.externalTransactions.ignore(external.id, {
      reason: 'no matching internal posting, escalated to ops',
    })
    continue
  }

  await kordio.externalTransactions.match(external.id, {
    postingIds: [booked],
    note: 'matched by external reference',
  })
}

async function findBooking(externalReference: string) {
  try {
    const tx = await kordio.transactions.lookup({
      rail: 'ethereum',
      kind: 'tx_hash',
      value: externalReference,
    })
    return tx.postings?.[0]?.id ?? null
  } catch {
    return null
  }
}

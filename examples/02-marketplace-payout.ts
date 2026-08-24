import { KordioLedger, KordioUnbalancedError } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

interface Order {
  id: string
  sellerId: string
  grossCents: number
  feeCents: number
}

const acc = {
  cash: 'cash:usd',
  payable: (sellerId: string) => `payable:${sellerId}`,
  fees: 'revenue:marketplace_fees',
  payouts: 'payable:bank_transfers',
}

export async function captureOrder(order: Order) {
  const net = order.grossCents - order.feeCents

  return await kordio.transactions.create({
    idempotencyKey: `order:${order.id}:capture`,
    metadata: { order_id: order.id, seller_id: order.sellerId },
    postings: [
      { accountId: acc.cash, amount: order.grossCents, currency: 'USD' },
      { accountId: acc.payable(order.sellerId), amount: -net, currency: 'USD' },
      { accountId: acc.fees, amount: -order.feeCents, currency: 'USD' },
    ],
  })
}

export async function payOutSeller(sellerId: string, batchId: string) {
  const balance = await kordio.balances.get(acc.payable(sellerId))
  const owed = BigInt(balance.available ?? '0')

  if (owed <= 0n) {
    console.log(`nothing to pay ${sellerId}`)
    return null
  }

  return await kordio.transactions.create({
    idempotencyKey: `payout:${batchId}:${sellerId}`,
    metadata: { seller_id: sellerId, batch: batchId },
    postings: [
      { accountId: acc.payable(sellerId), amount: owed, currency: 'USD' },
      { accountId: acc.payouts, amount: -owed, currency: 'USD' },
    ],
  })
}

export async function refundOrder(order: Order, refundCents: number) {
  const feeShare = Math.round((refundCents / order.grossCents) * order.feeCents)
  const sellerShare = refundCents - feeShare

  try {
    return await kordio.transactions.create({
      idempotencyKey: `order:${order.id}:refund:${refundCents}`,
      metadata: { order_id: order.id, kind: 'partial_refund' },
      postings: [
        { accountId: acc.cash, amount: -refundCents, currency: 'USD' },
        { accountId: acc.payable(order.sellerId), amount: sellerShare, currency: 'USD' },
        { accountId: acc.fees, amount: feeShare, currency: 'USD' },
      ],
    })
  } catch (error) {
    if (error instanceof KordioUnbalancedError) {
      console.error('rounding split the refund unevenly:', error.byCurrency)
    }
    throw error
  }
}

export async function monthEnd() {
  const sheet = await kordio.reports.balanceSheet()

  for (const [currency, totals] of Object.entries(sheet.by_currency)) {
    const residual = BigInt(totals.residual)
    const flag = residual === 0n ? 'balanced' : `OFF BY ${totals.residual}`
    console.log(`${currency}: assets ${totals.assets}, liabilities ${totals.liabilities}, ${flag}`)
  }

  return sheet.healthy
}

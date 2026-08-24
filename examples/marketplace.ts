import { KordioLedger, KordioUnbalancedError } from '@kordio/sdk'

const kordio = new KordioLedger({
  clientId: process.env.KORDIO_CLIENT_ID,
  clientSecret: process.env.KORDIO_CLIENT_SECRET,
  ledgerId: process.env.KORDIO_LEDGER_ID,
  baseUrl: process.env.KORDIO_BASE_URL,
})

export interface Order {
  id: string
  sellerId: string
  grossCents: number
  commissionCents: number
}

const cash = 'cash:usd'
const commission = 'revenue:commission'
const bankTransfers = 'payable:bank_transfers'
const owedTo = (sellerId: string) => `payable:${sellerId}`

export async function capture(order: Order) {
  return await kordio.transactions.create({
    idempotencyKey: `order:${order.id}:capture`,
    metadata: { order_id: order.id, seller_id: order.sellerId },
    postings: [
      { accountId: cash, amount: order.grossCents, currency: 'USD' },
      {
        accountId: owedTo(order.sellerId),
        amount: -(order.grossCents - order.commissionCents),
        currency: 'USD',
      },
      { accountId: commission, amount: -order.commissionCents, currency: 'USD' },
    ],
  })
}

export async function refund(order: Order, refundCents: number) {
  const commissionBack = Math.round((refundCents / order.grossCents) * order.commissionCents)
  const sellerBack = refundCents - commissionBack

  return await kordio.transactions.create({
    idempotencyKey: `order:${order.id}:refund:${refundCents}`,
    metadata: { order_id: order.id },
    postings: [
      { accountId: cash, amount: -refundCents, currency: 'USD' },
      { accountId: owedTo(order.sellerId), amount: sellerBack, currency: 'USD' },
      { accountId: commission, amount: commissionBack, currency: 'USD' },
    ],
  })
}

export async function payout(sellerId: string, batchId: string) {
  const balance = await kordio.balances.get(owedTo(sellerId))
  const owed = BigInt(balance.available ?? '0')

  if (owed <= 0n) return null

  return await kordio.transactions.create({
    idempotencyKey: `payout:${batchId}:${sellerId}`,
    metadata: { seller_id: sellerId, batch: batchId },
    postings: [
      { accountId: owedTo(sellerId), amount: owed, currency: 'USD' },
      { accountId: bankTransfers, amount: -owed, currency: 'USD' },
    ],
  })
}

export async function payoutRun(sellerIds: string[], batchId: string) {
  const paid: string[] = []
  const skipped: string[] = []
  const failed: { sellerId: string; reason: string }[] = []

  for (const sellerId of sellerIds) {
    try {
      const transaction = await payout(sellerId, batchId)
      if (transaction) paid.push(sellerId)
      else skipped.push(sellerId)
    } catch (error) {
      if (error instanceof KordioUnbalancedError) {
        failed.push({ sellerId, reason: JSON.stringify(error.byCurrency) })
        continue
      }
      throw error
    }
  }

  return { paid, skipped, failed }
}

export async function closeTheMonth() {
  const sheet = await kordio.reports.balanceSheet()
  const off = Object.entries(sheet.by_currency).filter(
    ([, totals]) => BigInt(totals.residual) !== 0n,
  )

  if (off.length > 0) {
    throw new Error(
      `balance sheet does not close: ${off
        .map(([currency, totals]) => `${currency} off by ${totals.residual}`)
        .join(', ')}`,
    )
  }

  return sheet
}

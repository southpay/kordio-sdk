import { abs, checkBalanced, type Direction, toMinorUnits } from '../core/money'
import type { PostingSpec, WirePosting } from './types'

export class KordioPostingError extends TypeError {}

export function normalizePosting(spec: PostingSpec, index: number): WirePosting {
  const label = `postings[${index}]`
  const account = spec.account ?? spec.accountId
  if (typeof account !== 'string' || account.length === 0) {
    throw new KordioPostingError(`${label} needs an \`account\` (or \`accountId\`) string`)
  }
  if (typeof spec.currency !== 'string' || spec.currency.length === 0) {
    throw new KordioPostingError(`${label} needs a \`currency\``)
  }

  const signed = toMinorUnits(spec.amount, `${label}.amount`)
  if (signed === 0n) {
    throw new KordioPostingError(
      `${label}.amount is 0. Postings must move a non-zero amount of minor units.`,
    )
  }

  let direction: Direction
  if (spec.direction) {
    if (signed < 0n && spec.direction === 'debit') {
      throw new KordioPostingError(
        `${label} sets direction "debit" but the amount is negative (${signed}). ` +
          'Pass a positive amount with an explicit direction, or a signed amount with none.',
      )
    }
    direction = spec.direction
  } else {
    direction = signed < 0n ? 'credit' : 'debit'
  }

  const wire: WirePosting = {
    account,
    amount: abs(signed).toString(),
    currency: spec.currency,
    direction,
  }
  if (spec.pending !== undefined) wire.pending = spec.pending
  if (spec.tags !== undefined) wire.tags = spec.tags
  return wire
}

export function normalizePostings(specs: readonly PostingSpec[]): WirePosting[] {
  if (!Array.isArray(specs) || specs.length === 0) {
    throw new KordioPostingError('a transaction needs at least one posting')
  }
  return specs.map(normalizePosting)
}

export function assertBalanced(postings: readonly WirePosting[]): void {
  const check = checkBalanced(
    postings.map((p) => ({
      amount: BigInt(p.amount),
      currency: p.currency,
      direction: p.direction,
    })),
  )
  if (check.balanced) return

  const detail = check.offenders
    .map((currency) => {
      const totals = check.byCurrency[currency]
      if (!totals) return currency
      return `${currency}: debit ${totals.debit} vs credit ${totals.credit}`
    })
    .join('; ')

  throw new KordioPostingError(
    `postings do not balance per currency (${detail}). ` +
      'Every currency in a transaction must have equal debits and credits.',
  )
}

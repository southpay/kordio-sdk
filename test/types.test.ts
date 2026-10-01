import { expect, test } from 'bun:test'
import type {
  AgentStatus,
  BillingPlan,
  IntentState,
  Outcome,
  SpendTokenStatus,
} from '../src/control/types'
import type {
  AccountKind,
  LedgerEventType,
  ReportGranularity,
  TransactionStatus,
} from '../src/ledger/types'

test('account kinds match the field the API returns', () => {
  const standard: AccountKind = 'standard'
  const restricted: AccountKind = 'restricted'
  // @ts-expect-error reserve was a filter value that matched no account
  const reserve: AccountKind = 'reserve'
  expect([standard, restricted, reserve]).toHaveLength(3)
})

test('report granularity is a closed set', () => {
  const day: ReportGranularity = 'day'
  // @ts-expect-error the API buckets by day, week or month only
  const quarter: ReportGranularity = 'quarter'
  expect([day, quarter]).toHaveLength(2)
})

test('statuses match the spec enums', () => {
  const transaction: TransactionStatus = 'archived'
  const agent: AgentStatus = 'suspended'
  const token: SpendTokenStatus = 'consumed'
  // @ts-expect-error reversed transactions are archived, not reversed
  const stale: TransactionStatus = 'reversed'
  expect([transaction, agent, token, stale]).toHaveLength(4)
})

test('a decision outcome is one of three things', () => {
  const outcomes: Outcome[] = ['allowed', 'denied', 'requires_approval']
  // @ts-expect-error there is no fourth outcome
  const fourth: Outcome = 'pending'
  expect([outcomes, fourth]).toHaveLength(2)
})

test('intent states and billing plans are closed', () => {
  const state: IntentState = 'requires_approval'
  const plan: BillingPlan = 'growth'
  // @ts-expect-error free is not a plan
  const free: BillingPlan = 'free'
  expect([state, plan, free]).toHaveLength(3)
})

test('ledger event types autocomplete but stay open for new events', () => {
  const known: LedgerEventType = 'transaction.created'
  const future: LedgerEventType = 'something.not.invented.yet'
  expect([known, future]).toHaveLength(2)
})

test('the user agent reports the version we actually publish', async () => {
  const pkg = await Bun.file(`${import.meta.dir}/../package.json`).json()
  const http = await Bun.file(`${import.meta.dir}/../src/core/http.ts`).text()
  const declared = /const SDK_VERSION = '([^']+)'/.exec(http)?.[1]

  expect(declared).toBe(pkg.version)
})

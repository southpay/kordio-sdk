import { expect, test } from 'bun:test'
import type {
  AgentStatus,
  BillingPlan,
  IntentState,
  Outcome,
  SpendTokenStatus,
} from '../src/control/types'
import type {
  ExportResource,
  ExternalTransactionStatus,
  LedgerEventType,
  ReconciliationStrategy,
  WebhookDeliveryStatus,
} from '../src/ledger/types'

test('reconciliation strategy accepts only what the API accepts', () => {
  const exact: ReconciliationStrategy = 'exact'
  const window: ReconciliationStrategy = 'sum_in_window'
  // @ts-expect-error the API only knows exact and sum_in_window
  const invented: ReconciliationStrategy = 'amount_and_time'
  expect([exact, window, invented]).toHaveLength(3)
})

test('export resources and formats are closed sets', () => {
  const resources: ExportResource[] = ['accounts', 'transactions', 'postings']
  // @ts-expect-error balances is not an exportable resource
  const wrong: ExportResource = 'balances'
  expect([resources, wrong]).toHaveLength(2)
})

test('statuses match the spec enums', () => {
  const external: ExternalTransactionStatus = 'open'
  const delivery: WebhookDeliveryStatus = 'succeeded'
  const agent: AgentStatus = 'suspended'
  const token: SpendTokenStatus = 'consumed'
  // @ts-expect-error unmatched is not a status the API returns; open is
  const stale: ExternalTransactionStatus = 'unmatched'
  expect([external, delivery, agent, token, stale]).toHaveLength(5)
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

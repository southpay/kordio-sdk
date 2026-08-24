import type { AmountInput, Direction } from '../core/money'
import type { components, paths } from './generated'

type Schemas = components['schemas']

export type Account = Schemas['Account']
export type AccountStatement = Schemas['AccountStatement']
export type Source = Schemas['Source']
export type ExternalTransaction = Schemas['ExternalTransaction']
export type IngestResult = Schemas['IngestResult']
export type ReconciliationRun = Schemas['ReconciliationRun']
export type ReconciliationMatch = Schemas['ReconciliationMatch']
export type Organization = Schemas['Organization']
export type Ledger = Schemas['Ledger']
export type AccountTemplate = Schemas['AccountTemplate']
export type PeriodClose = Schemas['PeriodClose']
export type Capabilities =
  paths['/ledger/v1/_meta/capabilities']['get']['responses']['200']['content']['application/json']
export type ReconciliationRunStatus = NonNullable<ReconciliationRun['status']>
export type StatementBalance = Schemas['StatementBalance']
export type ReportAccountRow = Schemas['ReportAccountRow']
export type TrialBalanceReport = Schemas['TrialBalanceReport']
export type BalanceSheetReport = Schemas['BalanceSheetReport']
export type IncomeStatementReport = Schemas['IncomeStatementReport']
export type CashFlowReport = Schemas['CashFlowReport']
export type AccountInput = Schemas['AccountInput']
export type AccountType = NonNullable<Account['type']>
export type Balance = Schemas['Balance']
export type Posting = Schemas['Posting']
export type Transaction = Schemas['Transaction']
export type DryRunResult = Schemas['DryRun']
export type LedgerEvent = Schemas['Event']
export type WebhookEndpoint = Schemas['WebhookEndpoint']
export type WebhookEndpointInput = Schemas['WebhookEndpointInput']
export type WebhookDelivery = Schemas['WebhookDelivery']
export type OAuthClient = Schemas['OAuthClient']
export type OAuthClientInput = Schemas['OAuthClientInput']
export type Export = Schemas['Export']
export type ReserveOpResult = Schemas['ReserveOpResult']
export type ReserveSweepInput = Schemas['ReserveSweepInput']
export type ReserveReleaseInput = Schemas['ReserveReleaseInput']
export type ReserveClawInput = Schemas['ReserveClawInput']
export type ReservesOutstandingReport = Schemas['ReservesOutstandingReport']
export type FundSegregationReport = Schemas['FundSegregationReport']
export type LedgerErrorCode = NonNullable<Schemas['ErrorResponse']['error']['code']>

export type LedgerMode = 'test' | 'live'
export type OverdraftPolicy = NonNullable<AccountInput['overdraft_policy']>
export type FundClassification = NonNullable<AccountInput['fund_classification']>
export type AccountKind = NonNullable<Account['account_kind']>
export type AccountKindFilter = 'standard' | 'reserve'

export type ReconciliationStrategy = 'exact' | 'sum_in_window'
export type ExternalTransactionStatus = 'open' | 'matched' | 'ignored'
export type WebhookDeliveryStatus = 'pending' | 'succeeded' | 'failed'

export type ExportResource =
  | 'accounts'
  | 'transactions'
  | 'postings'
  | 'events'
  | 'period_closes'
  | 'reconciliation_runs'
  | 'webhook_endpoints'
export type ExportFormat = 'ndjson'

export type KnownLedgerEventType =
  | 'account.created'
  | 'account.classification_changed'
  | 'transaction.created'
  | 'transaction.committed'
  | 'transaction.updated'
  | 'transaction.reversed'
  | 'transaction.reversal_created'
  | 'transaction.refund_created'
  | 'reserve.swept'
  | 'reserve.released'
  | 'reserve.clawed'
  | 'webhook_endpoint.secret_rotated'

export type LedgerEventType = KnownLedgerEventType | (string & {})

export interface RequestConfig {
  signal?: AbortSignal
  timeoutMs?: number
  maxRetries?: number
  headers?: Record<string, string>
  ledgerId?: string
}

export interface IdempotentRequestConfig extends RequestConfig {
  idempotencyKey?: string
}

export type PostingAccountRef =
  | { account: string; accountId?: never }
  | { accountId: string; account?: never }

export type PostingSpec = PostingAccountRef & {
  amount: AmountInput
  currency: string
  direction?: Direction
  pending?: boolean
  tags?: Record<string, string>
}

export interface TransactionCreateParams {
  postings: readonly PostingSpec[]
  idempotencyKey?: string
  metadata?: Record<string, unknown>
  valueDate?: Date | string
  bookingDate?: Date | string
  externalRef?: string
  expand?: readonly ('postings.account' | 'balances')[]
  dryRun?: boolean
}

export interface WirePosting {
  account: string
  amount: string
  currency: string
  direction: Direction
  pending?: boolean
  tags?: Record<string, string>
}

export interface ListParams extends RequestConfig {
  cursor?: string
  limit?: number
}

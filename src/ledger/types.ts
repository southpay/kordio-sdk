import type { AmountInput, Direction } from '../core/money'
import type { components, paths } from './generated'

type Schemas = components['schemas']

export type Account = Schemas['Account']
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

export interface StatementBalance {
  posted: string
  pending: string
  currency: string
}

export interface AccountStatement {
  object: 'account_statement'
  account: string
  currency: string
  period: { from: string | null; to: string }
  opening_balance: StatementBalance
  closing_balance: StatementBalance
  entries: Posting[]
  entry_count: number
  truncated: boolean
}

export interface CurrencyPair {
  debit: string
  credit: string
  residual: string
}

export interface ReportAccountRow {
  account: string
  name: string
  type: AccountType
  currency: string
  posted: string
  pending?: string
  debit_total?: string
  credit_total?: string
}

export interface TrialBalanceReport {
  object: 'trial_balance'
  ledger_id: string
  as_of: string
  healthy: boolean
  accounts: ReportAccountRow[]
  totals_by_currency: Record<string, CurrencyPair>
}

export interface BalanceSheetTotals {
  assets: string
  liabilities: string
  equity: string
  retained_earnings: string
  total_liabilities_and_equity: string
  residual: string
}

export interface BalanceSheetReport {
  object: 'balance_sheet'
  ledger_id: string
  as_of: string
  healthy: boolean
  accounts: ReportAccountRow[]
  by_currency: Record<string, BalanceSheetTotals>
}

export interface ReportPeriod {
  from: string | null
  to: string
}

export interface IncomeStatementTotals {
  revenue: string
  expense: string
  net_income: string
}

export interface IncomeStatementReport {
  object: 'income_statement'
  ledger_id: string
  period: ReportPeriod
  accounts: ReportAccountRow[]
  by_currency: Record<string, IncomeStatementTotals>
}

export interface CashFlowTotals {
  operating: string
  investing: string
  financing: string
  uncategorized: string
  net_change: string
}

export interface CashFlowReport {
  object: 'cash_flow'
  ledger_id: string
  period: ReportPeriod
  accounts: { account: string; name: string; currency: string; net_change: string }[]
  by_currency: Record<string, CashFlowTotals>
}

export interface Capabilities {
  object: 'capabilities'
  api_version: string
  release: string
  plan: string
  features: Record<string, boolean>
  auth: {
    scheme: string
    algorithm: string
    scopes: string[]
    grant_types: string[]
    discovery: string
  }
  time: {
    clock: string
    value_date_precision: string
    booking_date_precision: string
    period_close_enforced_at: string[]
  }
  [key: string]: unknown
}

export interface Organization {
  object: 'organization'
  id: string
  name: string
  plan: string
  viewer_role: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Ledger {
  object: 'ledger'
  id: string
  name: string
  mode: 'test' | 'live'
  description: string | null
  metadata: Record<string, unknown>
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface AccountTemplate {
  object: 'account_template'
  name: string
  accounting_type: AccountType
  allowed_currencies: string[]
  balance_non_negative: boolean
  description: string | null
  fund_classification: string | null
  custody_provider: string | null
  custody_external_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface PeriodClose {
  object: 'period_close'
  id: string
  period_start: string
  period_end: string
  closed_by_label: string
  note?: string | null
  reopened_at?: string | null
  reopened_by_label?: string | null
  trial_balance: TrialBalanceReport
  created_at: string
}

export interface Source {
  object: 'source'
  id: string
  name: string
  kind: string
  description: string | null
  implicit: boolean
  default_strategy: ReconciliationStrategy | null
  default_window_seconds: number | null
  default_tolerance_minor_units: string | null
  default_account_id: string | null
  inbound_enabled: boolean
  inbound_url: string | null
  sync_enabled: boolean
  sync_status: string
  sync_error: string | null
  connected_ref: string | null
  last_synced_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface IngestResult {
  object: 'ingest_result'
  source_id: string
  created_count: number
  replayed_count: number
  error_count: number
  results: {
    external_id: string
    status: 'created' | 'replayed' | 'error'
    external_transaction?: ExternalTransaction
    error?: { code: string; message: string; hint?: string; param?: string }
  }[]
}

export interface InboundEndpoint {
  object: 'inbound_endpoint'
  source_id: string
  token: string
  url: string
  secret?: string
  enabled: boolean
}

export interface ReconciliationMatch {
  external_id: string
  posting_id: number
  account: string
  amount: string
  currency: string
  posting_value_date: string
  external_at: string
}

export type ReconciliationRunStatus = 'running' | 'ready' | 'completed'

export interface ReconciliationRun {
  object: 'reconciliation_run'
  id: string
  source: string
  source_id: string
  status: ReconciliationRunStatus
  external_reference: string | null
  matched_count: number
  unmatched_count: number
  matched: ReconciliationMatch[]
  unmatched_external: unknown[]
  unmatched_internal: unknown[]
  created_at: string
}

export interface ExternalTransaction {
  object: 'external_transaction'
  id: string
  source_id: string
  external_id: string
  amount: string
  currency: string
  status: ExternalTransactionStatus
  account_id: string | null
  occurred_at: string | null
  matched_at: string | null
  ignored_reason: string | null
  reconciliation_run_id: string | null
  reconciliation_match_id: string | null
  reference_rail: string | null
  reference_kind: string | null
  reference_value: string | null
  raw: Record<string, unknown>
  created_at: string
}

export interface ListParams extends RequestConfig {
  cursor?: string
  limit?: number
}

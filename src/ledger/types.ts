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

export type Query<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { query?: infer Q }
}
  ? Q
  : never

export type Body<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody: { content: { 'application/json': infer B } }
}
  ? B
  : paths[P][M] extends { requestBody?: { content: { 'application/json': infer B } } }
    ? B
    : never

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
  idempotency_key?: string
  metadata?: Record<string, unknown>
  valueDate?: Date | string
  value_date?: string
  bookingDate?: Date | string
  booking_date?: string
  externalRef?: string
  external_ref?: string
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
  includeTotal?: boolean
}

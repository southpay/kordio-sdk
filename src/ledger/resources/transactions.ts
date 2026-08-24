import type { Query } from '../../core/http'
import type { Page } from '../../core/pagination'
import { encodePathSegment, extractData, Resource } from '../../core/resource'
import { assertBalanced, KordioPostingError, normalizePostings } from '../postings'
import { toRequestOptions } from '../request'
import type {
  DryRunResult,
  IdempotentRequestConfig,
  ListParams,
  PostingSpec,
  RequestConfig,
  Transaction,
  TransactionCreateParams,
  WirePosting,
} from '../types'

export type Expand = 'postings.account' | 'balances'

export interface TransactionListParams extends ListParams {
  metadata?: Record<string, string>
  expand?: readonly Expand[]
}

export interface TransactionCreateOptions extends RequestConfig {
  validate?: boolean
}

export interface BulkItem {
  idempotencyKey?: string
  idempotency_key?: string
  postings: readonly PostingSpec[]
  metadata?: Record<string, unknown>
}

export interface BulkEntry {
  status: 'created' | 'replayed' | 'error'
  idempotency_key?: string
  transaction?: Transaction
  error?: { code: string; message: string; hint?: string }
}

export interface BulkResult {
  object: 'bulk_result'
  data: BulkEntry[]
}

export interface RefundParams extends IdempotentRequestConfig {
  amount?: string | number | bigint
  currency?: string
  metadata?: Record<string, unknown>
}

function requireIdempotencyKey(key: string | undefined, call: string): string {
  if (typeof key === 'string' && key.length > 0) return key
  throw new KordioPostingError(
    `${call} requires an idempotency key. Pass \`idempotencyKey\` — a stable, caller-chosen ` +
      'string (e.g. `order:1234:capture`). The same key always returns the same result, forever.',
  )
}

function toIsoDate(value: Date | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return value instanceof Date ? value.toISOString() : value
}

export class TransactionsResource extends Resource {
  async create(params: TransactionCreateParams & TransactionCreateOptions): Promise<Transaction> {
    const postings = normalizePostings(params.postings)
    if (params.validate !== false) assertBalanced(postings)

    const idempotencyKey = params.idempotencyKey ?? params.idempotency_key
    if (params.dryRun !== true) requireIdempotencyKey(idempotencyKey, 'transactions.create')

    const body: Record<string, unknown> = { postings }
    if (params.metadata !== undefined) body.metadata = params.metadata
    const valueDate = toIsoDate(params.valueDate) ?? params.value_date
    if (valueDate !== undefined) body.value_date = valueDate
    const bookingDate = toIsoDate(params.bookingDate) ?? params.booking_date
    if (bookingDate !== undefined) body.booking_date = bookingDate
    const externalRef = params.externalRef ?? params.external_ref
    if (externalRef !== undefined) body.external_ref = externalRef

    const query: Query = {}
    if (params.expand) query.expand = params.expand
    if (params.dryRun) query.dry_run = true

    const options = toRequestOptions(params, { body, query })
    if (params.dryRun !== true && idempotencyKey) options.idempotencyKey = idempotencyKey

    return await this.unwrap<Transaction>('POST', '/v1/transactions', options)
  }

  async dryRun(
    params: Omit<TransactionCreateParams, 'dryRun'> & TransactionCreateOptions,
  ): Promise<DryRunResult> {
    const result = await this.create({ ...params, dryRun: true, validate: false })
    return result as unknown as DryRunResult
  }

  async get(
    id: string,
    config?: RequestConfig & { expand?: readonly Expand[] },
  ): Promise<Transaction> {
    const query = config?.expand ? { expand: config.expand } : undefined
    return await this.unwrap<Transaction>(
      'GET',
      `/v1/transactions/${encodePathSegment(id)}`,
      toRequestOptions(config, { query }),
    )
  }

  async update(
    id: string,
    params: RequestConfig & { metadata: Record<string, unknown> },
  ): Promise<Transaction> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, ...body } = params
    return await this.unwrap<Transaction>(
      'PATCH',
      `/v1/transactions/${encodePathSegment(id)}`,
      toRequestOptions({ signal, timeoutMs, maxRetries, headers, ledgerId }, { body }),
    )
  }

  async list(params: TransactionListParams = {}): Promise<Page<Transaction>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      include_total: params.includeTotal,
      metadata: params.metadata,
      expand: params.expand,
    }
    return await this.page<Transaction>(
      '/v1/transactions',
      query,
      'cursor',
      toRequestOptions(params),
    )
  }

  async lookup(
    params: RequestConfig & { idempotencyKey?: string; externalRef?: string },
  ): Promise<Transaction> {
    const query = {
      idempotency_key: params.idempotencyKey,
      external_ref: params.externalRef,
    }
    return await this.unwrap<Transaction>(
      'GET',
      '/v1/transactions/lookup',
      toRequestOptions(params, { query }),
    )
  }

  async bulk(
    params: RequestConfig & { transactions: readonly BulkItem[]; validate?: boolean },
  ): Promise<BulkResult> {
    const items = params.transactions.map((item, index) => {
      const postings = normalizePostings(item.postings)
      if (params.validate !== false) assertBalanced(postings)
      const key = item.idempotencyKey ?? item.idempotency_key
      if (!key) {
        throw new KordioPostingError(
          `transactions[${index}] needs its own \`idempotencyKey\`. ` +
            'The Idempotency-Key header is ignored on bulk writes.',
        )
      }
      const entry: Record<string, unknown> = { idempotency_key: key, postings }
      if (item.metadata !== undefined) entry.metadata = item.metadata
      return entry
    })

    const response = await this.raw<BulkResult>(
      'POST',
      '/v1/transactions/bulk',
      toRequestOptions(params, { body: { transactions: items } }),
    )
    return extractData<BulkResult>(response.data)
  }

  async reverse(id: string, config: IdempotentRequestConfig): Promise<Transaction> {
    const key = requireIdempotencyKey(config.idempotencyKey, 'transactions.reverse')
    return await this.unwrap<Transaction>(
      'POST',
      `/v1/transactions/${encodePathSegment(id)}/reverse`,
      toRequestOptions(config, { idempotencyKey: key }),
    )
  }

  async commit(id: string, config: IdempotentRequestConfig): Promise<Transaction> {
    const key = requireIdempotencyKey(config.idempotencyKey, 'transactions.commit')
    return await this.unwrap<Transaction>(
      'POST',
      `/v1/transactions/${encodePathSegment(id)}/commit`,
      toRequestOptions(config, { idempotencyKey: key }),
    )
  }

  async refund(id: string, params: RefundParams): Promise<Transaction> {
    const key = requireIdempotencyKey(params.idempotencyKey, 'transactions.refund')
    const body: Record<string, unknown> = {}
    if (params.amount !== undefined) body.amount = String(params.amount)
    if (params.currency !== undefined) body.currency = params.currency
    if (params.metadata !== undefined) body.metadata = params.metadata
    return await this.unwrap<Transaction>(
      'POST',
      `/v1/transactions/${encodePathSegment(id)}/refund`,
      toRequestOptions(params, { body, idempotencyKey: key }),
    )
  }
}

export type { WirePosting }

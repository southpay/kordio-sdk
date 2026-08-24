import type { Page } from '../../core/pagination'
import { compact, isoDate } from '../../core/params'
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
  idempotencyKey: string
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

export interface TransactionLookupParams extends RequestConfig {
  rail: string
  kind: string
  value: string
}

export interface RefundParams extends IdempotentRequestConfig {
  amount?: string | number | bigint
  currency?: string
  metadata?: Record<string, unknown>
}

function requireIdempotencyKey(key: string | undefined, call: string): string {
  if (typeof key === 'string' && key.length > 0) return key
  throw new KordioPostingError(
    `${call} requires an idempotency key. Pass \`idempotencyKey\`: a stable, caller-chosen ` +
      'string such as `order:1234:capture`. The same key always returns the same result, forever.',
  )
}

export class TransactionsResource extends Resource {
  async create(params: TransactionCreateParams & TransactionCreateOptions): Promise<Transaction> {
    const postings = normalizePostings(params.postings)
    if (params.validate !== false) assertBalanced(postings)

    const dryRun = params.dryRun === true
    if (!dryRun) requireIdempotencyKey(params.idempotencyKey, 'transactions.create')

    const body = compact({
      postings,
      metadata: params.metadata,
      value_date: isoDate(params.valueDate),
      booking_date: isoDate(params.bookingDate),
      external_ref: params.externalRef,
    })

    return await this.unwrap<Transaction>('POST', '/v1/transactions', {
      ...toRequestOptions(params, { body }),
      query: compact({ expand: params.expand, dry_run: dryRun || undefined }),
      idempotencyKey: dryRun ? undefined : params.idempotencyKey,
    })
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

  async lookup(params: TransactionLookupParams): Promise<Transaction> {
    for (const field of ['rail', 'kind', 'value'] as const) {
      if (!params[field]) {
        throw new KordioPostingError(
          `transactions.lookup needs rail, kind and value. Missing: ${field}.`,
        )
      }
    }
    const query = { rail: params.rail, kind: params.kind, value: params.value }
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
      const key = item.idempotencyKey
      if (!key) {
        throw new KordioPostingError(
          `transactions[${index}] needs its own \`idempotencyKey\`. ` +
            'The Idempotency-Key header is ignored on bulk writes.',
        )
      }
      return compact({ idempotency_key: key, postings, metadata: item.metadata })
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
    const body = compact({
      amount: params.amount === undefined ? undefined : String(params.amount),
      currency: params.currency,
      metadata: params.metadata,
    })
    return await this.unwrap<Transaction>(
      'POST',
      `/v1/transactions/${encodePathSegment(id)}/refund`,
      toRequestOptions(params, { body, idempotencyKey: key }),
    )
  }
}

export type { WirePosting }

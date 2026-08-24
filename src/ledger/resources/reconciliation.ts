import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { ListParams, RequestConfig } from '../types'

export interface SourceInput {
  name: string
  kind?: string
  default_strategy?: string
  default_window_seconds?: number
  default_tolerance_minor_units?: number
  default_account_id?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface ExternalTransactionItem {
  external_reference: string
  amount: string | number
  currency: string
  occurred_at?: string
  account?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface RunInput {
  from?: Date | string
  to?: Date | string
  strategy?: string
  window_seconds?: number
  auto_resolve_below_minor_units?: number
  external_reference?: string
  note?: string
}

export interface ExternalTransactionListParams extends ListParams {
  status?: string
  sourceId?: string
  currency?: string
  from?: Date | string
  to?: Date | string
}

function iso(value: Date | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return value instanceof Date ? value.toISOString() : value
}

export class SourcesResource extends Resource {
  async create<T = unknown>(params: SourceInput & RequestConfig): Promise<T> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, ...body } = params
    return await this.unwrap<T>(
      'POST',
      '/v1/sources',
      toRequestOptions({ signal, timeoutMs, maxRetries, headers, ledgerId }, { body }),
    )
  }

  async list<T = unknown>(params: ListParams = {}): Promise<Page<T>> {
    return await this.page<T>('/v1/sources', {}, 'cursor', toRequestOptions(params))
  }

  async get<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/sources/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update<T = unknown>(id: string, params: Partial<SourceInput> & RequestConfig): Promise<T> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, ...body } = params
    return await this.unwrap<T>(
      'PATCH',
      `/v1/sources/${encodePathSegment(id)}`,
      toRequestOptions({ signal, timeoutMs, maxRetries, headers, ledgerId }, { body }),
    )
  }

  async ingest<T = unknown>(
    sourceId: string,
    params: RequestConfig & { items: readonly ExternalTransactionItem[] },
  ): Promise<T> {
    const { items, ...config } = params
    return await this.unwrap<T>(
      'POST',
      `/v1/sources/${encodePathSegment(sourceId)}/external_transactions`,
      toRequestOptions(config, { body: { items } }),
    )
  }

  async reconcile<T = unknown>(
    sourceId: string,
    params: RunInput & RequestConfig = {},
  ): Promise<T> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, from, to, ...rest } = params
    const body = { ...rest, from: iso(from), to: iso(to) }
    return await this.unwrap<T>(
      'POST',
      `/v1/sources/${encodePathSegment(sourceId)}/reconciliation_runs`,
      toRequestOptions({ signal, timeoutMs, maxRetries, headers, ledgerId }, { body }),
    )
  }

  async enableInbound<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      `/v1/sources/${encodePathSegment(id)}/inbound`,
      toRequestOptions(config),
    )
  }

  async disableInbound(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      `/v1/sources/${encodePathSegment(id)}/inbound`,
      toRequestOptions(config),
    )
  }
}

export class ReconciliationRunsResource extends Resource {
  async create<T = unknown>(
    params: RunInput &
      RequestConfig & { source: string; items: readonly ExternalTransactionItem[] },
  ): Promise<T> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, from, to, ...rest } = params
    const body = { ...rest, from: iso(from), to: iso(to) }
    return await this.unwrap<T>(
      'POST',
      '/v1/reconciliation_runs',
      toRequestOptions({ signal, timeoutMs, maxRetries, headers, ledgerId }, { body }),
    )
  }

  async list<T = unknown>(params: ListParams = {}): Promise<Page<T>> {
    return await this.page<T>(
      '/v1/reconciliation_runs',
      { limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/reconciliation_runs/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class ExternalTransactionsResource extends Resource {
  async list<T = unknown>(params: ExternalTransactionListParams = {}): Promise<Page<T>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      status: params.status,
      source_id: params.sourceId,
      currency: params.currency,
      from: iso(params.from),
      to: iso(params.to),
    }
    return await this.page<T>(
      '/v1/external_transactions',
      query,
      'cursor',
      toRequestOptions(params),
    )
  }

  async get<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/external_transactions/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async matches<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/external_transactions/${encodePathSegment(id)}/matches`,
      toRequestOptions(config),
    )
  }

  async match<T = unknown>(
    id: string,
    params: RequestConfig & { postingIds: readonly (string | number)[]; note?: string },
  ): Promise<T> {
    const body = { posting_ids: params.postingIds, note: params.note }
    return await this.unwrap<T>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/match`,
      toRequestOptions(params, { body }),
    )
  }

  async unmatch<T = unknown>(
    id: string,
    params: RequestConfig & { reason?: string } = {},
  ): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/unmatch`,
      toRequestOptions(params, { body: { reason: params.reason } }),
    )
  }

  async ignore<T = unknown>(
    id: string,
    params: RequestConfig & { reason?: string } = {},
  ): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/ignore`,
      toRequestOptions(params, { body: { reason: params.reason } }),
    )
  }
}

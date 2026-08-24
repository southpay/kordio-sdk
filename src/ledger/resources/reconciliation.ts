import type { Page } from '../../core/pagination'
import { compact, isoDate } from '../../core/params'
import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  ExternalTransaction,
  ExternalTransactionStatus,
  InboundEndpoint,
  IngestResult,
  ListParams,
  ReconciliationMatch,
  ReconciliationRun,
  ReconciliationStrategy,
  RequestConfig,
  Source,
} from '../types'

export interface SourceInput {
  name: string
  kind?: string
  default_strategy?: ReconciliationStrategy
  default_window_seconds?: number
  default_tolerance_minor_units?: string | number
  default_account_id?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface ExternalTransactionItem {
  external_id: string
  amount: string | number
  currency: string
  occurred_at?: string
  account_id?: string
  reference_rail?: string
  reference_kind?: string
  reference_value?: string
  raw?: Record<string, unknown>
}

export interface RunInput {
  from?: Date | string
  to?: Date | string
  strategy?: ReconciliationStrategy
  window_seconds?: number
  auto_resolve_below_minor_units?: string | number
  external_reference?: string
  note?: string
}

export interface ExternalTransactionListParams extends ListParams {
  status?: ExternalTransactionStatus
  sourceId?: string
  currency?: string
  from?: Date | string
  to?: Date | string
}

export class SourcesResource extends Resource {
  async create(params: SourceInput & RequestConfig): Promise<Source> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Source>('POST', '/v1/sources', toRequestOptions(config, { body }))
  }

  async list(params: ListParams = {}): Promise<Page<Source>> {
    return await this.page<Source>('/v1/sources', {}, 'cursor', toRequestOptions(params))
  }

  async get(id: string, config?: RequestConfig): Promise<Source> {
    return await this.unwrap<Source>(
      'GET',
      `/v1/sources/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update(id: string, params: Partial<SourceInput> & RequestConfig): Promise<Source> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Source>(
      'PATCH',
      `/v1/sources/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }

  async ingest(
    sourceId: string,
    params: RequestConfig & { items: readonly ExternalTransactionItem[] },
  ): Promise<IngestResult> {
    const { items, ...config } = params
    return await this.unwrap<IngestResult>(
      'POST',
      `/v1/sources/${encodePathSegment(sourceId)}/external_transactions`,
      toRequestOptions(config, { body: { items } }),
    )
  }

  async reconcile(
    sourceId: string,
    params: RunInput & RequestConfig = {},
  ): Promise<ReconciliationRun> {
    const { config, body: rest } = splitConfig(params)
    const body = compact({ ...rest, from: isoDate(params.from), to: isoDate(params.to) })
    return await this.unwrap<ReconciliationRun>(
      'POST',
      `/v1/sources/${encodePathSegment(sourceId)}/reconciliation_runs`,
      toRequestOptions(config, { body }),
    )
  }

  async enableInbound(id: string, config?: RequestConfig): Promise<InboundEndpoint> {
    return await this.unwrap<InboundEndpoint>(
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
  async create(
    params: RunInput &
      RequestConfig & { source: string; items: readonly ExternalTransactionItem[] },
  ): Promise<ReconciliationRun> {
    const { config, body: rest } = splitConfig(params)
    const body = compact({ ...rest, from: isoDate(params.from), to: isoDate(params.to) })
    return await this.unwrap<ReconciliationRun>(
      'POST',
      '/v1/reconciliation_runs',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<ReconciliationRun>> {
    return await this.page<ReconciliationRun>(
      '/v1/reconciliation_runs',
      { limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<ReconciliationRun> {
    return await this.unwrap<ReconciliationRun>(
      'GET',
      `/v1/reconciliation_runs/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class ExternalTransactionsResource extends Resource {
  async list(params: ExternalTransactionListParams = {}): Promise<Page<ExternalTransaction>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      status: params.status,
      source_id: params.sourceId,
      currency: params.currency,
      from: isoDate(params.from),
      to: isoDate(params.to),
    }
    return await this.page<ExternalTransaction>(
      '/v1/external_transactions',
      query,
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<ExternalTransaction> {
    return await this.unwrap<ExternalTransaction>(
      'GET',
      `/v1/external_transactions/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async matches(id: string, params: ListParams = {}): Promise<Page<ReconciliationMatch>> {
    return await this.page<ReconciliationMatch>(
      `/v1/external_transactions/${encodePathSegment(id)}/matches`,
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async match(
    id: string,
    params: RequestConfig & { postingIds: readonly (string | number)[]; note?: string },
  ): Promise<ExternalTransaction> {
    const body = { posting_ids: params.postingIds, note: params.note }
    return await this.unwrap<ExternalTransaction>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/match`,
      toRequestOptions(params, { body }),
    )
  }

  async unmatch(
    id: string,
    params: RequestConfig & { reason?: string } = {},
  ): Promise<ExternalTransaction> {
    return await this.unwrap<ExternalTransaction>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/unmatch`,
      toRequestOptions(params, { body: { reason: params.reason } }),
    )
  }

  async ignore(
    id: string,
    params: RequestConfig & { reason?: string } = {},
  ): Promise<ExternalTransaction> {
    return await this.unwrap<ExternalTransaction>(
      'POST',
      `/v1/external_transactions/${encodePathSegment(id)}/ignore`,
      toRequestOptions(params, { body: { reason: params.reason } }),
    )
  }
}

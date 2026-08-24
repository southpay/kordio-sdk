import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { ListParams, Posting, RequestConfig } from '../types'

export interface PostingListParams extends ListParams {
  reconciled?: boolean
  account?: string
  beforeValueDate?: Date | string
}

export interface ReconciliationLinkParams extends RequestConfig {
  externalReference?: string
  reconciliationRunId?: string
}

export class PostingsResource extends Resource {
  async list(params: PostingListParams = {}): Promise<Page<Posting>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      reconciled: params.reconciled,
      account: params.account,
      before_value_date:
        params.beforeValueDate instanceof Date
          ? params.beforeValueDate.toISOString()
          : params.beforeValueDate,
    }
    return await this.page<Posting>('/v1/postings', query, 'cursor', toRequestOptions(params))
  }

  async reconcile<T = unknown>(
    id: string | number,
    params: ReconciliationLinkParams = {},
  ): Promise<T> {
    const body = {
      external_reference: params.externalReference,
      reconciliation_run_id: params.reconciliationRunId,
    }
    return await this.unwrap<T>(
      'POST',
      `/v1/postings/${encodePathSegment(String(id))}/reconciliations`,
      toRequestOptions(params, { body }),
    )
  }
}

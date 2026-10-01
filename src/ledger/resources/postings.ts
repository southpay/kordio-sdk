import type { Page } from '../../core/pagination'
import { Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { ListParams, Posting } from '../types'

export interface PostingListParams extends ListParams {
  reconciled?: boolean
  account?: string
  beforeValueDate?: Date | string
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
    return await this.page<Posting>(
      '/ledger/v1/postings',
      query,
      'cursor',
      toRequestOptions(params),
    )
  }
}

import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { LedgerEvent, ListParams, RequestConfig } from '../types'

export interface EventListParams extends ListParams {
  type?: string
  resourceId?: string
  since?: Date | string
}

export class EventsResource extends Resource {
  async list(params: EventListParams = {}): Promise<Page<LedgerEvent>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      type: params.type,
      resource_id: params.resourceId,
      since: params.since instanceof Date ? params.since.toISOString() : params.since,
    }
    return await this.page<LedgerEvent>(
      '/ledger/v1/events',
      query,
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<LedgerEvent> {
    return await this.unwrap<LedgerEvent>(
      'GET',
      `/ledger/v1/events/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

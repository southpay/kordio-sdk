import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  IdempotentRequestConfig,
  LedgerEventType,
  ListParams,
  RequestConfig,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookEndpoint,
  WebhookEndpointInput,
} from '../types'

export interface WebhookEndpointUpdateParams extends RequestConfig {
  url?: string
  description?: string
  enabled_events?: readonly LedgerEventType[]
  active?: boolean
}

export interface DeliveryListParams extends ListParams {
  status?: WebhookDeliveryStatus
}

export class WebhookEndpointsResource extends Resource {
  async create(params: WebhookEndpointInput & RequestConfig): Promise<WebhookEndpoint> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<WebhookEndpoint>(
      'POST',
      '/api/v1/webhook_endpoints',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<WebhookEndpoint>> {
    return await this.page<WebhookEndpoint>(
      '/api/v1/webhook_endpoints',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<WebhookEndpoint> {
    return await this.unwrap<WebhookEndpoint>(
      'GET',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update(id: string, params: WebhookEndpointUpdateParams): Promise<WebhookEndpoint> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<WebhookEndpoint>(
      'PATCH',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }

  async delete(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async rotateSecret(id: string, config: IdempotentRequestConfig): Promise<WebhookEndpoint> {
    return await this.unwrap<WebhookEndpoint>(
      'POST',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}/rotate_secret`,
      toRequestOptions(config, { idempotencyKey: config.idempotencyKey }),
    )
  }

  async deliveries(id: string, params: DeliveryListParams = {}): Promise<Page<WebhookDelivery>> {
    const query = { cursor: params.cursor, limit: params.limit, status: params.status }
    return await this.page<WebhookDelivery>(
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}/deliveries`,
      query,
      'cursor',
      toRequestOptions(params),
    )
  }

  async failedCount(
    id: string,
    params: RequestConfig & { since?: Date | string } = {},
  ): Promise<{ count: number }> {
    const query = {
      since: params.since instanceof Date ? params.since.toISOString() : params.since,
    }
    return await this.unwrap<{ count: number }>(
      'GET',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}/deliveries/failed_count`,
      toRequestOptions(params, { query }),
    )
  }

  async testSend(
    id: string,
    params: IdempotentRequestConfig & {
      eventType?: LedgerEventType
      payload?: Record<string, unknown>
    },
  ): Promise<WebhookDelivery> {
    const body = { event_type: params.eventType, payload: params.payload }
    return await this.unwrap<WebhookDelivery>(
      'POST',
      `/api/v1/webhook_endpoints/${encodePathSegment(id)}/test_send`,
      toRequestOptions(params, { body, idempotencyKey: params.idempotencyKey }),
    )
  }
}

export class WebhookDeliveriesResource extends Resource {
  async get(id: string, config?: RequestConfig): Promise<WebhookDelivery> {
    return await this.unwrap<WebhookDelivery>(
      'GET',
      `/api/v1/webhook_deliveries/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async redeliver(id: string, config: IdempotentRequestConfig): Promise<WebhookDelivery> {
    return await this.unwrap<WebhookDelivery>(
      'POST',
      `/api/v1/webhook_deliveries/${encodePathSegment(id)}/redeliver`,
      toRequestOptions(config, { idempotencyKey: config.idempotencyKey }),
    )
  }
}

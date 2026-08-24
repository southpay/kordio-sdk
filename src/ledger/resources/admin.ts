import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type {
  Export,
  IdempotentRequestConfig,
  ListParams,
  OAuthClient,
  OAuthClientInput,
  RequestConfig,
} from '../types'

export interface PeriodCloseInput extends RequestConfig {
  period_start: string
  period_end: string
  closed_by_label: string
  note?: string
}

export interface AccountTemplateInput extends RequestConfig {
  name: string
  accounting_type: string
  allowed_currencies?: readonly string[]
  balance_non_negative?: boolean
  description?: string
  metadata?: Record<string, unknown>
  fund_classification?: string
  custody_provider?: string
  custody_external_id?: string
}

export interface LedgerInput extends RequestConfig {
  name: string
  mode: 'test' | 'live'
  metadata?: Record<string, unknown>
}

function stripConfig<T extends RequestConfig>(params: T) {
  const { signal, timeoutMs, maxRetries, headers, ledgerId, ...body } = params
  return { config: { signal, timeoutMs, maxRetries, headers, ledgerId }, body }
}

export class PeriodClosesResource extends Resource {
  async create<T = unknown>(params: PeriodCloseInput): Promise<T> {
    const { config, body } = stripConfig(params)
    return await this.unwrap<T>('POST', '/v1/period_closes', toRequestOptions(config, { body }))
  }

  async list<T = unknown>(
    params: ListParams & { includeReopened?: boolean } = {},
  ): Promise<Page<T>> {
    return await this.page<T>(
      '/v1/period_closes',
      { include_reopened: params.includeReopened },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/period_closes/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async reopen<T = unknown>(
    id: string,
    params: RequestConfig & { reopenedByLabel: string },
  ): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      `/v1/period_closes/${encodePathSegment(id)}/reopen`,
      toRequestOptions(params, { body: { reopened_by_label: params.reopenedByLabel } }),
    )
  }
}

export class AccountTemplatesResource extends Resource {
  async create<T = unknown>(params: AccountTemplateInput): Promise<T> {
    const { config, body } = stripConfig(params)
    return await this.unwrap<T>('POST', '/v1/account_templates', toRequestOptions(config, { body }))
  }

  async list<T = unknown>(params: ListParams = {}): Promise<Page<T>> {
    return await this.page<T>(
      '/v1/account_templates',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get<T = unknown>(name: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/account_templates/${encodePathSegment(name)}`,
      toRequestOptions(config),
    )
  }
}

export class ExportsResource extends Resource {
  async create(
    params: IdempotentRequestConfig & {
      resources?: readonly string[]
      format?: string
    },
  ): Promise<Export> {
    const body = { resources: params.resources, format: params.format }
    return await this.unwrap<Export>(
      'POST',
      '/v1/exports',
      toRequestOptions(params, { body, idempotencyKey: params.idempotencyKey }),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Export> {
    return await this.unwrap<Export>(
      'GET',
      `/v1/exports/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class OAuthClientsResource extends Resource {
  async create(params: OAuthClientInput & RequestConfig): Promise<OAuthClient> {
    const { config, body } = stripConfig(params)
    return await this.unwrap<OAuthClient>(
      'POST',
      '/v1/oauth_clients',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<OAuthClient>> {
    return await this.page<OAuthClient>(
      '/v1/oauth_clients',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<OAuthClient> {
    return await this.unwrap<OAuthClient>(
      'GET',
      `/v1/oauth_clients/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async delete(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      `/v1/oauth_clients/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async rotateSecret(id: string, config?: IdempotentRequestConfig): Promise<OAuthClient> {
    return await this.unwrap<OAuthClient>(
      'POST',
      `/v1/oauth_clients/${encodePathSegment(id)}/rotate_secret`,
      toRequestOptions(config, { idempotencyKey: config?.idempotencyKey }),
    )
  }
}

export class LedgersResource extends Resource {
  async create<T = unknown>(params: LedgerInput): Promise<T> {
    const { config, body } = stripConfig(params)
    return await this.unwrap<T>('POST', '/v1/ledgers', toRequestOptions(config, { body }))
  }

  async list<T = unknown>(params: ListParams = {}): Promise<Page<T>> {
    return await this.page<T>(
      '/v1/ledgers',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get<T = unknown>(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      `/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update<T = unknown>(
    id: string,
    params: RequestConfig & { name?: string; metadata?: Record<string, unknown> },
  ): Promise<T> {
    const { config, body } = stripConfig(params)
    return await this.unwrap<T>(
      'PATCH',
      `/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }
}

export class OrganizationsResource extends Resource {
  async me<T = unknown>(config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>('GET', '/v1/organizations/me', toRequestOptions(config))
  }
}

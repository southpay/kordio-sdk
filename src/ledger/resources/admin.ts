import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  AccountTemplate,
  Export,
  IdempotentRequestConfig,
  Ledger,
  ListParams,
  OAuthClient,
  OAuthClientInput,
  Organization,
  PeriodClose,
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

export class PeriodClosesResource extends Resource {
  async create(params: PeriodCloseInput): Promise<PeriodClose> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<PeriodClose>(
      'POST',
      '/v1/period_closes',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams & { includeReopened?: boolean } = {}): Promise<Page<PeriodClose>> {
    return await this.page<PeriodClose>(
      '/v1/period_closes',
      { include_reopened: params.includeReopened },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<PeriodClose> {
    return await this.unwrap<PeriodClose>(
      'GET',
      `/v1/period_closes/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async reopen(
    id: string,
    params: RequestConfig & { reopenedByLabel: string },
  ): Promise<PeriodClose> {
    return await this.unwrap<PeriodClose>(
      'POST',
      `/v1/period_closes/${encodePathSegment(id)}/reopen`,
      toRequestOptions(params, { body: { reopened_by_label: params.reopenedByLabel } }),
    )
  }
}

export class AccountTemplatesResource extends Resource {
  async create(params: AccountTemplateInput): Promise<AccountTemplate> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<AccountTemplate>(
      'POST',
      '/v1/account_templates',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<AccountTemplate>> {
    return await this.page<AccountTemplate>(
      '/v1/account_templates',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(name: string, config?: RequestConfig): Promise<AccountTemplate> {
    return await this.unwrap<AccountTemplate>(
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
    const { config, body } = splitConfig(params)
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
  async create(params: LedgerInput): Promise<Ledger> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Ledger>('POST', '/v1/ledgers', toRequestOptions(config, { body }))
  }

  async list(params: ListParams = {}): Promise<Page<Ledger>> {
    return await this.page<Ledger>(
      '/v1/ledgers',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Ledger> {
    return await this.unwrap<Ledger>(
      'GET',
      `/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update(
    id: string,
    params: RequestConfig & { name?: string; metadata?: Record<string, unknown> },
  ): Promise<Ledger> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Ledger>(
      'PATCH',
      `/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }
}

export class OrganizationsResource extends Resource {
  async me(config?: RequestConfig): Promise<Organization> {
    return await this.unwrap<Organization>('GET', '/v1/organizations/me', toRequestOptions(config))
  }
}

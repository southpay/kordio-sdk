import type { AuthProvider, FetchLike, HttpResponse, RequestOptions } from '../core/http'
import { Transport } from '../core/http'
import { OAuthAuthProvider, StaticTokenAuthProvider } from './auth'
import { AccountsResource } from './resources/accounts'
import {
  AccountTemplatesResource,
  LedgersResource,
  OAuthClientsResource,
  OrganizationsResource,
  PeriodClosesResource,
} from './resources/admin'
import { BalancesResource } from './resources/balances'
import { EventsResource } from './resources/events'
import { PostingsResource } from './resources/postings'
import { ReportsResource } from './resources/reports'
import { TransactionsResource } from './resources/transactions'
import type { Capabilities } from './types'

export const DEFAULT_BASE_URL = 'https://api.kordio.io'

export interface KordioLedgerOptions {
  clientId?: string
  clientSecret?: string
  accessToken?: string
  scope?: string | readonly string[]
  ledgerId?: string
  baseUrl?: string
  fetch?: FetchLike
  timeoutMs?: number
  maxRetries?: number
  auth?: AuthProvider
  tokenUrl?: string
  userAgentSuffix?: string
}

function env(name: string): string | undefined {
  const value = globalThis.process?.env?.[name]
  return value === undefined || value === '' ? undefined : value
}

function resolveAuth(options: KordioLedgerOptions, baseUrl: string): AuthProvider {
  if (options.auth) return options.auth

  const oauth = (clientId: string, clientSecret: string) =>
    new OAuthAuthProvider({
      clientId,
      clientSecret,
      scope: options.scope,
      baseUrl,
      tokenUrl: options.tokenUrl ?? env('KORDIO_TOKEN_URL'),
      fetch: options.fetch,
    })

  if (options.clientId && options.clientSecret) {
    return oauth(options.clientId, options.clientSecret)
  }
  if (options.accessToken) return new StaticTokenAuthProvider(options.accessToken)

  const clientId = env('KORDIO_CLIENT_ID')
  const clientSecret = env('KORDIO_CLIENT_SECRET')
  if (clientId && clientSecret) return oauth(clientId, clientSecret)

  const token = env('KORDIO_TOKEN')
  if (token) return new StaticTokenAuthProvider(token)

  throw new TypeError(
    'KordioLedger needs credentials: pass { clientId, clientSecret } or { accessToken }, ' +
      'or set KORDIO_CLIENT_ID and KORDIO_CLIENT_SECRET, or KORDIO_TOKEN.',
  )
}

export class KordioLedger {
  readonly accounts: AccountsResource
  readonly balances: BalancesResource
  readonly transactions: TransactionsResource
  readonly postings: PostingsResource
  readonly events: EventsResource
  readonly reports: ReportsResource
  readonly periodCloses: PeriodClosesResource
  readonly accountTemplates: AccountTemplatesResource
  readonly oauthClients: OAuthClientsResource
  readonly ledgers: LedgersResource
  readonly organizations: OrganizationsResource

  private readonly transport: Transport
  private readonly authProvider: AuthProvider

  constructor(options: KordioLedgerOptions = {}) {
    const baseUrl = (options.baseUrl ?? env('KORDIO_BASE_URL') ?? DEFAULT_BASE_URL).replace(
      /\/+$/,
      '',
    )
    const ledgerId = options.ledgerId ?? env('KORDIO_LEDGER_ID')

    this.authProvider = resolveAuth(options, baseUrl)
    this.transport = new Transport({
      surface: 'ledger',
      baseUrl,
      auth: this.authProvider,
      fetch: options.fetch,
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
      defaultHeaders: ledgerId ? { 'x-ledger-id': ledgerId } : {},
      userAgentSuffix: options.userAgentSuffix,
    })

    this.accounts = new AccountsResource(this.transport)
    this.balances = new BalancesResource(this.transport)
    this.transactions = new TransactionsResource(this.transport)
    this.postings = new PostingsResource(this.transport)
    this.events = new EventsResource(this.transport)
    this.reports = new ReportsResource(this.transport)
    this.periodCloses = new PeriodClosesResource(this.transport)
    this.accountTemplates = new AccountTemplatesResource(this.transport)
    this.oauthClients = new OAuthClientsResource(this.transport)
    this.ledgers = new LedgersResource(this.transport)
    this.organizations = new OrganizationsResource(this.transport)
  }

  get baseUrl(): string {
    return this.transport.baseUrl
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return await this.transport.request<T>(method, path, options)
  }

  async capabilities(): Promise<Capabilities> {
    const response = await this.transport.request<{ data?: Capabilities }>(
      'GET',
      '/ledger/v1/_meta/capabilities',
    )
    const body = response.data
    return (body && typeof body === 'object' && 'data' in body ? body.data : body) as Capabilities
  }
}

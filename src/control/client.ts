import type { AuthProvider, FetchLike, HttpResponse, RequestOptions } from '../core/http'
import { Transport } from '../core/http'
import { StaticTokenAuthProvider } from '../ledger/auth'
import {
  ActionsResource,
  AgentBudgetsResource,
  AgentPaymentIntentsResource,
  AgentSpendTokensResource,
} from './resources/agent'
import { CosignResource } from './resources/cosign'
import {
  ActionIntentsResource,
  AgentsResource,
  AuditEventsResource,
  BillingResource,
  ControlWebhookEndpointsResource,
  FundsResource,
  InvitationsResource,
  MembersResource,
  PaymentIntentsResource,
  PoliciesResource,
  PolicyModulesResource,
  WorkspaceBudgetsResource,
  WorkspaceSpendTokensResource,
  WorkspacesResource,
} from './resources/workspace'

export const DEFAULT_BASE_URL = 'https://api.kordio.io'

function env(name: string): string | undefined {
  const value = globalThis.process?.env?.[name]
  return value === undefined || value === '' ? undefined : value
}

function normalizeBaseUrl(raw: string | undefined): string {
  return (raw ?? env('KORDIO_BASE_URL') ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
}

class AnonymousAuthProvider implements AuthProvider {
  async headers(): Promise<Record<string, string>> {
    return {}
  }
}

export interface KordioAgentOptions {
  agentKey?: string
  baseUrl?: string
  fetch?: FetchLike
  timeoutMs?: number
  maxRetries?: number
  userAgentSuffix?: string
}

export class KordioAgent {
  readonly actions: ActionsResource
  readonly budgets: AgentBudgetsResource
  readonly spendTokens: AgentSpendTokensResource
  readonly paymentIntents: AgentPaymentIntentsResource

  private readonly transport: Transport

  constructor(options: KordioAgentOptions = {}) {
    const agentKey = options.agentKey ?? env('KORDIO_AGENT_KEY')
    if (!agentKey) {
      throw new TypeError(
        'KordioAgent needs an agent key. Pass { agentKey: "krt_live_..." } or set ' +
          'KORDIO_AGENT_KEY. An agent key can ask for authorization; it can never write policy.',
      )
    }

    this.transport = new Transport({
      surface: 'control',
      baseUrl: normalizeBaseUrl(options.baseUrl),
      auth: new StaticTokenAuthProvider(agentKey),
      fetch: options.fetch,
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
      userAgentSuffix: options.userAgentSuffix,
    })

    this.actions = new ActionsResource(this.transport)
    this.budgets = new AgentBudgetsResource(this.transport)
    this.spendTokens = new AgentSpendTokensResource(this.transport)
    this.paymentIntents = new AgentPaymentIntentsResource(this.transport)
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
}

export interface KordioWorkspaceOptions {
  token?: string
  workspace?: string
  baseUrl?: string
  fetch?: FetchLike
  timeoutMs?: number
  maxRetries?: number
  userAgentSuffix?: string
}

export class KordioWorkspace {
  readonly slug: string
  readonly agents: AgentsResource
  readonly policies: PoliciesResource
  readonly policyModules: PolicyModulesResource
  readonly actionIntents: ActionIntentsResource
  readonly paymentIntents: PaymentIntentsResource
  readonly budgets: WorkspaceBudgetsResource
  readonly spendTokens: WorkspaceSpendTokensResource
  readonly funds: FundsResource
  readonly auditEvents: AuditEventsResource
  readonly webhookEndpoints: ControlWebhookEndpointsResource
  readonly members: MembersResource
  readonly invitations: InvitationsResource
  readonly billing: BillingResource
  readonly workspaces: WorkspacesResource

  private readonly transport: Transport

  constructor(options: KordioWorkspaceOptions = {}) {
    const token = options.token ?? env('KORDIO_DASHBOARD_TOKEN')
    const slug = options.workspace ?? env('KORDIO_WORKSPACE')

    if (!token) {
      throw new TypeError(
        'KordioWorkspace needs an identity token. Pass { token } or set ' +
          'KORDIO_DASHBOARD_TOKEN. An identity token manages the workspace; it can never ' +
          'authorize an action as an agent.',
      )
    }
    if (!slug) {
      throw new TypeError(
        'KordioWorkspace needs a workspace slug. Pass { workspace } or set KORDIO_WORKSPACE.',
      )
    }

    this.slug = slug
    this.transport = new Transport({
      surface: 'control',
      baseUrl: normalizeBaseUrl(options.baseUrl),
      auth: new StaticTokenAuthProvider(token),
      fetch: options.fetch,
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
      userAgentSuffix: options.userAgentSuffix,
    })

    this.agents = new AgentsResource(this.transport, slug)
    this.policies = new PoliciesResource(this.transport, slug)
    this.policyModules = new PolicyModulesResource(this.transport, slug)
    this.actionIntents = new ActionIntentsResource(this.transport, slug)
    this.paymentIntents = new PaymentIntentsResource(this.transport, slug)
    this.budgets = new WorkspaceBudgetsResource(this.transport, slug)
    this.spendTokens = new WorkspaceSpendTokensResource(this.transport, slug)
    this.funds = new FundsResource(this.transport, slug)
    this.auditEvents = new AuditEventsResource(this.transport, slug)
    this.webhookEndpoints = new ControlWebhookEndpointsResource(this.transport, slug)
    this.members = new MembersResource(this.transport, slug)
    this.invitations = new InvitationsResource(this.transport, slug)
    this.billing = new BillingResource(this.transport, slug)
    this.workspaces = new WorkspacesResource(this.transport)
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
}

export interface KordioCosignOptions {
  baseUrl?: string
  fetch?: FetchLike
  timeoutMs?: number
  maxRetries?: number
}

export class KordioCosign extends CosignResource {
  constructor(options: KordioCosignOptions = {}) {
    super(
      new Transport({
        surface: 'control',
        baseUrl: normalizeBaseUrl(options.baseUrl),
        auth: new AnonymousAuthProvider(),
        fetch: options.fetch,
        timeoutMs: options.timeoutMs,
        maxRetries: options.maxRetries,
      }),
    )
  }
}

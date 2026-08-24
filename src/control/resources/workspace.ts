import type { Transport } from '../../core/http'
import type { Page } from '../../core/pagination'
import { compact } from '../../core/params'
import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type {
  ActionIntent,
  Agent,
  ApprovalImpact,
  AuditEvent,
  BillingOverview,
  BillingPortal,
  Budget,
  CheckoutResult,
  ControlWebhookEndpoint,
  Decision,
  Funds,
  Invitation,
  ListParams,
  Membership,
  PackCheckout,
  PaymentIntent,
  Policy,
  PolicyModule,
  PolicyWrite,
  RequestConfig,
  Role,
  SpendToken,
  Workspace,
  WorkspaceExport,
} from '../types'

const CURSOR_PARAM = 'starting_after'

abstract class ScopedResource extends Resource {
  protected readonly workspace: string

  constructor(transport: Transport, workspace: string) {
    super(transport)
    this.workspace = workspace
  }

  protected base(suffix: string): string {
    return `/v1/workspaces/${encodePathSegment(this.workspace)}${suffix}`
  }

  protected listQuery(params: ListParams, extra: Record<string, unknown> = {}) {
    return compact({
      limit: params.limit,
      starting_after: params.startingAfter,
      ...extra,
    }) as Record<string, string | number | boolean | undefined>
  }
}

export class AgentsResource extends ScopedResource {
  async create(
    params: RequestConfig & {
      name: string
      mode?: 'test' | 'live'
      status?: string
      scopes?: readonly string[]
    },
  ): Promise<Agent> {
    const body = compact({
      name: params.name,
      mode: params.mode,
      status: params.status,
      scopes: params.scopes,
    })
    return await this.unwrap<Agent>(
      'POST',
      this.base('/agents'),
      toRequestOptions(params, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<Agent>> {
    return await this.page<Agent>(
      this.base('/agents'),
      this.listQuery(params),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Agent> {
    return await this.unwrap<Agent>(
      'GET',
      this.base(`/agents/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }

  async update(
    id: string,
    params: RequestConfig & { name?: string; status?: string; scopes?: readonly string[] },
  ): Promise<Agent> {
    const body = compact({ name: params.name, status: params.status, scopes: params.scopes })
    return await this.unwrap<Agent>(
      'PATCH',
      this.base(`/agents/${encodePathSegment(id)}`),
      toRequestOptions(params, { body }),
    )
  }
}

export class PoliciesResource extends ScopedResource {
  async create(params: PolicyWrite & RequestConfig): Promise<Policy> {
    const { signal, timeoutMs, maxRetries, headers, ...body } = params
    return await this.unwrap<Policy>(
      'POST',
      this.base('/policies'),
      toRequestOptions({ signal, timeoutMs, maxRetries, headers }, { body }),
    )
  }

  async list(params: ListParams & { agentId?: string } = {}): Promise<Page<Policy>> {
    return await this.page<Policy>(
      this.base('/policies'),
      this.listQuery(params, { agent_id: params.agentId }),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Policy> {
    return await this.unwrap<Policy>(
      'GET',
      this.base(`/policies/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }

  async update(id: string, params: PolicyWrite & RequestConfig): Promise<Policy> {
    const { signal, timeoutMs, maxRetries, headers, ...body } = params
    return await this.unwrap<Policy>(
      'PATCH',
      this.base(`/policies/${encodePathSegment(id)}`),
      toRequestOptions({ signal, timeoutMs, maxRetries, headers }, { body }),
    )
  }

  async preview(
    params: RequestConfig & {
      agentId: string
      actionType: string
      resource?: string
      costCents?: number
      metadata?: Record<string, unknown>
      sessionBudgetCents?: number
      policy?: Record<string, unknown>
    },
  ): Promise<Decision> {
    const body = compact({
      agent_id: params.agentId,
      action_type: params.actionType,
      resource: params.resource,
      cost_cents: params.costCents,
      metadata: params.metadata,
      session_budget_cents: params.sessionBudgetCents,
      policy: params.policy,
    })
    return await this.unwrap<Decision>(
      'POST',
      this.base('/policy_previews'),
      toRequestOptions(params, { body }),
    )
  }
}

export class PolicyModulesResource extends ScopedResource {
  async create(
    params: RequestConfig & {
      name: string
      description?: string
      rules?: readonly Record<string, unknown>[]
    },
  ): Promise<PolicyModule> {
    const body = compact({
      name: params.name,
      description: params.description,
      rules: params.rules,
    })
    return await this.unwrap<PolicyModule>(
      'POST',
      this.base('/policy_modules'),
      toRequestOptions(params, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<PolicyModule>> {
    return await this.page<PolicyModule>(
      this.base('/policy_modules'),
      this.listQuery(params),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(name: string, config?: RequestConfig): Promise<PolicyModule> {
    return await this.unwrap<PolicyModule>(
      'GET',
      this.base(`/policy_modules/${encodePathSegment(name)}`),
      toRequestOptions(config),
    )
  }

  async update(
    name: string,
    params: RequestConfig & {
      description?: string
      rules?: readonly Record<string, unknown>[]
    },
  ): Promise<PolicyModule> {
    const body = compact({ description: params.description, rules: params.rules })
    return await this.unwrap<PolicyModule>(
      'PATCH',
      this.base(`/policy_modules/${encodePathSegment(name)}`),
      toRequestOptions(params, { body }),
    )
  }

  async delete(name: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      this.base(`/policy_modules/${encodePathSegment(name)}`),
      toRequestOptions(config),
    )
  }
}

export interface IntentListParams extends ListParams {
  agentId?: string
  budgetId?: string
  state?: string
  actionType?: string
  agentMode?: 'test' | 'live'
}

class ApprovalQueue<T> extends ScopedResource {
  protected readonly collection: string

  constructor(transport: Transport, workspace: string, collection: string) {
    super(transport, workspace)
    this.collection = collection
  }

  async list(params: IntentListParams = {}): Promise<Page<T>> {
    return await this.page<T>(
      this.base(`/${this.collection}`),
      this.listQuery(params, {
        agent_id: params.agentId,
        budget_id: params.budgetId,
        state: params.state,
        action_type: params.actionType,
        agent_mode: params.agentMode,
      }),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'GET',
      this.base(`/${this.collection}/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }

  async impact(id: string, config?: RequestConfig): Promise<ApprovalImpact> {
    return await this.unwrap<ApprovalImpact>(
      'GET',
      this.base(`/${this.collection}/${encodePathSegment(id)}/impact`),
      toRequestOptions(config),
    )
  }

  async approve(id: string, config?: RequestConfig): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      this.base(`/${this.collection}/${encodePathSegment(id)}/approve`),
      toRequestOptions(config),
    )
  }

  async deny(id: string, params: RequestConfig & { reason?: string } = {}): Promise<T> {
    return await this.unwrap<T>(
      'POST',
      this.base(`/${this.collection}/${encodePathSegment(id)}/deny`),
      toRequestOptions(params, { body: compact({ reason: params.reason }) }),
    )
  }
}

export class ActionIntentsResource extends ApprovalQueue<ActionIntent> {
  constructor(transport: Transport, workspace: string) {
    super(transport, workspace, 'action_intents')
  }
}

export class PaymentIntentsResource extends ApprovalQueue<PaymentIntent> {
  constructor(transport: Transport, workspace: string) {
    super(transport, workspace, 'payment_intents')
  }
}

export class WorkspaceBudgetsResource extends ScopedResource {
  async list(params: ListParams & { agentId?: string } = {}): Promise<Page<Budget>> {
    return await this.page<Budget>(
      this.base('/budgets'),
      this.listQuery(params, { agent_id: params.agentId }),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Budget> {
    return await this.unwrap<Budget>(
      'GET',
      this.base(`/budgets/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }
}

export class WorkspaceSpendTokensResource extends ScopedResource {
  async list(params: ListParams & { budgetId?: string } = {}): Promise<Page<SpendToken>> {
    return await this.page<SpendToken>(
      this.base('/spend_tokens'),
      this.listQuery(params, { budget_id: params.budgetId }),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<SpendToken> {
    return await this.unwrap<SpendToken>(
      'GET',
      this.base(`/spend_tokens/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }
}

export class FundsResource extends ScopedResource {
  async get(config?: RequestConfig): Promise<Funds> {
    return await this.unwrap<Funds>('GET', this.base('/funds'), toRequestOptions(config))
  }
}

export class AuditEventsResource extends ScopedResource {
  async list(
    params: ListParams & { subjectType?: string; subjectId?: string; traceId?: string } = {},
  ): Promise<Page<AuditEvent>> {
    return await this.page<AuditEvent>(
      this.base('/audit_events'),
      this.listQuery(params, {
        subject_type: params.subjectType,
        subject_id: params.subjectId,
        trace_id: params.traceId,
      }),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<AuditEvent> {
    return await this.unwrap<AuditEvent>(
      'GET',
      this.base(`/audit_events/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }
}

export class ControlWebhookEndpointsResource extends ScopedResource {
  async create(
    params: RequestConfig & {
      url: string
      status?: string
      enabledEvents?: readonly string[]
    },
  ): Promise<ControlWebhookEndpoint> {
    const body = compact({
      url: params.url,
      status: params.status,
      enabled_events: params.enabledEvents,
    })
    return await this.unwrap<ControlWebhookEndpoint>(
      'POST',
      this.base('/webhook_endpoints'),
      toRequestOptions(params, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<ControlWebhookEndpoint>> {
    return await this.page<ControlWebhookEndpoint>(
      this.base('/webhook_endpoints'),
      this.listQuery(params),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<ControlWebhookEndpoint> {
    return await this.unwrap<ControlWebhookEndpoint>(
      'GET',
      this.base(`/webhook_endpoints/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }

  async delete(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      this.base(`/webhook_endpoints/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }

  async rotate(id: string, config?: RequestConfig): Promise<ControlWebhookEndpoint> {
    return await this.unwrap<ControlWebhookEndpoint>(
      'POST',
      this.base(`/webhook_endpoints/${encodePathSegment(id)}/rotate`),
      toRequestOptions(config),
    )
  }
}

export class MembersResource extends ScopedResource {
  async list(params: ListParams = {}): Promise<Page<Membership>> {
    return await this.page<Membership>(
      this.base('/memberships'),
      this.listQuery(params),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async add(
    params: RequestConfig & { userSub: string; email?: string; role?: Role },
  ): Promise<Membership> {
    const body = compact({
      user_sub: params.userSub,
      email: params.email,
      role: params.role,
    })
    return await this.unwrap<Membership>(
      'POST',
      this.base('/memberships'),
      toRequestOptions(params, { body }),
    )
  }

  async updateRole(id: string, params: RequestConfig & { role: Role }): Promise<Membership> {
    return await this.unwrap<Membership>(
      'PATCH',
      this.base(`/memberships/${encodePathSegment(id)}`),
      toRequestOptions(params, { body: { role: params.role } }),
    )
  }

  async remove(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      this.base(`/memberships/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }
}

export class InvitationsResource extends ScopedResource {
  async list(params: ListParams = {}): Promise<Page<Invitation>> {
    return await this.page<Invitation>(
      this.base('/invitations'),
      this.listQuery(params),
      CURSOR_PARAM,
      toRequestOptions(params),
    )
  }

  async create(params: RequestConfig & { email: string; role?: Role }): Promise<Invitation> {
    const body = compact({ email: params.email, role: params.role })
    return await this.unwrap<Invitation>(
      'POST',
      this.base('/invitations'),
      toRequestOptions(params, { body }),
    )
  }

  async revoke(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      this.base(`/invitations/${encodePathSegment(id)}`),
      toRequestOptions(config),
    )
  }
}

export class BillingResource extends ScopedResource {
  async overview(config?: RequestConfig): Promise<BillingOverview> {
    return await this.unwrap<BillingOverview>(
      'GET',
      this.base('/billing'),
      toRequestOptions(config),
    )
  }

  async checkout(
    params: RequestConfig & { plan: string; email?: string },
  ): Promise<CheckoutResult> {
    const body = compact({ plan: params.plan, email: params.email })
    return await this.unwrap<CheckoutResult>(
      'POST',
      this.base('/billing/checkout'),
      toRequestOptions(params, { body }),
    )
  }

  async packs(params: RequestConfig & { units: number; email?: string }): Promise<PackCheckout> {
    const body = compact({ units: params.units, email: params.email })
    return await this.unwrap<PackCheckout>(
      'POST',
      this.base('/billing/packs'),
      toRequestOptions(params, { body }),
    )
  }

  async portal(config?: RequestConfig): Promise<BillingPortal> {
    return await this.unwrap<BillingPortal>(
      'POST',
      this.base('/billing/portal'),
      toRequestOptions(config),
    )
  }

  async cancel(config?: RequestConfig): Promise<BillingOverview> {
    return await this.unwrap<BillingOverview>(
      'POST',
      this.base('/billing/cancel'),
      toRequestOptions(config),
    )
  }

  async refresh(config?: RequestConfig): Promise<BillingOverview> {
    return await this.unwrap<BillingOverview>(
      'POST',
      this.base('/billing/refresh'),
      toRequestOptions(config),
    )
  }
}

export class WorkspacesResource extends Resource {
  async list(config?: RequestConfig): Promise<Workspace[]> {
    const body = await this.unwrap<Workspace[] | { data: Workspace[] }>(
      'GET',
      '/v1/workspaces',
      toRequestOptions(config),
    )
    return Array.isArray(body) ? body : ((body as { data: Workspace[] }).data ?? [])
  }

  async create(params: RequestConfig & { name: string; slug?: string }): Promise<Workspace> {
    const body = compact({ name: params.name, slug: params.slug })
    return await this.unwrap<Workspace>(
      'POST',
      '/v1/workspaces',
      toRequestOptions(params, { body }),
    )
  }

  async get(slug: string, config?: RequestConfig): Promise<Workspace> {
    return await this.unwrap<Workspace>(
      'GET',
      `/v1/workspaces/${encodePathSegment(slug)}`,
      toRequestOptions(config),
    )
  }

  async delete(slug: string, params: RequestConfig & { confirm: string }): Promise<void> {
    await this.raw<void>(
      'DELETE',
      `/v1/workspaces/${encodePathSegment(slug)}`,
      toRequestOptions(params, { body: { confirm: params.confirm } }),
    )
  }

  async export(slug: string, config?: RequestConfig): Promise<WorkspaceExport> {
    return await this.unwrap<WorkspaceExport>(
      'GET',
      `/v1/workspaces/${encodePathSegment(slug)}/export`,
      toRequestOptions(config),
    )
  }

  async lookupInvitation(params: RequestConfig & { token: string }): Promise<Invitation> {
    return await this.unwrap<Invitation>(
      'GET',
      '/v1/invitations/lookup',
      toRequestOptions(params, { query: { token: params.token } }),
    )
  }

  async acceptInvitation(params: RequestConfig & { token: string }): Promise<Membership> {
    return await this.unwrap<Membership>(
      'POST',
      '/v1/invitations/accept',
      toRequestOptions(params, { body: { token: params.token } }),
    )
  }
}

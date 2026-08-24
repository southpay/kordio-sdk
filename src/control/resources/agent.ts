import { compact, isoDate } from '../../core/params'
import { encodePathSegment, Resource } from '../../core/resource'
import {
  DECISION_EXPECTED_STATUSES,
  type DecisionEnvelope,
  toDecisionResult,
  toSimulationResult,
} from '../decision'
import { toRequestOptions } from '../request'
import type {
  ActionIntent,
  ActionParams,
  ActionResult,
  Budget,
  BudgetParams,
  Decision,
  PaymentIntent,
  PaymentParams,
  PaymentResult,
  RequestConfig,
  SimulationResult,
  SpendToken,
  SpendTokenParams,
} from '../types'

function requireIdempotencyKey(key: string | undefined, call: string): string {
  if (typeof key === 'string' && key.length > 0) return key
  throw new TypeError(
    `${call} requires an \`idempotencyKey\` unique to this attempt. A replay returns the ` +
      'original decision instead of reserving budget twice.',
  )
}

export class ActionsResource extends Resource {
  async authorize(params: ActionParams): Promise<ActionResult> {
    const key = requireIdempotencyKey(params.idempotencyKey, 'actions.authorize')
    const body = compact({
      budget_id: params.budgetId,
      action_type: params.actionType,
      resource: params.resource,
      cost_cents: params.costCents,
      metadata: params.metadata,
      trace_id: params.traceId,
    })
    const response = await this.raw<DecisionEnvelope<ActionIntent>>(
      'POST',
      '/control/v1/agent/actions',
      {
        ...toRequestOptions(params, { body, idempotencyKey: key }),
        expectedStatuses: DECISION_EXPECTED_STATUSES,
      },
    )
    return toDecisionResult<ActionIntent>(response, {
      method: 'POST',
      path: '/control/v1/agent/actions',
    })
  }

  async simulate(params: Omit<ActionParams, 'idempotencyKey'>): Promise<SimulationResult> {
    const body = compact({
      budget_id: params.budgetId,
      action_type: params.actionType,
      resource: params.resource,
      cost_cents: params.costCents,
      metadata: params.metadata,
      trace_id: params.traceId,
    })
    const decision = await this.unwrap<Decision>(
      'POST',
      '/control/v1/agent/actions/simulate',
      toRequestOptions(params, { body }),
    )
    return toSimulationResult(decision)
  }

  async get(id: string, config?: RequestConfig): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'GET',
      `/control/v1/agent/actions/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async complete(id: string, config?: RequestConfig): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'POST',
      `/control/v1/agent/actions/${encodePathSegment(id)}/complete`,
      toRequestOptions(config),
    )
  }

  async fail(id: string, params: RequestConfig & { reason?: string } = {}): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'POST',
      `/control/v1/agent/actions/${encodePathSegment(id)}/fail`,
      toRequestOptions(params, { body: compact({ reason: params.reason }) }),
    )
  }
}

export class AgentBudgetsResource extends Resource {
  async create(params: BudgetParams): Promise<Budget> {
    const body = compact({
      budget_cents: params.budgetCents,
      currency: params.currency,
      parent_budget_id: params.parentBudgetId,
    })
    return await this.unwrap<Budget>(
      'POST',
      '/control/v1/agent/budgets',
      toRequestOptions(params, { body }),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Budget> {
    return await this.unwrap<Budget>(
      'GET',
      `/control/v1/agent/budgets/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class AgentSpendTokensResource extends Resource {
  async create(params: SpendTokenParams): Promise<SpendToken> {
    const body = compact({
      budget_id: params.budgetId,
      amount_ceiling_cents: params.amountCeilingCents,
      counterparty: params.counterparty,
      expires_at: isoDate(params.expiresAt),
    })
    return await this.unwrap<SpendToken>(
      'POST',
      '/control/v1/agent/spend_tokens',
      toRequestOptions(params, { body }),
    )
  }
}

export class AgentPaymentIntentsResource extends Resource {
  async authorize(params: PaymentParams): Promise<PaymentResult> {
    const key = requireIdempotencyKey(params.idempotencyKey, 'paymentIntents.authorize')
    const body = compact({
      budget_id: params.budgetId,
      amount_cents: params.amountCents,
      idempotency_key: key,
      counterparty: params.counterparty,
      spend_token_id: params.spendTokenId,
      trace_id: params.traceId,
      decision_context: params.decisionContext,
      metadata: params.metadata,
    })
    const response = await this.raw<DecisionEnvelope<PaymentIntent>>(
      'POST',
      '/control/v1/agent/payment_intents',
      {
        ...toRequestOptions(params, { body }),
        expectedStatuses: DECISION_EXPECTED_STATUSES,
      },
    )
    return toDecisionResult<PaymentIntent>(response, {
      method: 'POST',
      path: '/control/v1/agent/payment_intents',
    })
  }

  async simulate(
    params: Omit<PaymentParams, 'idempotencyKey' | 'spendTokenId' | 'decisionContext' | 'metadata'>,
  ): Promise<SimulationResult> {
    const body = compact({
      budget_id: params.budgetId,
      amount_cents: params.amountCents,
      counterparty: params.counterparty,
      trace_id: params.traceId,
    })
    const decision = await this.unwrap<Decision>(
      'POST',
      '/control/v1/agent/payment_intents/simulate',
      toRequestOptions(params, { body }),
    )
    return toSimulationResult(decision)
  }

  async get(id: string, config?: RequestConfig): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'GET',
      `/control/v1/agent/payment_intents/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async complete(id: string, config?: RequestConfig): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'POST',
      `/control/v1/agent/payment_intents/${encodePathSegment(id)}/complete`,
      toRequestOptions(config),
    )
  }

  async fail(id: string, params: RequestConfig & { reason?: string } = {}): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'POST',
      `/control/v1/agent/payment_intents/${encodePathSegment(id)}/fail`,
      toRequestOptions(params, { body: compact({ reason: params.reason }) }),
    )
  }
}

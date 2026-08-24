import type { components } from './generated'

type Schemas = components['schemas']

export type Budget = Schemas['Session']
export type SpendToken = Schemas['SpendToken']
export type ActionIntent = Schemas['ActionIntent']
export type PaymentIntent = Schemas['PaymentIntent']
export type Decision = Schemas['Decision']
export type Agent = Schemas['Agent']
export type Policy = Schemas['Policy']
export type PolicyDraft = Schemas['PolicyDraft']
export type PolicyWrite = Schemas['PolicyWrite']
export type PolicyRule = Schemas['PolicyRule']
export type PolicyModule = Schemas['PolicyModule']
export type ApprovalImpact = Schemas['ApprovalImpact']
export type Funds = Schemas['Funds']
export type AuditEvent = Schemas['AuditEvent']
export type ControlWebhookEndpoint = Schemas['WebhookEndpoint']
export type WebhookEventType = Schemas['WebhookEventType']
export type Workspace = Schemas['Workspace']
export type Membership = Schemas['Membership']
export type Invitation = Schemas['Invitation']
export type Role = Schemas['Role']
export type BillingOverview = Schemas['BillingOverview']
export type CosignatureValid = Schemas['CosignatureVerificationValid']
export type CosignatureInvalid = Schemas['CosignatureVerificationInvalid']
export type ControlErrorCode = NonNullable<Schemas['Error']['error']['code']>

export type Outcome = 'allowed' | 'requires_approval' | 'denied'

export interface CheckoutStarted {
  checkout_url: string
  checkout_id: string
  plan: string
}

export interface PlanChanged {
  plan_changed: boolean
  plan: string
}

export type CheckoutResult = CheckoutStarted | PlanChanged

export interface PackCheckout {
  checkout_url: string
  checkout_id: string
  units: number
  volume_cents: number
}

export interface BillingPortal {
  portal_url: string
}

export interface WorkspaceExport {
  workspace: Workspace
  exported_at: string
  counts: Record<string, number>
  [key: string]: unknown
}

export type Headroom = Record<string, number>

export interface RequestConfig {
  signal?: AbortSignal
  timeoutMs?: number
  maxRetries?: number
  headers?: Record<string, string>
}

export interface ListParams extends RequestConfig {
  limit?: number
  startingAfter?: string
}

interface DecisionResultBase<T> {
  status: number
  decision: Decision
  headroom: Headroom
  rule: string | null
  detail: Record<string, unknown>
  intent: T
}

export type DecisionResult<T> =
  | (DecisionResultBase<T> & { outcome: 'allowed'; allowed: true; cosignature: string | null })
  | (DecisionResultBase<T> & { outcome: 'requires_approval'; allowed: false; cosignature: null })
  | (DecisionResultBase<T> & { outcome: 'denied'; allowed: false; cosignature: null })

export type ActionResult = DecisionResult<ActionIntent>
export type PaymentResult = DecisionResult<PaymentIntent>

export interface ActionParams extends RequestConfig {
  budgetId: string
  actionType: string
  resource?: string | null
  costCents?: number
  metadata?: Record<string, unknown>
  traceId?: string | null
  idempotencyKey?: string
}

export interface PaymentParams extends RequestConfig {
  budgetId: string
  amountCents: number
  idempotencyKey?: string
  counterparty?: string | null
  spendTokenId?: string | null
  traceId?: string | null
  decisionContext?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface BudgetParams extends RequestConfig {
  budgetCents: number
  currency?: string
  parentBudgetId?: string | null
}

export interface SpendTokenParams extends RequestConfig {
  budgetId: string
  amountCeilingCents: number
  counterparty?: string | null
  expiresAt?: Date | string | null
}

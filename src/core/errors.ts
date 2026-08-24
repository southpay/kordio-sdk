export type KordioErrorSurface = 'ledger' | 'control'

export interface KordioErrorPayload {
  code?: string | null
  message?: string
  hint?: string
  param?: string | null
  details?: Record<string, unknown>
  docs_url?: string
  request_id?: string
}

export interface KordioErrorInit {
  surface: KordioErrorSurface
  status: number
  code: string | null
  message: string
  hint?: string
  param?: string | null
  details?: Record<string, unknown>
  docsUrl?: string
  requestId?: string
  method: string
  path: string
  headers?: Record<string, string>
  body?: unknown
}

export class KordioError extends Error {
  readonly surface: KordioErrorSurface
  readonly status: number
  readonly code: string | null
  readonly hint: string | undefined
  readonly param: string | null | undefined
  readonly details: Record<string, unknown> | undefined
  readonly docsUrl: string | undefined
  readonly requestId: string | undefined
  readonly method: string
  readonly path: string
  readonly headers: Record<string, string>
  readonly body: unknown

  constructor(init: KordioErrorInit) {
    super(init.message)
    this.name = new.target.name
    this.surface = init.surface
    this.status = init.status
    this.code = init.code
    this.hint = init.hint
    this.param = init.param
    this.details = init.details
    this.docsUrl = init.docsUrl
    this.requestId = init.requestId
    this.method = init.method
    this.path = init.path
    this.headers = init.headers ?? {}
    this.body = init.body
    Error.captureStackTrace?.(this, new.target)
  }

  override toString(): string {
    const parts = [`${this.name}: ${this.message}`]
    if (this.code) parts.push(`code=${this.code}`)
    parts.push(`status=${this.status}`, `${this.method} ${this.path}`)
    if (this.requestId) parts.push(`request_id=${this.requestId}`)
    return parts.join(' ')
  }
}

export class KordioConnectionError extends KordioError {
  override readonly cause: unknown

  constructor(init: Omit<KordioErrorInit, 'status' | 'code'> & { cause?: unknown }) {
    super({ ...init, status: 0, code: 'connection_error' })
    this.cause = init.cause
  }
}

export class KordioTimeoutError extends KordioConnectionError {}

export class KordioAuthenticationError extends KordioError {}
export class KordioPermissionError extends KordioError {}
export class KordioNotFoundError extends KordioError {}
export class KordioConflictError extends KordioError {}
export class KordioValidationError extends KordioError {}
export class KordioServerError extends KordioError {}

export class KordioRateLimitError extends KordioError {
  readonly retryAfterSeconds: number | null

  constructor(init: KordioErrorInit & { retryAfterSeconds: number | null }) {
    super(init)
    this.retryAfterSeconds = init.retryAfterSeconds
  }
}

export interface UnbalancedCurrencyTotals {
  debit: string
  credit: string
}

export class KordioUnbalancedError extends KordioValidationError {
  get byCurrency(): Record<string, UnbalancedCurrencyTotals> {
    const raw = this.details?.by_currency
    return (raw as Record<string, UnbalancedCurrencyTotals>) ?? {}
  }
}

export class KordioIdempotencyConflictError extends KordioConflictError {}

const LEDGER_ERROR_CLASSES: Record<string, new (init: KordioErrorInit) => KordioError> = {
  unbalanced: KordioUnbalancedError,
}

function statusClass(status: number): new (init: KordioErrorInit) => KordioError {
  if (status === 401) return KordioAuthenticationError
  if (status === 403) return KordioPermissionError
  if (status === 404) return KordioNotFoundError
  if (status === 409) return KordioConflictError
  if (status === 422 || status === 400) return KordioValidationError
  if (status >= 500) return KordioServerError
  return KordioError
}

export function parseErrorPayload(body: unknown): KordioErrorPayload {
  if (typeof body !== 'object' || body === null) return {}
  const envelope = body as { error?: unknown; message?: unknown; request_id?: unknown }
  const inner = envelope.error
  if (typeof inner === 'object' && inner !== null) {
    const payload = inner as KordioErrorPayload
    if (!payload.request_id && typeof envelope.request_id === 'string') {
      return { ...payload, request_id: envelope.request_id }
    }
    return payload
  }
  if (typeof envelope.message === 'string') return { message: envelope.message }
  return {}
}

export interface BuildErrorInput {
  surface: KordioErrorSurface
  status: number
  body: unknown
  method: string
  path: string
  headers: Record<string, string>
  retryAfterSeconds?: number | null
}

export function buildError(input: BuildErrorInput): KordioError {
  const payload = parseErrorPayload(input.body)
  const code = payload.code ?? null
  const init: KordioErrorInit = {
    surface: input.surface,
    status: input.status,
    code,
    message: payload.message ?? `HTTP ${input.status} from ${input.method} ${input.path}`,
    hint: payload.hint,
    param: payload.param,
    details: payload.details,
    docsUrl: payload.docs_url,
    requestId: payload.request_id ?? input.headers['x-request-id'],
    method: input.method,
    path: input.path,
    headers: input.headers,
    body: input.body,
  }

  if (input.status === 429) {
    return new KordioRateLimitError({
      ...init,
      retryAfterSeconds: input.retryAfterSeconds ?? null,
    })
  }

  if (code === 'idempotency_conflict') return new KordioIdempotencyConflictError(init)

  if (code && LEDGER_ERROR_CLASSES[code]) {
    const Cls = LEDGER_ERROR_CLASSES[code] as new (init: KordioErrorInit) => KordioError
    return new Cls(init)
  }

  return new (statusClass(input.status))(init)
}

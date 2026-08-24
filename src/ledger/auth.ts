import { KordioAuthenticationError } from '../core/errors'
import type { AuthProvider, FetchLike } from '../core/http'

export interface OAuthCredentials {
  clientId: string
  clientSecret: string
  scope?: string | readonly string[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

export interface CachedToken {
  accessToken: string
  expiresAtMs: number
  scope: string | undefined
}

export interface OAuthAuthProviderConfig extends OAuthCredentials {
  baseUrl: string
  fetch?: FetchLike
  tokenUrl?: string
  expirySkewSeconds?: number
  onToken?: (token: CachedToken) => void
}

const DEFAULT_TOKEN_PATH = '/oauth/token'
const DEFAULT_SKEW_SECONDS = 60

export function defaultTokenUrl(baseUrl: string): string {
  try {
    return new URL(DEFAULT_TOKEN_PATH, baseUrl).toString()
  } catch {
    return `${baseUrl}${DEFAULT_TOKEN_PATH}`
  }
}

function base64(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(value)
  }
  return Buffer.from(value, 'utf8').toString('base64')
}

export class OAuthAuthProvider implements AuthProvider {
  private readonly config: OAuthAuthProviderConfig
  private readonly fetchImpl: FetchLike
  private cached: CachedToken | null = null
  private inflight: Promise<CachedToken> | null = null

  constructor(config: OAuthAuthProviderConfig) {
    this.config = config
    this.fetchImpl = config.fetch ?? ((input, init) => globalThis.fetch(input, init))
  }

  async headers(options: { forceRefresh: boolean }): Promise<Record<string, string>> {
    const token = await this.token(options)
    return { authorization: `Bearer ${token.accessToken}` }
  }

  async token(options: { forceRefresh: boolean } = { forceRefresh: false }): Promise<CachedToken> {
    const skewMs = (this.config.expirySkewSeconds ?? DEFAULT_SKEW_SECONDS) * 1000
    if (!options.forceRefresh && this.cached && this.cached.expiresAtMs - skewMs > Date.now()) {
      return this.cached
    }
    if (options.forceRefresh) this.cached = null
    if (this.inflight) return await this.inflight

    this.inflight = this.fetchToken()
      .then((token) => {
        this.cached = token
        this.config.onToken?.(token)
        return token
      })
      .finally(() => {
        this.inflight = null
      })

    return await this.inflight
  }

  invalidate(): void {
    this.cached = null
  }

  get tokenUrl(): string {
    return this.config.tokenUrl ?? defaultTokenUrl(this.config.baseUrl)
  }

  private async fetchToken(): Promise<CachedToken> {
    const url = this.tokenUrl
    const scope = Array.isArray(this.config.scope)
      ? this.config.scope.join(' ')
      : (this.config.scope as string | undefined)

    const form = new URLSearchParams({ grant_type: 'client_credentials' })
    if (scope) form.set('scope', scope)

    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${base64(`${this.config.clientId}:${this.config.clientSecret}`)}`,
      },
      body: form.toString(),
    })

    const text = await response.text()
    let body: unknown = null
    try {
      body = text.length > 0 ? JSON.parse(text) : null
    } catch {
      body = text
    }

    if (!response.ok) {
      const oauthError = body as { error?: string; error_description?: string } | null
      throw new KordioAuthenticationError({
        surface: 'ledger',
        status: response.status,
        code: oauthError?.error ?? 'invalid_client',
        message:
          oauthError?.error_description ?? `token request failed with HTTP ${response.status}`,
        hint: 'Check KORDIO_CLIENT_ID / KORDIO_CLIENT_SECRET and that the client is enabled.',
        method: 'POST',
        path: url,
        body,
      })
    }

    const token = body as TokenResponse
    if (!token?.access_token) {
      throw new KordioAuthenticationError({
        surface: 'ledger',
        status: response.status,
        code: 'invalid_grant',
        message: 'token endpoint returned no access_token',
        method: 'POST',
        path: url,
        body,
      })
    }

    return {
      accessToken: token.access_token,
      expiresAtMs: Date.now() + (token.expires_in ?? 3600) * 1000,
      scope: token.scope,
    }
  }
}

export class StaticTokenAuthProvider implements AuthProvider {
  private readonly token: string

  constructor(token: string) {
    this.token = token
  }

  async headers(): Promise<Record<string, string>> {
    return { authorization: `Bearer ${this.token}` }
  }
}

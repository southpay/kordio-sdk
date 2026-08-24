import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'
import { REPO_ROOT, SPECS } from './specs'

const METHODS = ['get', 'post', 'patch', 'put', 'delete'] as const

const INTENTIONALLY_UNWRAPPED: Record<string, string> = {
  'POST /oauth/token': 'handled by OAuthAuthProvider (src/ledger/auth.ts)',
  'GET /healthz': 'exposed as KordioLedger#health',
  'GET /.well-known/oauth-authorization-server': 'discovery document, not a client call',
  'GET /.well-known/jwks.json': 'key material, fetched by verifiers not by this SDK',
  'GET /api/v1/_meta/capabilities': 'exposed as KordioLedger#capabilities',
  'POST /api/v1/inbound/sources/{token}': 'inbound receiver endpoint, called by third parties',
  'POST /api/v1/tenants/me/anonymize': 'destructive tenant operation, use client.request()',
  'DELETE /api/v1/transactions/{id}':
    'documented 405, the ledger is append-only; use transactions.reverse',
}

const COVERED_BY: Record<string, string> = {
  'POST /v1/cosign/verify': 'CosignResource#verify',
  'POST /v1/cosign/consume': 'CosignResource#consume',
  'GET /v1/workspaces/{workspace_slug}/action_intents': 'ApprovalQueue#list',
  'GET /v1/workspaces/{workspace_slug}/action_intents/{id}': 'ApprovalQueue#get',
  'GET /v1/workspaces/{workspace_slug}/action_intents/{id}/impact': 'ApprovalQueue#impact',
  'POST /v1/workspaces/{workspace_slug}/action_intents/{id}/approve': 'ApprovalQueue#approve',
  'POST /v1/workspaces/{workspace_slug}/action_intents/{id}/deny': 'ApprovalQueue#deny',
  'GET /v1/workspaces/{workspace_slug}/payment_intents': 'ApprovalQueue#list',
  'GET /v1/workspaces/{workspace_slug}/payment_intents/{id}': 'ApprovalQueue#get',
  'GET /v1/workspaces/{workspace_slug}/payment_intents/{id}/impact': 'ApprovalQueue#impact',
  'POST /v1/workspaces/{workspace_slug}/payment_intents/{id}/approve': 'ApprovalQueue#approve',
  'POST /v1/workspaces/{workspace_slug}/payment_intents/{id}/deny': 'ApprovalQueue#deny',
}

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full))
      continue
    }
    if (!entry.endsWith('.ts') || entry === 'generated.ts') continue
    out.push(full)
  }
  return out
}

function normalize(path: string): string {
  return path.replace(/\$\{[^}]*\}/g, '{}').replace(/\{[^}]*\}/g, '{}')
}

const callPattern =
  /(?:unwrap|raw|request)\s*(?:<[^(]*?>)?\s*\(\s*(?:'|")([A-Z]+)(?:'|")\s*,\s*(?:this\.base\(\s*)?(?:'([^']*)'|`([^`]*)`)/g
const pagePattern = /this\.page\s*(?:<[^(]*?>)?\s*\(\s*(?:this\.base\(\s*)?(?:'([^']*)'|`([^`]*)`)/g

function collectCalls(): Set<string> {
  const found = new Set<string>()
  for (const file of sourceFiles(join(REPO_ROOT, 'src'))) {
    const text = Bun.file(file).text()
    const source = require('node:fs').readFileSync(file, 'utf8') as string
    void text
    const scoped = source.includes('extends ScopedResource') || source.includes('this.base(')

    const record = (method: string, raw: string) => {
      if (!raw) return
      const isSuffix = !(!raw.startsWith('/v1/') && !raw.startsWith('/'))
      if (!isSuffix) return
      const direct = normalize(raw)
      found.add(`${method} ${direct}`)
      if (scoped && !raw.startsWith('/v1/')) {
        found.add(`${method} ${normalize(`/v1/workspaces/{}${raw}`)}`)
      }
    }

    for (const match of source.matchAll(callPattern)) {
      record(match[1] as string, (match[2] ?? match[3] ?? '') as string)
    }
    for (const match of source.matchAll(pagePattern)) {
      record('GET', (match[1] ?? match[2] ?? '') as string)
    }

    for (const match of source.matchAll(/this\.base\(\s*`([^`]*)`\s*\)/g)) {
      const suffix = match[1] ?? ''
      found.add(`ANY ${normalize(`/v1/workspaces/{}${suffix}`)}`)
    }
    for (const match of source.matchAll(/this\.base\(\s*'([^']*)'\s*\)/g)) {
      const suffix = match[1] ?? ''
      found.add(`ANY ${normalize(`/v1/workspaces/{}${suffix}`)}`)
    }
  }
  return found
}

const ALL_SOURCE = sourceFiles(join(REPO_ROOT, 'src'))
  .map((file) => require('node:fs').readFileSync(file, 'utf8') as string)
  .join('\n')

function symbolExists(reference: string): boolean {
  const [cls, member] = reference.split('#')
  if (!cls) return false
  if (!ALL_SOURCE.includes(`class ${cls}`)) return false
  if (!member) return true
  return new RegExp(`\\b(async\\s+)?${member}\\s*[(<]`).test(ALL_SOURCE)
}

const covered = collectCalls()
const missing: string[] = []
let total = 0

for (const spec of SPECS) {
  const doc = YAML.parse(await Bun.file(spec.vendored).text()) as {
    paths: Record<string, Record<string, unknown>>
  }
  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    for (const method of METHODS) {
      if (!item[method]) continue
      total++
      const key = `${method.toUpperCase()} ${path}`
      if (INTENTIONALLY_UNWRAPPED[key]) continue
      const declared = COVERED_BY[key]
      if (declared) {
        if (!symbolExists(declared)) {
          missing.push(
            `${spec.name.padEnd(8)} ${key}  (COVERED_BY names ${declared}, which no longer exists)`,
          )
        }
        continue
      }
      const normalized = `${method.toUpperCase()} ${normalize(path)}`
      const anyKey = `ANY ${normalize(path)}`
      if (covered.has(normalized) || covered.has(anyKey)) continue
      missing.push(`${spec.name.padEnd(8)} ${key}`)
    }
  }
}

const wrapped = total - missing.length - Object.keys(INTENTIONALLY_UNWRAPPED).length
console.log(`Operations in specs:      ${total}`)
console.log(`Wrapped by a method:      ${wrapped}`)
console.log(`Deliberately unwrapped:   ${Object.keys(INTENTIONALLY_UNWRAPPED).length}`)
console.log(`Declared via COVERED_BY:  ${Object.keys(COVERED_BY).length}`)
console.log(`Unwrapped and unexplained: ${missing.length}`)

if (missing.length > 0) {
  console.error('\nThese operations exist in the specs but no SDK method calls them:\n')
  for (const line of missing) console.error(`  ${line}`)
  console.error(
    '\nAdd a resource method for each, or record why not in INTENTIONALLY_UNWRAPPED\n' +
      'in scripts/check-coverage.ts.',
  )
  process.exit(1)
}

console.log('\nEvery operation in both specs is reachable from a typed SDK method.')

import YAML from 'yaml'
import { SPECS } from './specs'

const BASE = process.env.KORDIO_BASE_URL ?? 'https://api.kordio.io'
const PLACEHOLDER = 'route-probe'

const PUBLIC_BY_DESIGN: Record<string, string> = {
  'GET /healthz': 'liveness, answers 200',
  'GET /.well-known/jwks.json': 'verifiers fetch it without a credential',
  'GET /.well-known/oauth-authorization-server': 'discovery document',
  'POST /oauth/token': 'rejects the credential, not the route',
  'POST /control/v1/cosign/verify': 'verification needs no credential',
  'POST /control/v1/cosign/consume': 'verification needs no credential',
  'POST /ledger/v1/inbound/sources/{token}': 'unknown token is a real 404, not a missing route',
}

const ROUTE_EXISTS = new Set([200, 201, 202, 400, 401, 403, 405, 409, 415, 422, 429])

function concrete(path: string): string {
  return path.replace(/\{[^}]+\}/g, PLACEHOLDER)
}

async function probe(method: string, path: string) {
  const res = await fetch(`${BASE}${concrete(path)}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'GET' || method === 'HEAD' ? undefined : '{}',
    redirect: 'manual',
  })
  return res.status
}

const missing: string[] = []
const unexpected: string[] = []
let checked = 0
let skipped = 0

for (const spec of SPECS) {
  const doc = YAML.parse(await Bun.file(spec.vendored).text()) as {
    paths: Record<string, Record<string, unknown>>
  }

  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
      if (!item[method]) continue
      const key = `${method.toUpperCase()} ${path}`

      if (PUBLIC_BY_DESIGN[key]) {
        skipped++
        continue
      }

      checked++
      const status = await probe(method.toUpperCase(), path)

      if (status === 404) {
        missing.push(`${spec.name.padEnd(8)} ${key}`)
      } else if (!ROUTE_EXISTS.has(status)) {
        unexpected.push(`${spec.name.padEnd(8)} ${key} -> ${status}`)
      }
    }
  }
}

console.log(`Base:              ${BASE}`)
console.log(`Routes probed:     ${checked}`)
console.log(`Public by design:  ${skipped}`)
console.log(`Answering:         ${checked - missing.length - unexpected.length}`)
console.log(`Missing (404):     ${missing.length}`)

if (unexpected.length > 0) {
  console.log('\nAnswered with a status that does not prove the route exists:')
  for (const line of unexpected) console.log(`  ${line}`)
}

if (missing.length > 0) {
  console.error('\nDocumented in the spec, absent from the running API:\n')
  for (const line of missing) console.error(`  ${line}`)
  console.error(
    '\nEither the spec is wrong or the deploy is behind. An unauthenticated\n' +
      'request gets 401 from a route that exists, so a 404 here means the path\n' +
      'is not served at all.',
  )
  process.exit(1)
}

console.log('\nEvery documented path is served by the running API.')

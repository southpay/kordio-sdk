import { join } from 'node:path'

export type SpecName = 'ledger' | 'control'

export interface SpecSource {
  name: SpecName
  docsPath: string
  url: string
  vendored: string
  generated: string
  title: string
}

export const REPO_ROOT = join(import.meta.dir, '..')

export const DOCS_REPO = process.env.KORDIO_DOCS_REPO ?? join(REPO_ROOT, '..', 'docs-kordio')

export const SPECS: SpecSource[] = [
  {
    name: 'ledger',
    docsPath: 'ledger/api-reference/openapi.yaml',
    url: 'https://docs.kordio.io/ledger/api-reference/openapi.yaml',
    vendored: join(REPO_ROOT, 'specs', 'ledger.openapi.yaml'),
    generated: join(REPO_ROOT, 'src', 'ledger', 'generated.ts'),
    title: 'Kordio Ledger API',
  },
  {
    name: 'control',
    docsPath: 'agents/api-reference/openapi.yaml',
    url: 'https://docs.kordio.io/agents/api-reference/openapi.yaml',
    vendored: join(REPO_ROOT, 'specs', 'control.openapi.yaml'),
    generated: join(REPO_ROOT, 'src', 'control', 'generated.ts'),
    title: 'Kordio Agent Control API',
  },
]

export function specByName(name: string): SpecSource {
  const found = SPECS.find((s) => s.name === name)
  if (!found)
    throw new Error(`unknown spec "${name}" (expected: ${SPECS.map((s) => s.name).join(', ')})`)
  return found
}

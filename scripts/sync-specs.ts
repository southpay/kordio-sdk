import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { DOCS_REPO, SPECS } from './specs'

const useUrl = process.argv.includes('--from-url')

async function read(spec: (typeof SPECS)[number]): Promise<string> {
  if (useUrl) {
    const res = await fetch(spec.url)
    if (!res.ok) throw new Error(`GET ${spec.url} -> ${res.status}`)
    return await res.text()
  }
  const path = join(DOCS_REPO, spec.docsPath)
  if (!existsSync(path)) {
    throw new Error(
      `spec not found at ${path}\n` +
        `Set KORDIO_DOCS_REPO to your docs-kordio checkout, or run with --from-url.`,
    )
  }
  return await Bun.file(path).text()
}

let changed = 0

for (const spec of SPECS) {
  const next = await read(spec)
  const prev = existsSync(spec.vendored) ? await Bun.file(spec.vendored).text() : null
  if (prev === next) {
    console.log(`  unchanged  ${spec.name}`)
    continue
  }
  await Bun.write(spec.vendored, next)
  console.log(`  ${prev === null ? 'added' : 'updated'} ${spec.name}`)
  changed++
}

console.log(
  changed === 0
    ? '\nSpecs already up to date.'
    : `\n${changed} spec(s) synced. Run \`bun run generate\` next.`,
)

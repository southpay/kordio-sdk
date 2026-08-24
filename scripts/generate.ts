import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import { SPECS } from './specs'

const check = process.argv.includes('--check')

const BANNER = (title: string, source: string) =>
  [
    '/**',
    ` * ${title}`,
    ' *',
    ' * DO NOT EDIT. Generated from the OpenAPI spec.',
    ` * Source: specs/${source}`,
    ' * Regenerate: bun run generate',
    ' */',
    '',
    '/* biome-ignore-all lint: generated file */',
    '',
  ].join('\n')

let stale = 0

for (const spec of SPECS) {
  if (!existsSync(spec.vendored)) {
    throw new Error(`missing ${spec.vendored}. Run \`bun run sync\` first.`)
  }

  const ast = await openapiTS(pathToFileURL(spec.vendored), {
    alphabetize: true,
    emptyObjectsUnknown: true,
    excludeDeprecated: false,
    additionalProperties: false,
  })

  const next = `${BANNER(spec.title, `${spec.name}.openapi.yaml`)}${astToString(ast)}`
  const prev = existsSync(spec.generated) ? await Bun.file(spec.generated).text() : null

  if (prev === next) {
    console.log(`  up to date  ${spec.name}`)
    continue
  }

  if (check) {
    console.error(`  STALE       ${spec.name} -> ${spec.generated}`)
    stale++
    continue
  }

  await Bun.write(spec.generated, next)
  console.log(`  generated   ${spec.name} -> ${spec.generated}`)
}

if (stale > 0) {
  console.error(
    `\n${stale} generated file(s) are out of date with specs/.\n` +
      'Run `bun run generate` and commit the result.',
  )
  process.exit(1)
}

if (check) console.log('\nGenerated types match the specs.')

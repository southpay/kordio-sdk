export function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = value
  }
  return out as Partial<T>
}

export function isoDate(value: Date | string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) return value
  return value instanceof Date ? value.toISOString() : value
}

type Primitive = string | number | boolean | null

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const sortObjectKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = obj[key]
      acc[key] = normalizeValue(value)
      return acc
    }, {})
}

const normalizeValue = (value: unknown): unknown => {
  if (isPlainObject(value)) {
    return sortObjectKeys(value)
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry))
  }
  return value as Primitive
}

export const stableSerialize = (value: unknown): string => {
  const normalized = normalizeValue(value)
  return JSON.stringify(normalized, null, 2)
}

export const normalizeForSnapshot = <T>(value: T): T => normalizeValue(value) as T

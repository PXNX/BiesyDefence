let idSeed = 0

export const createEntityId = (prefix: string) => {
  idSeed += 1
  return `${prefix}-${idSeed}`
}

export const resetIdSeed = () => {
  idSeed = 0
}

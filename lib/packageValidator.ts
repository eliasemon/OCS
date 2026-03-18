const ID_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]*\.[A-Za-z0-9][A-Za-z0-9._-]*$/
const MAX_IDS = 50
const MAX_ID_LENGTH = 100

export function validatePackageIds(
  ids: string[],
  catalogIds: string[]
): { valid: string[]; invalid: string[] } {
  const catalogSet = new Set(catalogIds)
  const seen = new Set<string>()
  const valid: string[] = []
  const invalid: string[] = []

  for (const id of ids.slice(0, MAX_IDS)) {
    if (id.length > MAX_ID_LENGTH) { invalid.push(id); continue }

    // Security: Reject IDs with non-ASCII characters to prevent homograph attacks
    // Unicode lookalikes could be used to trick users (e.g., "Git中文.Git" → "Git.Git")
    if (/[^\x00-\x7F]/.test(id)) {
      invalid.push(id)
      continue
    }

    const sanitized = id.replace(/[^A-Za-z0-9._-]/g, "")
    if (!ID_REGEX.test(sanitized)) { invalid.push(id); continue }
    if (!catalogSet.has(sanitized)) { invalid.push(sanitized); continue }
    if (!seen.has(sanitized)) {
      seen.add(sanitized)
      valid.push(sanitized)
    }
  }

  return { valid, invalid }
}

export function isValidPackageId(id: string, catalogIds: string[]): boolean {
  return validatePackageIds([id], catalogIds).valid.length === 1
}

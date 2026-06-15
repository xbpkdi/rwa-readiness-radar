import { keccak256, stringToBytes } from 'viem'
import type { CanonicalReport } from '@/domain/types'

/**
 * Canonicalization rules:
 *
 * 1. Object keys sorted alphabetically at every level (recursive)
 * 2. Strings: trimmed and \r\n normalized to \n
 * 3. URLs: trailing slashes stripped, lowercased scheme+host only
 * 4. Ethereum addresses: lowercased (0x + lowercase hex)
 * 5. undefined values: excluded (treated as absent)
 * 6. null values: preserved
 * 7. Arrays: order preserved for semantic arrays (evidence, riskFlags, versionHistory)
 *            sorted by deterministic key for non-semantic arrays (supportedRegions, evidenceIds)
 * 8. reportHash (if present) is excluded from canonicalization to avoid circular reference
 *
 * Order-sensitive arrays (order preserved):
 *   - evidence: sorted by dimension ASC, title ASC, id ASC (deterministic)
 *   - riskFlags: sorted by severity DESC (high→medium→low), then category ASC, then id ASC
 *
 * Order-insensitive arrays (sorted):
 *   - evidenceIds: sorted alphanumerically
 */

const EXCLUDED_KEYS = new Set(['reportHash'])

function normalizeString(s: string): string {
  return s.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  try {
    const u = new URL(trimmed)
    // Lowercase scheme and host; preserve path, search, hash as-is
    u.protocol = u.protocol.toLowerCase()
    u.hostname = u.hostname.toLowerCase()
    // Strip trailing slash from pathname only when it's the root
    if (u.pathname === '/') u.pathname = '/'
    else u.pathname = u.pathname.replace(/\/+$/, '')
    return u.toString()
  } catch {
    return trimmed
  }
}

function normalizeAddress(address: string): string {
  const trimmed = address.trim()
  if (!trimmed) return ''
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return trimmed.toLowerCase()
  return trimmed
}

function isUrlKey(key: string): boolean {
  return key === 'sourceUrl' || key.toLowerCase().endsWith('url') || key.toLowerCase().endsWith('link')
}

function isAddressKey(key: string): boolean {
  return key === 'contractAddress' || key === 'publisher' || key === 'publisherAddress'
}

function sortObjectKeys<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(sortObjectKeys) as unknown as T
  if (typeof obj !== 'object') return obj
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
    if (EXCLUDED_KEYS.has(key)) continue
    const value = (obj as Record<string, unknown>)[key]
    if (value === undefined) continue
    sorted[key] = sortObjectKeys(value)
  }
  return sorted as T
}

function normalizeStrings(obj: unknown, parentKey = ''): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') {
    if (isUrlKey(parentKey)) return normalizeUrl(obj)
    if (isAddressKey(parentKey)) return normalizeAddress(obj)
    return normalizeString(obj)
  }
  if (Array.isArray(obj)) return obj.map((item) => normalizeStrings(item, parentKey))
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = normalizeStrings(value, key)
    }
    return result
  }
  return obj
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function sortSemanticArrays(report: CanonicalReport): CanonicalReport {
  const result = { ...report }

  if (result.evidence) {
    result.evidence = [...result.evidence].sort((a, b) => {
      const dimCmp = a.dimension.localeCompare(b.dimension)
      if (dimCmp !== 0) return dimCmp
      const titleCmp = a.title.localeCompare(b.title)
      if (titleCmp !== 0) return titleCmp
      return a.id.localeCompare(b.id)
    })
  }

  if (result.riskFlags) {
    result.riskFlags = [...result.riskFlags].sort((a, b) => {
      const sevA = SEVERITY_ORDER[a.severity] ?? 99
      const sevB = SEVERITY_ORDER[b.severity] ?? 99
      if (sevA !== sevB) return sevA - sevB
      const catCmp = a.category.localeCompare(b.category)
      if (catCmp !== 0) return catCmp
      return a.id.localeCompare(b.id)
    })
  }

  // Sort evidenceIds within each adjusted score (order-insensitive)
  if (result.scoring) {
    const scoring = { ...result.scoring }
    if (scoring.adjustedTrustDimensions) {
      const dims = { ...scoring.adjustedTrustDimensions }
      for (const key of Object.keys(dims) as (keyof typeof dims)[]) {
        dims[key] = { ...dims[key], evidenceIds: [...dims[key].evidenceIds].sort() }
      }
      scoring.adjustedTrustDimensions = dims
    }
    if (scoring.adjustedReadiness) {
      const ar = { ...scoring.adjustedReadiness }
      for (const key of Object.keys(ar) as (keyof typeof ar)[]) {
        ar[key] = { ...ar[key], evidenceIds: [...ar[key].evidenceIds].sort() }
      }
      scoring.adjustedReadiness = ar
    }
    result.scoring = scoring
  }

  return result
}

/**
 * Produce a canonical, normalized representation of the report.
 * This is deterministic: same meaningful content always produces the same result.
 * Does not mutate the input.
 */
export function canonicalizeReport(report: CanonicalReport): CanonicalReport {
  // 1. Sort semantic arrays (evidence, riskFlags, evidenceIds)
  const withSortedArrays = sortSemanticArrays(report)
  // 2. Normalize strings (trim, normalize whitespace, normalize URLs and addresses)
  const withNormalizedStrings = normalizeStrings(withSortedArrays) as CanonicalReport
  // 3. Sort object keys recursively (ensures insertion-order independence)
  const withSortedKeys = sortObjectKeys(withNormalizedStrings)
  return withSortedKeys
}

/**
 * Serialize a canonical report to a deterministic JSON string.
 * The report should be canonicalized first via canonicalizeReport().
 */
export function serializeCanonicalReport(report: CanonicalReport): string {
  return JSON.stringify(report)
}

/**
 * Hash a canonical report using keccak256 via viem.
 * Returns a 0x-prefixed 32-byte hex string.
 *
 * Algorithm:
 *   1. Canonicalize the report (sort keys, normalize strings, sort semantic arrays)
 *   2. Serialize to JSON
 *   3. Encode as UTF-8 bytes
 *   4. keccak256(bytes)
 */
export function hashCanonicalReport(report: CanonicalReport): `0x${string}` {
  const canonical = canonicalizeReport(report)
  const serialized = serializeCanonicalReport(canonical)
  return keccak256(stringToBytes(serialized))
}

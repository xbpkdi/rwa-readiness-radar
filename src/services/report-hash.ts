import type { CanonicalReport } from '@/domain/types'
import { hashCanonicalReport } from '@/utils/canonical-report'

/**
 * ReportHashService — synchronous keccak256 hashing of a canonical report.
 *
 * Uses viem's keccak256 + stringToBytes. No server, no blockchain, no randomness.
 * The same report content always produces the same hash.
 */
export function computeReportHash(report: CanonicalReport): `0x${string}` {
  return hashCanonicalReport(report)
}

/**
 * Pure encoding utilities for RWAReadinessRegistry contract calls.
 *
 * PROJECT ID RULE:
 *   projectIdBytes32 = keccak256(UTF-8 bytes of lowercase-trimmed project slug)
 *   Normalization: trim whitespace, convert to lowercase.
 *   This matches the rule documented in RWAReadinessRegistry.sol.
 *
 * No transactions are sent here. All functions are pure and synchronous.
 */

import { keccak256, stringToBytes, isHex, size } from 'viem'
import type { CanonicalReport } from '@/domain/types'
import { gradeToUint8 } from '@/config/contracts'

export class ContractEncodingError extends Error {
  readonly field?: string
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ContractEncodingError'
    this.field = field
  }
}

/**
 * Derives the on-chain bytes32 projectId from a project slug string.
 *
 * Rule: keccak256(UTF-8 bytes of trim(slug).toLowerCase())
 *
 * @throws ContractEncodingError if input is empty after trimming
 */
export function deriveProjectId(projectSlug: string): `0x${string}` {
  const normalized = projectSlug.trim().toLowerCase()
  if (normalized.length === 0) {
    throw new ContractEncodingError(
      'projectId must not be empty after trimming',
      'projectSlug',
    )
  }
  return keccak256(stringToBytes(normalized))
}

function validateScore(value: number, name: string): number {
  const rounded = Math.round(value)
  if (!Number.isFinite(rounded) || rounded < 0 || rounded > 100) {
    throw new ContractEncodingError(
      `${name} must be an integer in [0, 100], got ${value}`,
      name,
    )
  }
  return rounded
}

function validateReportHash(hash: `0x${string}`): void {
  if (!isHex(hash)) {
    throw new ContractEncodingError('reportHash must be a 0x-prefixed hex string', 'reportHash')
  }
  if (size(hash) !== 32) {
    throw new ContractEncodingError(
      `reportHash must be exactly 32 bytes (got ${size(hash)})`,
      'reportHash',
    )
  }
  if (hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    throw new ContractEncodingError('reportHash must not be zero bytes32', 'reportHash')
  }
}

/**
 * Converts a CanonicalReport and its keccak256 hash into the ordered argument
 * tuple for publishReport on the RWAReadinessRegistry contract.
 *
 * Return order matches the contract function signature:
 *   (projectId, reportHash, trustScore, supplyScore, distributionScore,
 *    utilityScore, overallReadinessScore, grade, version)
 *
 * No transaction is sent. The caller is responsible for sending the transaction in Phase 5.
 *
 * @throws ContractEncodingError on any invalid input
 */
export function toPublishReportArgs(
  report: CanonicalReport,
  reportHash: `0x${string}`,
): readonly [
  `0x${string}`, // projectId bytes32
  `0x${string}`, // reportHash bytes32
  number,        // trustScore uint16
  number,        // supplyScore uint16
  number,        // distributionScore uint16
  number,        // utilityScore uint16
  number,        // overallReadinessScore uint16
  number,        // grade uint8
  number,        // version uint32
] {
  validateReportHash(reportHash)

  if (!report.projectId || report.projectId.trim() === '') {
    throw new ContractEncodingError('report.projectId must not be empty', 'projectId')
  }
  if (!report.version || report.version < 1 || !Number.isInteger(report.version)) {
    throw new ContractEncodingError(
      `report.version must be a positive integer, got ${report.version}`,
      'version',
    )
  }
  if (!report.scoring) {
    throw new ContractEncodingError('report.scoring must be present', 'scoring')
  }
  if (!report.scoring.grade) {
    throw new ContractEncodingError('report.scoring.grade must be present', 'grade')
  }

  const projectIdBytes32 = deriveProjectId(report.projectId)
  const trustScore = validateScore(report.scoring.trustScore, 'trustScore')
  const supplyScore = validateScore(report.scoring.supplyScore, 'supplyScore')
  const distributionScore = validateScore(report.scoring.distributionScore, 'distributionScore')
  const utilityScore = validateScore(report.scoring.utilityScore, 'utilityScore')
  const overallReadinessScore = validateScore(report.scoring.overallScore, 'overallScore')
  const grade = gradeToUint8(report.scoring.grade)

  return [
    projectIdBytes32,
    reportHash,
    trustScore,
    supplyScore,
    distributionScore,
    utilityScore,
    overallReadinessScore,
    grade,
    report.version,
  ] as const
}

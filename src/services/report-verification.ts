import { computeReportHash } from './report-hash'
import { deriveProjectId } from '@/utils/contract-encoding'
import type { CanonicalReport } from '@/domain/types'
import { uint8ToGrade } from '@/config/contracts'

export type VerificationState =
  | 'verified'
  | 'hash-mismatch'
  | 'score-mismatch'
  | 'version-mismatch'
  | 'project-mismatch'
  | 'not-published'
  | 'registry-unavailable'
  | 'wrong-network'
  | 'rpc-error'

export interface VerificationResult {
  state: VerificationState
  message: string
  localHash?: `0x${string}`
  onChainHash?: string
  details?: string
}

export interface OnChainSnapshot {
  projectId: `0x${string}`
  reportHash: `0x${string}`
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallReadinessScore: number
  grade: number
  version: number
  publisher: `0x${string}`
  publishedAt: bigint
}

export function verifyReportAgainstSnapshot(
  report: CanonicalReport,
  snapshot: OnChainSnapshot,
): VerificationResult {
  const localHash = computeReportHash(report)
  const localProjectId = deriveProjectId(report.projectId)

  if (localProjectId.toLowerCase() !== snapshot.projectId.toLowerCase()) {
    return {
      state: 'project-mismatch',
      message: 'Project ID does not match on-chain snapshot.',
      localHash,
      onChainHash: snapshot.reportHash,
    }
  }

  if (localHash.toLowerCase() !== snapshot.reportHash.toLowerCase()) {
    return {
      state: 'hash-mismatch',
      message: 'Report content has changed since publication.',
      localHash,
      onChainHash: snapshot.reportHash,
      details: 'The local keccak256 hash does not match the hash stored on-chain.',
    }
  }

  if (report.version !== snapshot.version) {
    return {
      state: 'version-mismatch',
      message: `Version mismatch: local v${report.version}, on-chain v${snapshot.version}.`,
      localHash,
    }
  }

  const scoring = report.scoring
  if (
    scoring &&
    (Math.round(scoring.trustScore) !== snapshot.trustScore ||
      Math.round(scoring.supplyScore) !== snapshot.supplyScore ||
      Math.round(scoring.distributionScore) !== snapshot.distributionScore ||
      Math.round(scoring.utilityScore) !== snapshot.utilityScore ||
      Math.round(scoring.overallScore) !== snapshot.overallReadinessScore)
  ) {
    let onChainGrade = '?'
    try { onChainGrade = uint8ToGrade(snapshot.grade) } catch { /* ignore */ }
    return {
      state: 'score-mismatch',
      message: `Scores differ from on-chain record. On-chain grade: ${onChainGrade}.`,
      localHash,
      details: 'The report content is unchanged (hashes match) but scores in the local view differ from what was published.',
    }
  }

  return {
    state: 'verified',
    message: 'Verified match — this report matches the on-chain snapshot.',
    localHash,
    onChainHash: snapshot.reportHash,
  }
}

export function notPublishedResult(): VerificationResult {
  return {
    state: 'not-published',
    message: 'This project has not been published to Avalanche Fuji.',
  }
}

export function registryUnavailableResult(reason?: string): VerificationResult {
  return {
    state: 'registry-unavailable',
    message: 'Registry contract is not configured.',
    details: reason,
  }
}

export function rpcErrorResult(reason?: string): VerificationResult {
  return {
    state: 'rpc-error',
    message: 'Could not read from registry. Check your network connection.',
    details: reason,
  }
}

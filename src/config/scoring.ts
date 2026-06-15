import type { EvidenceStatus } from '@/domain/types'

/**
 * Overall RWA Readiness Score weights.
 * Provisional weights for the initial methodology phase.
 * These are the only values that need to change to update the formula.
 */
export const OVERALL_SCORE_WEIGHTS = {
  trust: 0.40,
  supply: 0.20,
  distribution: 0.20,
  utility: 0.20,
} as const satisfies Record<string, number>

/**
 * Maximum points per Trust Foundation dimension.
 * All Trust dimensions sum to 100.
 */
export const TRUST_DIMENSION_MAXIMUMS = {
  legalClarity: 15,
  custodyTransparency: 15,
  assetBacking: 15,
  redemptionProcess: 10,
  compliance: 15,
  issuerCredibility: 10,
  smartContractTransparency: 10,
  liquidityRisk: 10,
} as const

export const TRUST_DIMENSION_LABELS: Record<keyof typeof TRUST_DIMENSION_MAXIMUMS, string> = {
  legalClarity: 'Legal Clarity',
  custodyTransparency: 'Custody Transparency',
  assetBacking: 'Asset Backing',
  redemptionProcess: 'Redemption Process',
  compliance: 'Compliance',
  issuerCredibility: 'Issuer Credibility',
  smartContractTransparency: 'Smart Contract Transparency',
  liquidityRisk: 'Liquidity Risk',
}

/**
 * Maximum points per Market Readiness dimension.
 * Each dimension scores independently out of 100.
 */
export const READINESS_DIMENSION_MAXIMUMS = {
  supplyReadiness: 100,
  distributionReadiness: 100,
  utilityReadiness: 100,
} as const

export const READINESS_DIMENSION_LABELS: Record<keyof typeof READINESS_DIMENSION_MAXIMUMS, string> = {
  supplyReadiness: 'Supply Readiness',
  distributionReadiness: 'Distribution Readiness',
  utilityReadiness: 'Utility Readiness',
}

/**
 * Grade bands. Applied to any score out of 100.
 */
export const GRADE_BANDS = [
  { grade: 'A', min: 85, max: 100, label: 'Strong readiness', color: 'success' },
  { grade: 'B', min: 70, max: 84, label: 'Moderate readiness', color: 'azure' },
  { grade: 'C', min: 50, max: 69, label: 'Developing', color: 'warning' },
  { grade: 'D', min: 0, max: 49, label: 'Insufficient', color: 'avax' },
] as const

export type Grade = 'A' | 'B' | 'C' | 'D'

/**
 * Evidence status score caps.
 * When the majority of evidence for a dimension is at this status,
 * confidence in the score is reduced.
 */
export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  verified: 'Verified',
  partial: 'Partial Evidence',
  missing: 'Missing Evidence',
  'manual-review': 'Needs Review',
}

export const EVIDENCE_STATUS_ORDER: EvidenceStatus[] = [
  'verified',
  'partial',
  'manual-review',
  'missing',
]

/**
 * Evidence status score caps.
 * maximumAllowedScore = floor(maximumScore × evidenceCap)
 * adjustedScore = min(rawScore, maximumAllowedScore)
 *
 * Rounding strategy: floor (Math.floor) — conservative, never rounds up.
 */
export const EVIDENCE_CAPS: Record<EvidenceStatus, number> = {
  verified: 1.00,
  partial: 0.70,
  'manual-review': 0.50,
  missing: 0.25,
} as const

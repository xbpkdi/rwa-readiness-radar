import {
  OVERALL_SCORE_WEIGHTS,
  TRUST_DIMENSION_MAXIMUMS,
  READINESS_DIMENSION_MAXIMUMS,
  GRADE_BANDS,
  EVIDENCE_CAPS,
  type Grade,
} from '@/config/scoring'
import type {
  TrustDimensions,
  TrustDimensionKey,
  ReadinessScores,
  EvidenceStatus,
  EvidenceAdjustedDimensionScore,
  ScoringResult,
  TrustDimensionEvidenceStatus,
  ReadinessEvidenceStatus,
  EvidenceItem,
} from '@/domain/types'

export function computeTrustScore(dims: TrustDimensions): number {
  const total =
    dims.legalClarity +
    dims.custodyTransparency +
    dims.assetBacking +
    dims.redemptionProcess +
    dims.compliance +
    dims.issuerCredibility +
    dims.smartContractTransparency +
    dims.liquidityRisk

  const max = Object.values(TRUST_DIMENSION_MAXIMUMS).reduce((a, b) => a + b, 0)
  return Math.round((total / max) * 100)
}

export function computeSupplyScore(r: ReadinessScores): number {
  return Math.round(r.supplyReadiness)
}

export function computeDistributionScore(r: ReadinessScores): number {
  return Math.round(r.distributionReadiness)
}

export function computeUtilityScore(r: ReadinessScores): number {
  return Math.round(r.utilityReadiness)
}

/**
 * Computes the Overall RWA Readiness Score using the configurable weights
 * in src/config/scoring.ts. To change the formula, update those weights.
 */
export function computeOverallScore(
  trustScore: number,
  supplyScore: number,
  distributionScore: number,
  utilityScore: number,
): number {
  const { trust, supply, distribution, utility } = OVERALL_SCORE_WEIGHTS
  return Math.round(
    trustScore * trust +
    supplyScore * supply +
    distributionScore * distribution +
    utilityScore * utility,
  )
}

export function gradeFor(score: number): { grade: Grade; label: string; color: string } {
  for (const band of GRADE_BANDS) {
    if (score >= band.min && score <= band.max) {
      return { grade: band.grade, label: band.label, color: band.color }
    }
  }
  return { grade: 'D', label: 'Insufficient', color: 'avax' }
}

export function allScores(dims: TrustDimensions, readiness: ReadinessScores) {
  const trustScore = computeTrustScore(dims)
  const supplyScore = computeSupplyScore(readiness)
  const distributionScore = computeDistributionScore(readiness)
  const utilityScore = computeUtilityScore(readiness)
  const overallScore = computeOverallScore(trustScore, supplyScore, distributionScore, utilityScore)
  return { trustScore, supplyScore, distributionScore, utilityScore, overallScore }
}

// ─── Evidence-aware scoring ───────────────────────────────────────────────────

/**
 * Apply evidence cap to a single dimension score.
 *
 * maximumAllowedScore = Math.floor(maximumScore × evidenceCap)
 * adjustedScore = Math.min(rawScore, maximumAllowedScore)
 *
 * Rounding: floor — conservative, never rounds up.
 */
export function applyEvidenceCap(
  rawScore: number,
  maximumScore: number,
  evidenceStatus: EvidenceStatus,
  evidenceIds: string[] = [],
): EvidenceAdjustedDimensionScore {
  const evidenceCap = EVIDENCE_CAPS[evidenceStatus]
  const maximumAllowedScore = Math.floor(maximumScore * evidenceCap)
  const adjustedScore = Math.min(rawScore, maximumAllowedScore)

  let explanation: string
  if (adjustedScore === rawScore) {
    if (evidenceStatus === 'verified') {
      explanation = 'Full score supported by verified evidence.'
    } else {
      explanation = `Raw score (${rawScore}) is within the ${Math.round(evidenceCap * 100)}% cap for ${evidenceStatus} evidence.`
    }
  } else {
    explanation = `Reduced from ${rawScore} to ${adjustedScore}. Evidence is ${evidenceStatus} — cap is ${Math.round(evidenceCap * 100)}% of max ${maximumScore} = ${maximumAllowedScore}.`
  }

  return {
    rawScore,
    maximumScore,
    evidenceStatus,
    evidenceCap,
    maximumAllowedScore,
    adjustedScore,
    explanation,
    evidenceIds,
  }
}

/**
 * Infer the evidence status for a dimension from the evidence array.
 * Uses the worst (most conservative) status among matching items.
 * Returns 'missing' if no evidence items match.
 */
export function inferDimensionEvidenceStatus(
  evidence: EvidenceItem[],
  dimension: string,
): EvidenceStatus {
  const items = evidence.filter((e) => e.dimension === dimension)
  if (items.length === 0) return 'missing'
  const order: EvidenceStatus[] = ['missing', 'manual-review', 'partial', 'verified']
  let worstIdx = order.length - 1
  for (const item of items) {
    const idx = order.indexOf(item.status)
    if (idx < worstIdx) worstIdx = idx
  }
  return order[worstIdx]
}

/**
 * Compute the Trust Score from evidence-adjusted dimension scores.
 * Uses adjusted scores (not raw) and normalizes to 0–100.
 */
export function computeAdjustedTrustScore(
  adjustedDims: Record<TrustDimensionKey, EvidenceAdjustedDimensionScore>,
): number {
  const total = (Object.keys(adjustedDims) as TrustDimensionKey[]).reduce(
    (sum, key) => sum + adjustedDims[key].adjustedScore,
    0,
  )
  const max = Object.values(TRUST_DIMENSION_MAXIMUMS).reduce((a, b) => a + b, 0)
  return Math.round((total / max) * 100)
}

/**
 * Compute the full evidence-adjusted scoring result.
 * This is the canonical computation — call it once when finalizing a report.
 */
export function computeFullScoringResult(
  trustDimensions: TrustDimensions,
  trustDimensionEvidenceStatus: TrustDimensionEvidenceStatus,
  readinessScores: ReadinessScores,
  readinessEvidenceStatus: ReadinessEvidenceStatus,
  evidence: EvidenceItem[],
): ScoringResult {
  const adjustedTrustDimensions = {} as Record<TrustDimensionKey, EvidenceAdjustedDimensionScore>
  for (const key of Object.keys(TRUST_DIMENSION_MAXIMUMS) as TrustDimensionKey[]) {
    const evidenceIds = evidence.filter((e) => e.dimension === key).map((e) => e.id)
    adjustedTrustDimensions[key] = applyEvidenceCap(
      trustDimensions[key],
      TRUST_DIMENSION_MAXIMUMS[key],
      trustDimensionEvidenceStatus[key],
      evidenceIds,
    )
  }

  const supplyIds = evidence.filter((e) => e.dimension === 'supplyReadiness').map((e) => e.id)
  const distIds = evidence.filter((e) => e.dimension === 'distributionReadiness').map((e) => e.id)
  const utilIds = evidence.filter((e) => e.dimension === 'utilityReadiness').map((e) => e.id)

  const adjustedReadiness = {
    supplyReadiness: applyEvidenceCap(
      readinessScores.supplyReadiness,
      READINESS_DIMENSION_MAXIMUMS.supplyReadiness,
      readinessEvidenceStatus.supplyReadiness,
      supplyIds,
    ),
    distributionReadiness: applyEvidenceCap(
      readinessScores.distributionReadiness,
      READINESS_DIMENSION_MAXIMUMS.distributionReadiness,
      readinessEvidenceStatus.distributionReadiness,
      distIds,
    ),
    utilityReadiness: applyEvidenceCap(
      readinessScores.utilityReadiness,
      READINESS_DIMENSION_MAXIMUMS.utilityReadiness,
      readinessEvidenceStatus.utilityReadiness,
      utilIds,
    ),
  }

  const trustScore = computeAdjustedTrustScore(adjustedTrustDimensions)
  const supplyScore = Math.round(adjustedReadiness.supplyReadiness.adjustedScore)
  const distributionScore = Math.round(adjustedReadiness.distributionReadiness.adjustedScore)
  const utilityScore = Math.round(adjustedReadiness.utilityReadiness.adjustedScore)
  const overallScore = computeOverallScore(trustScore, supplyScore, distributionScore, utilityScore)
  const { grade } = gradeFor(overallScore)

  const allStatuses = [
    ...Object.values(trustDimensionEvidenceStatus),
    ...Object.values(readinessEvidenceStatus),
  ]
  const verifiedCount = allStatuses.filter((s) => s === 'verified').length
  const partialCount = allStatuses.filter((s) => s === 'partial').length
  const manualCount = allStatuses.filter((s) => s === 'manual-review').length
  const missingCount = allStatuses.filter((s) => s === 'missing').length
  const evidenceQualitySummary = `${verifiedCount} verified, ${partialCount} partial, ${manualCount} needs review, ${missingCount} missing (of ${allStatuses.length} dimensions)`

  return {
    adjustedTrustDimensions,
    adjustedReadiness,
    trustScore,
    supplyScore,
    distributionScore,
    utilityScore,
    overallScore,
    grade,
    evidenceQualitySummary,
  }
}

/**
 * Infer evidence status for all trust dimensions from an evidence array.
 * Used for existing RWAProject mock data that does not have explicit status.
 */
export function inferTrustDimensionEvidenceStatus(
  evidence: EvidenceItem[],
): TrustDimensionEvidenceStatus {
  return {
    legalClarity: inferDimensionEvidenceStatus(evidence, 'legalClarity'),
    custodyTransparency: inferDimensionEvidenceStatus(evidence, 'custodyTransparency'),
    assetBacking: inferDimensionEvidenceStatus(evidence, 'assetBacking'),
    redemptionProcess: inferDimensionEvidenceStatus(evidence, 'redemptionProcess'),
    compliance: inferDimensionEvidenceStatus(evidence, 'compliance'),
    issuerCredibility: inferDimensionEvidenceStatus(evidence, 'issuerCredibility'),
    smartContractTransparency: inferDimensionEvidenceStatus(evidence, 'smartContractTransparency'),
    liquidityRisk: inferDimensionEvidenceStatus(evidence, 'liquidityRisk'),
  }
}

/**
 * Default evidence status — all missing (conservative).
 * Used when starting a new report with no evidence.
 */
export const DEFAULT_TRUST_EVIDENCE_STATUS: TrustDimensionEvidenceStatus = {
  legalClarity: 'missing',
  custodyTransparency: 'missing',
  assetBacking: 'missing',
  redemptionProcess: 'missing',
  compliance: 'missing',
  issuerCredibility: 'missing',
  smartContractTransparency: 'missing',
  liquidityRisk: 'missing',
}

export const DEFAULT_READINESS_EVIDENCE_STATUS: ReadinessEvidenceStatus = {
  supplyReadiness: 'missing',
  distributionReadiness: 'missing',
  utilityReadiness: 'missing',
}

/**
 * Compute evidence-adjusted scores for a RWAProject using its evidence array.
 * Falls back to inferring status from the evidence array when explicit status is absent.
 */
export function computeProjectScores(project: {
  trustDimensions: TrustDimensions
  readinessScores: ReadinessScores
  evidence: EvidenceItem[]
  trustDimensionEvidenceStatus?: TrustDimensionEvidenceStatus
  readinessEvidenceStatus?: ReadinessEvidenceStatus
}): ScoringResult {
  const trustStatus =
    project.trustDimensionEvidenceStatus ?? inferTrustDimensionEvidenceStatus(project.evidence)
  const readinessStatus = project.readinessEvidenceStatus ?? {
    supplyReadiness: inferDimensionEvidenceStatus(project.evidence, 'supplyReadiness'),
    distributionReadiness: inferDimensionEvidenceStatus(project.evidence, 'distributionReadiness'),
    utilityReadiness: inferDimensionEvidenceStatus(project.evidence, 'utilityReadiness'),
  }
  return computeFullScoringResult(
    project.trustDimensions,
    trustStatus,
    project.readinessScores,
    readinessStatus,
    project.evidence,
  )
}

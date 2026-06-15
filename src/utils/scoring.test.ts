import { describe, it, expect } from 'vitest'
import {
  applyEvidenceCap,
  computeFullScoringResult,
  computeOverallScore,
  gradeFor,
} from './scoring'
import { TRUST_DIMENSION_MAXIMUMS, EVIDENCE_CAPS } from '@/config/scoring'
import type { TrustDimensions, TrustDimensionEvidenceStatus, ReadinessScores, ReadinessEvidenceStatus } from '@/domain/types'

const FULL_TRUST_DIMS: TrustDimensions = {
  legalClarity: 15,
  custodyTransparency: 15,
  assetBacking: 15,
  redemptionProcess: 10,
  compliance: 15,
  issuerCredibility: 10,
  smartContractTransparency: 10,
  liquidityRisk: 10,
}

const ALL_VERIFIED: TrustDimensionEvidenceStatus = {
  legalClarity: 'verified',
  custodyTransparency: 'verified',
  assetBacking: 'verified',
  redemptionProcess: 'verified',
  compliance: 'verified',
  issuerCredibility: 'verified',
  smartContractTransparency: 'verified',
  liquidityRisk: 'verified',
}

const ALL_MISSING: TrustDimensionEvidenceStatus = {
  legalClarity: 'missing',
  custodyTransparency: 'missing',
  assetBacking: 'missing',
  redemptionProcess: 'missing',
  compliance: 'missing',
  issuerCredibility: 'missing',
  smartContractTransparency: 'missing',
  liquidityRisk: 'missing',
}

const FULL_READINESS: ReadinessScores = {
  supplyReadiness: 100,
  distributionReadiness: 100,
  utilityReadiness: 100,
}

const ALL_VERIFIED_READINESS: ReadinessEvidenceStatus = {
  supplyReadiness: 'verified',
  distributionReadiness: 'verified',
  utilityReadiness: 'verified',
}

const ALL_MISSING_READINESS: ReadinessEvidenceStatus = {
  supplyReadiness: 'missing',
  distributionReadiness: 'missing',
  utilityReadiness: 'missing',
}

describe('applyEvidenceCap', () => {
  it('verified evidence allows full score', () => {
    const result = applyEvidenceCap(18, 20, 'verified')
    expect(result.adjustedScore).toBe(18)
    expect(result.maximumAllowedScore).toBe(20)
    expect(result.evidenceCap).toBe(EVIDENCE_CAPS.verified)
  })

  it('partial evidence caps at 70%', () => {
    const result = applyEvidenceCap(18, 20, 'partial')
    expect(result.maximumAllowedScore).toBe(14)
    expect(result.adjustedScore).toBe(14)
    expect(result.evidenceCap).toBe(0.7)
  })

  it('manual-review caps at 50%', () => {
    const result = applyEvidenceCap(18, 20, 'manual-review')
    expect(result.maximumAllowedScore).toBe(10)
    expect(result.adjustedScore).toBe(10)
    expect(result.evidenceCap).toBe(0.5)
  })

  it('missing evidence caps at 25%', () => {
    const result = applyEvidenceCap(18, 20, 'missing')
    expect(result.maximumAllowedScore).toBe(5)
    expect(result.adjustedScore).toBe(5)
    expect(result.evidenceCap).toBe(0.25)
  })

  it('raw score below cap remains unchanged', () => {
    const result = applyEvidenceCap(5, 20, 'partial')
    expect(result.adjustedScore).toBe(5)
    expect(result.rawScore).toBe(5)
    expect(result.maximumAllowedScore).toBe(14)
  })

  it('raw score above cap is reduced to maximumAllowedScore', () => {
    const result = applyEvidenceCap(18, 20, 'partial')
    expect(result.adjustedScore).toBe(14)
    expect(result.adjustedScore).toBeLessThan(result.rawScore)
  })

  it('uses floor for maximumAllowedScore (e.g. 15 * 0.7 = 10.5 → 10)', () => {
    const result = applyEvidenceCap(12, 15, 'partial')
    expect(result.maximumAllowedScore).toBe(10)
  })

  it('evidenceIds are preserved in result', () => {
    const result = applyEvidenceCap(10, 15, 'verified', ['e1', 'e2'])
    expect(result.evidenceIds).toEqual(['e1', 'e2'])
  })
})

describe('computeAdjustedTrustScore', () => {
  it('Trust Score uses adjusted scores, normalizes to 0-100', () => {
    const scoring = computeFullScoringResult(
      FULL_TRUST_DIMS,
      ALL_VERIFIED,
      FULL_READINESS,
      ALL_VERIFIED_READINESS,
      [],
    )
    expect(scoring.trustScore).toBe(100)
  })

  it('all-missing evidence caps trust score to 25% of max', () => {
    const scoring = computeFullScoringResult(
      FULL_TRUST_DIMS,
      ALL_MISSING,
      FULL_READINESS,
      ALL_VERIFIED_READINESS,
      [],
    )
    // max trust = 100, cap at 25%, so trustScore <= 25
    expect(scoring.trustScore).toBeLessThanOrEqual(25)
  })
})

describe('computeFullScoringResult', () => {
  it('returns correct evidence quality summary', () => {
    const scoring = computeFullScoringResult(
      FULL_TRUST_DIMS,
      ALL_VERIFIED,
      FULL_READINESS,
      ALL_VERIFIED_READINESS,
      [],
    )
    expect(scoring.evidenceQualitySummary).toContain('11 verified')
  })

  it('supply, distribution, utility use adjusted scores', () => {
    const scoring = computeFullScoringResult(
      FULL_TRUST_DIMS,
      ALL_VERIFIED,
      FULL_READINESS,
      ALL_MISSING_READINESS,
      [],
    )
    // 100 * 0.25 = 25
    expect(scoring.supplyScore).toBe(25)
    expect(scoring.distributionScore).toBe(25)
    expect(scoring.utilityScore).toBe(25)
  })
})

describe('computeOverallScore', () => {
  it('uses adjusted scores with correct weights: Trust 40%, Supply 20%, Dist 20%, Util 20%', () => {
    const overall = computeOverallScore(80, 70, 60, 50)
    // 80*0.4 + 70*0.2 + 60*0.2 + 50*0.2 = 32 + 14 + 12 + 10 = 68
    expect(overall).toBe(68)
  })

  it('perfect scores produce 100', () => {
    expect(computeOverallScore(100, 100, 100, 100)).toBe(100)
  })

  it('zero scores produce 0', () => {
    expect(computeOverallScore(0, 0, 0, 0)).toBe(0)
  })
})

describe('gradeFor', () => {
  it('85-100 → Grade A', () => {
    expect(gradeFor(85).grade).toBe('A')
    expect(gradeFor(100).grade).toBe('A')
  })

  it('70-84 → Grade B', () => {
    expect(gradeFor(70).grade).toBe('B')
    expect(gradeFor(84).grade).toBe('B')
  })

  it('50-69 → Grade C', () => {
    expect(gradeFor(50).grade).toBe('C')
    expect(gradeFor(69).grade).toBe('C')
  })

  it('0-49 → Grade D', () => {
    expect(gradeFor(0).grade).toBe('D')
    expect(gradeFor(49).grade).toBe('D')
  })
})

describe('adjustedTrustDimensions in computeFullScoringResult', () => {
  it('legalClarity: max 15, raw 13, partial (70%) → max allowed 10, adjusted 10', () => {
    const dims: TrustDimensions = {
      ...FULL_TRUST_DIMS,
      legalClarity: 13,
    }
    const status: TrustDimensionEvidenceStatus = {
      ...ALL_VERIFIED,
      legalClarity: 'partial',
    }
    const scoring = computeFullScoringResult(dims, status, FULL_READINESS, ALL_VERIFIED_READINESS, [])
    const legal = scoring.adjustedTrustDimensions.legalClarity
    expect(legal.rawScore).toBe(13)
    expect(legal.maximumScore).toBe(TRUST_DIMENSION_MAXIMUMS.legalClarity)
    expect(legal.evidenceStatus).toBe('partial')
    expect(legal.evidenceCap).toBe(0.7)
    expect(legal.maximumAllowedScore).toBe(10)
    expect(legal.adjustedScore).toBe(10)
  })

  it('zero raw score stays zero regardless of evidence cap', () => {
    const dims: TrustDimensions = { ...FULL_TRUST_DIMS, legalClarity: 0 }
    const scoring = computeFullScoringResult(dims, ALL_MISSING, FULL_READINESS, ALL_VERIFIED_READINESS, [])
    expect(scoring.adjustedTrustDimensions.legalClarity.adjustedScore).toBe(0)
  })
})

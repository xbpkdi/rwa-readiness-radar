import { describe, it, expect } from 'vitest'
import { deriveProjectId, toPublishReportArgs, ContractEncodingError } from './contract-encoding'
import { gradeToUint8, uint8ToGrade } from '@/config/contracts'
import type { CanonicalReport, ScoringResult } from '@/domain/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const

function makeScoringResult(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    adjustedTrustDimensions: {} as ScoringResult['adjustedTrustDimensions'],
    adjustedReadiness: {
      supplyReadiness: {} as ScoringResult['adjustedReadiness']['supplyReadiness'],
      distributionReadiness: {} as ScoringResult['adjustedReadiness']['distributionReadiness'],
      utilityReadiness: {} as ScoringResult['adjustedReadiness']['utilityReadiness'],
    },
    trustScore: 80,
    supplyScore: 70,
    distributionScore: 60,
    utilityScore: 50,
    overallScore: 68,
    grade: 'C',
    evidenceQualitySummary: 'Mixed evidence quality',
    ...overrides,
  }
}

function makeReport(overrides: Partial<CanonicalReport> = {}): CanonicalReport {
  return {
    schemaVersion: '1.0',
    version: 1,
    projectId: 'meridian-tbill-fund',
    projectName: 'Meridian T-Bill Fund',
    tagline: 'T-Bill backed RWA',
    assetType: 'treasury',
    chain: 'avalanche',
    websiteUrl: 'https://example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    issuer: 'Meridian Capital',
    custodian: 'FirstCustody',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    complianceModel: 'Reg D',
    accessModel: 'permissioned',
    eligibleRegions: 'US',
    distributionChannels: 'OTC',
    legalSummary: '',
    complianceNotes: '',
    custodyLink: '',
    proofOfReserveLink: '',
    redemptionTerms: '',
    liquidityDescription: '',
    distributionNotes: '',
    defiUtility: '',
    supplyNotes: '',
    utilityNotes: '',
    auditLink: '',
    evidence: [],
    riskFlags: [],
    trustDimensions: {
      legalClarity: 80,
      custodyTransparency: 10,
      assetBacking: 15,
      redemptionProcess: 10,
      compliance: 10,
      issuerCredibility: 8,
      smartContractTransparency: 5,
      liquidityRisk: 3,
    },
    readinessScores: {
      supplyReadiness: 70,
      distributionReadiness: 60,
      utilityReadiness: 50,
    },
    trustDimensionEvidenceStatus: {
      legalClarity: 'verified',
      custodyTransparency: 'partial',
      assetBacking: 'verified',
      redemptionProcess: 'partial',
      compliance: 'verified',
      issuerCredibility: 'verified',
      smartContractTransparency: 'verified',
      liquidityRisk: 'verified',
    },
    readinessEvidenceStatus: {
      supplyReadiness: 'verified',
      distributionReadiness: 'partial',
      utilityReadiness: 'missing',
    },
    scoring: makeScoringResult(),
    analystNotes: '',
    ...overrides,
  }
}

// ─── deriveProjectId ──────────────────────────────────────────────────────────

describe('deriveProjectId', () => {
  it('returns a 0x-prefixed 32-byte hex string', () => {
    const result = deriveProjectId('meridian-tbill-fund')
    expect(result).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('is deterministic — same input always yields same output', () => {
    const a = deriveProjectId('meridian-tbill-fund')
    const b = deriveProjectId('meridian-tbill-fund')
    expect(a).toBe(b)
  })

  it('trims surrounding whitespace before hashing', () => {
    const a = deriveProjectId('  meridian-tbill-fund  ')
    const b = deriveProjectId('meridian-tbill-fund')
    expect(a).toBe(b)
  })

  it('lowercases before hashing', () => {
    const a = deriveProjectId('Meridian-TBill-Fund')
    const b = deriveProjectId('meridian-tbill-fund')
    expect(a).toBe(b)
  })

  it('produces different hashes for different slugs', () => {
    const a = deriveProjectId('project-alpha')
    const b = deriveProjectId('project-beta')
    expect(a).not.toBe(b)
  })

  it('throws ContractEncodingError on empty string', () => {
    expect(() => deriveProjectId('')).toThrow(ContractEncodingError)
  })

  it('throws ContractEncodingError on whitespace-only string', () => {
    expect(() => deriveProjectId('   ')).toThrow(ContractEncodingError)
  })

  it('produces a non-zero hash for a valid slug', () => {
    const result = deriveProjectId('any-project')
    expect(result).not.toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
  })
})

// ─── Grade mapping ────────────────────────────────────────────────────────────

describe('gradeToUint8', () => {
  it('maps A → 1', () => expect(gradeToUint8('A')).toBe(1))
  it('maps B → 2', () => expect(gradeToUint8('B')).toBe(2))
  it('maps C → 3', () => expect(gradeToUint8('C')).toBe(3))
  it('maps D → 4', () => expect(gradeToUint8('D')).toBe(4))

  it('is case-insensitive', () => {
    expect(gradeToUint8('a')).toBe(1)
    expect(gradeToUint8('b')).toBe(2)
    expect(gradeToUint8('c')).toBe(3)
    expect(gradeToUint8('d')).toBe(4)
  })

  it('throws on invalid grade', () => {
    expect(() => gradeToUint8('E')).toThrow()
    expect(() => gradeToUint8('0')).toThrow()
    expect(() => gradeToUint8('')).toThrow()
  })
})

describe('uint8ToGrade', () => {
  it('maps 1 → A', () => expect(uint8ToGrade(1)).toBe('A'))
  it('maps 2 → B', () => expect(uint8ToGrade(2)).toBe('B'))
  it('maps 3 → C', () => expect(uint8ToGrade(3)).toBe('C'))
  it('maps 4 → D', () => expect(uint8ToGrade(4)).toBe('D'))

  it('throws on invalid values', () => {
    expect(() => uint8ToGrade(0)).toThrow()
    expect(() => uint8ToGrade(5)).toThrow()
  })

  it('round-trips: gradeToUint8 then uint8ToGrade', () => {
    for (const g of ['A', 'B', 'C', 'D'] as const) {
      expect(uint8ToGrade(gradeToUint8(g))).toBe(g)
    }
  })
})

// ─── toPublishReportArgs ──────────────────────────────────────────────────────

describe('toPublishReportArgs', () => {
  it('returns a tuple of 9 elements', () => {
    const args = toPublishReportArgs(makeReport(), VALID_HASH)
    expect(args).toHaveLength(9)
  })

  it('first element is the derived projectId bytes32', () => {
    const report = makeReport()
    const [projectId] = toPublishReportArgs(report, VALID_HASH)
    expect(projectId).toBe(deriveProjectId(report.projectId))
    expect(projectId).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('second element is the reportHash passed in', () => {
    const [, hash] = toPublishReportArgs(makeReport(), VALID_HASH)
    expect(hash).toBe(VALID_HASH)
  })

  it('scores are integers from report.scoring', () => {
    const scoring = makeScoringResult({
      trustScore: 80,
      supplyScore: 70,
      distributionScore: 60,
      utilityScore: 50,
      overallScore: 68,
    })
    const [, , trust, supply, dist, utility, overall] = toPublishReportArgs(
      makeReport({ scoring }),
      VALID_HASH,
    )
    expect(trust).toBe(80)
    expect(supply).toBe(70)
    expect(dist).toBe(60)
    expect(utility).toBe(50)
    expect(overall).toBe(68)
  })

  it('grade maps correctly (C → 3)', () => {
    const [, , , , , , , grade] = toPublishReportArgs(
      makeReport({ scoring: makeScoringResult({ grade: 'C' }) }),
      VALID_HASH,
    )
    expect(grade).toBe(3)
  })

  it('grade maps correctly (A → 1)', () => {
    const [, , , , , , , grade] = toPublishReportArgs(
      makeReport({ scoring: makeScoringResult({ grade: 'A', overallScore: 90 }) }),
      VALID_HASH,
    )
    expect(grade).toBe(1)
  })

  it('version is the report.version field', () => {
    const [, , , , , , , , version] = toPublishReportArgs(
      makeReport({ version: 3 }),
      VALID_HASH,
    )
    expect(version).toBe(3)
  })

  it('rounds fractional scores to integers', () => {
    const scoring = makeScoringResult({ trustScore: 79.7, overallScore: 68.4 })
    const [, , trust, , , , overall] = toPublishReportArgs(makeReport({ scoring }), VALID_HASH)
    expect(Number.isInteger(trust)).toBe(true)
    expect(Number.isInteger(overall)).toBe(true)
  })

  it('throws ContractEncodingError on empty projectId', () => {
    expect(() => toPublishReportArgs(makeReport({ projectId: '' }), VALID_HASH)).toThrow(
      ContractEncodingError,
    )
  })

  it('throws ContractEncodingError on version 0', () => {
    expect(() => toPublishReportArgs(makeReport({ version: 0 }), VALID_HASH)).toThrow(
      ContractEncodingError,
    )
  })

  it('throws ContractEncodingError on negative version', () => {
    expect(() => toPublishReportArgs(makeReport({ version: -1 }), VALID_HASH)).toThrow(
      ContractEncodingError,
    )
  })

  it('throws ContractEncodingError on zero reportHash', () => {
    const zeroHash =
      '0x0000000000000000000000000000000000000000000000000000000000000000' as const
    expect(() => toPublishReportArgs(makeReport(), zeroHash)).toThrow(ContractEncodingError)
  })

  it('throws ContractEncodingError on reportHash that is wrong length', () => {
    const shortHash = '0xabcd' as `0x${string}`
    expect(() => toPublishReportArgs(makeReport(), shortHash)).toThrow(ContractEncodingError)
  })

  it('throws ContractEncodingError on score above 100', () => {
    const scoring = makeScoringResult({ trustScore: 101 })
    expect(() => toPublishReportArgs(makeReport({ scoring }), VALID_HASH)).toThrow(
      ContractEncodingError,
    )
  })

  it('accepts score of exactly 100', () => {
    const scoring = makeScoringResult({
      trustScore: 100,
      supplyScore: 100,
      distributionScore: 100,
      utilityScore: 100,
      overallScore: 100,
      grade: 'A',
    })
    expect(() => toPublishReportArgs(makeReport({ scoring }), VALID_HASH)).not.toThrow()
  })

  it('accepts score of exactly 0', () => {
    const scoring = makeScoringResult({
      trustScore: 0,
      supplyScore: 0,
      distributionScore: 0,
      utilityScore: 0,
      overallScore: 0,
      grade: 'D',
    })
    expect(() => toPublishReportArgs(makeReport({ scoring }), VALID_HASH)).not.toThrow()
  })

  it('projectId derivation is deterministic across calls', () => {
    const report = makeReport()
    const [id1] = toPublishReportArgs(report, VALID_HASH)
    const [id2] = toPublishReportArgs(report, VALID_HASH)
    expect(id1).toBe(id2)
  })
})

import { describe, it, expect } from 'vitest'
import {
  verifyReportAgainstSnapshot,
  notPublishedResult,
  registryUnavailableResult,
  rpcErrorResult,
  type OnChainSnapshot,
} from './report-verification'
import { hashCanonicalReport } from '@/utils/canonical-report'
import { deriveProjectId } from '@/utils/contract-encoding'
import { gradeToUint8 } from '@/config/contracts'
import type { CanonicalReport, EvidenceAdjustedDimensionScore } from '@/domain/types'

function stubDimScore(score: number, max: number): EvidenceAdjustedDimensionScore {
  return {
    rawScore: score, maximumScore: max, evidenceStatus: 'verified',
    evidenceCap: 1, maximumAllowedScore: max, adjustedScore: score,
    explanation: '', evidenceIds: [],
  }
}

function makeReport(overrides: Partial<CanonicalReport> = {}): CanonicalReport {
  return {
    schemaVersion: '1.0',
    version: 1,
    projectId: 'test-project',
    projectName: 'Test Project',
    tagline: '',
    assetType: 'treasury',
    chain: 'avalanche',
    websiteUrl: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    issuer: '',
    custodian: '',
    contractAddress: '',
    complianceModel: '',
    accessModel: '',
    eligibleRegions: '',
    distributionChannels: '',
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
      custodyTransparency: 70,
      assetBacking: 90,
      redemptionProcess: 60,
      compliance: 70,
      issuerCredibility: 80,
      smartContractTransparency: 50,
      liquidityRisk: 40,
    },
    readinessScores: { supplyReadiness: 70, distributionReadiness: 60, utilityReadiness: 50 },
    trustDimensionEvidenceStatus: {
      legalClarity: 'verified',
      custodyTransparency: 'verified',
      assetBacking: 'verified',
      redemptionProcess: 'verified',
      compliance: 'verified',
      issuerCredibility: 'verified',
      smartContractTransparency: 'verified',
      liquidityRisk: 'verified',
    },
    readinessEvidenceStatus: {
      supplyReadiness: 'verified',
      distributionReadiness: 'verified',
      utilityReadiness: 'verified',
    },
    scoring: {
      adjustedTrustDimensions: {
        legalClarity: stubDimScore(80, 15),
        custodyTransparency: stubDimScore(70, 15),
        assetBacking: stubDimScore(90, 20),
        redemptionProcess: stubDimScore(60, 15),
        compliance: stubDimScore(70, 15),
        issuerCredibility: stubDimScore(80, 10),
        smartContractTransparency: stubDimScore(50, 5),
        liquidityRisk: stubDimScore(40, 5),
      },
      adjustedReadiness: {
        supplyReadiness: stubDimScore(70, 100),
        distributionReadiness: stubDimScore(60, 100),
        utilityReadiness: stubDimScore(50, 100),
      },
      trustScore: 80,
      supplyScore: 70,
      distributionScore: 60,
      utilityScore: 50,
      overallScore: 68,
      grade: 'C',
      evidenceQualitySummary: '',
    },
    analystNotes: '',
    ...overrides,
  }
}

function makeSnapshot(report: CanonicalReport): OnChainSnapshot {
  const reportHash = hashCanonicalReport(report)
  const projectId = deriveProjectId(report.projectId)
  const scoring = report.scoring
  return {
    projectId,
    reportHash,
    trustScore: Math.round(scoring.trustScore),
    supplyScore: Math.round(scoring.supplyScore),
    distributionScore: Math.round(scoring.distributionScore),
    utilityScore: Math.round(scoring.utilityScore),
    overallReadinessScore: Math.round(scoring.overallScore),
    grade: gradeToUint8(scoring.grade),
    version: report.version,
    publisher: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    publishedAt: BigInt(1_700_000_000),
  }
}

// ─── verifyReportAgainstSnapshot ─────────────────────────────────────────────

describe('verifyReportAgainstSnapshot', () => {
  it('returns verified for a matching report and snapshot', () => {
    const report = makeReport()
    const snapshot = makeSnapshot(report)
    const result = verifyReportAgainstSnapshot(report, snapshot)
    expect(result.state).toBe('verified')
    expect(result.message).toMatch(/verified/i)
  })

  it('returns hash-mismatch when report content changed', () => {
    const report = makeReport()
    const snapshot = makeSnapshot(report)
    const modifiedReport = makeReport({ analystNotes: 'changed content' })
    const result = verifyReportAgainstSnapshot(modifiedReport, snapshot)
    expect(result.state).toBe('hash-mismatch')
  })

  it('returns project-mismatch when project IDs differ', () => {
    const report = makeReport()
    const snapshot = {
      ...makeSnapshot(report),
      projectId: '0x0000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`,
    }
    const result = verifyReportAgainstSnapshot(report, snapshot)
    expect(result.state).toBe('project-mismatch')
  })

  it('returns version-mismatch when version differs', () => {
    const report = makeReport()
    const snapshot = { ...makeSnapshot(report), version: 2 }
    const result = verifyReportAgainstSnapshot(report, snapshot)
    expect(result.state).toBe('version-mismatch')
  })

  it('includes local hash in the result', () => {
    const report = makeReport()
    const snapshot = makeSnapshot(report)
    const result = verifyReportAgainstSnapshot(report, snapshot)
    expect(result.localHash).toMatch(/^0x[0-9a-f]{64}$/)
  })
})

// ─── helper constructors ──────────────────────────────────────────────────────

describe('verification helpers', () => {
  it('notPublishedResult has correct state', () => {
    expect(notPublishedResult().state).toBe('not-published')
  })

  it('registryUnavailableResult has correct state', () => {
    expect(registryUnavailableResult().state).toBe('registry-unavailable')
    expect(registryUnavailableResult('missing address').details).toBe('missing address')
  })

  it('rpcErrorResult has correct state', () => {
    expect(rpcErrorResult().state).toBe('rpc-error')
  })
})

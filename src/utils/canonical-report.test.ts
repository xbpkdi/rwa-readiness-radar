import { describe, it, expect } from 'vitest'
import { canonicalizeReport, serializeCanonicalReport, hashCanonicalReport } from './canonical-report'
import type { CanonicalReport } from '@/domain/types'

const BASE_REPORT: CanonicalReport = {
  schemaVersion: '1.0',
  version: 1,
  projectId: 'test-project',
  projectName: 'Test Project',
  tagline: 'A test project',
  assetType: 'tokenized-treasury',
  chain: 'Avalanche C-Chain',
  websiteUrl: 'https://example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  issuer: 'Test Issuer Inc',
  custodian: 'Test Custodian',
  contractAddress: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  complianceModel: 'Reg D',
  accessModel: 'Permissioned',
  eligibleRegions: 'US, EU',
  distributionChannels: 'OTC',
  legalSummary: 'Legal summary text.',
  complianceNotes: '',
  custodyLink: 'https://custody.example.com',
  proofOfReserveLink: 'https://reserve.example.com',
  redemptionTerms: 'T+1 redemption',
  liquidityDescription: 'Daily',
  distributionNotes: '',
  defiUtility: '',
  supplyNotes: '',
  utilityNotes: '',
  auditLink: 'https://audit.example.com',
  evidence: [],
  riskFlags: [],
  trustDimensions: {
    legalClarity: 12,
    custodyTransparency: 10,
    assetBacking: 11,
    redemptionProcess: 7,
    compliance: 13,
    issuerCredibility: 8,
    smartContractTransparency: 9,
    liquidityRisk: 6,
  },
  trustDimensionEvidenceStatus: {
    legalClarity: 'verified',
    custodyTransparency: 'partial',
    assetBacking: 'verified',
    redemptionProcess: 'partial',
    compliance: 'verified',
    issuerCredibility: 'manual-review',
    smartContractTransparency: 'verified',
    liquidityRisk: 'missing',
  },
  readinessScores: {
    supplyReadiness: 75,
    distributionReadiness: 60,
    utilityReadiness: 40,
  },
  readinessEvidenceStatus: {
    supplyReadiness: 'partial',
    distributionReadiness: 'partial',
    utilityReadiness: 'missing',
  },
  scoring: {
    adjustedTrustDimensions: {
      legalClarity: { rawScore: 12, maximumScore: 15, evidenceStatus: 'verified', evidenceCap: 1.0, maximumAllowedScore: 15, adjustedScore: 12, explanation: 'Full score supported by verified evidence.', evidenceIds: [] },
      custodyTransparency: { rawScore: 10, maximumScore: 15, evidenceStatus: 'partial', evidenceCap: 0.7, maximumAllowedScore: 10, adjustedScore: 10, explanation: 'Raw score (10) is within the 70% cap.', evidenceIds: [] },
      assetBacking: { rawScore: 11, maximumScore: 15, evidenceStatus: 'verified', evidenceCap: 1.0, maximumAllowedScore: 15, adjustedScore: 11, explanation: 'Full score supported by verified evidence.', evidenceIds: [] },
      redemptionProcess: { rawScore: 7, maximumScore: 10, evidenceStatus: 'partial', evidenceCap: 0.7, maximumAllowedScore: 7, adjustedScore: 7, explanation: 'Raw score (7) is within the 70% cap.', evidenceIds: [] },
      compliance: { rawScore: 13, maximumScore: 15, evidenceStatus: 'verified', evidenceCap: 1.0, maximumAllowedScore: 15, adjustedScore: 13, explanation: 'Full score supported by verified evidence.', evidenceIds: [] },
      issuerCredibility: { rawScore: 8, maximumScore: 10, evidenceStatus: 'manual-review', evidenceCap: 0.5, maximumAllowedScore: 5, adjustedScore: 5, explanation: 'Reduced from 8 to 5.', evidenceIds: [] },
      smartContractTransparency: { rawScore: 9, maximumScore: 10, evidenceStatus: 'verified', evidenceCap: 1.0, maximumAllowedScore: 10, adjustedScore: 9, explanation: 'Full score supported by verified evidence.', evidenceIds: [] },
      liquidityRisk: { rawScore: 6, maximumScore: 10, evidenceStatus: 'missing', evidenceCap: 0.25, maximumAllowedScore: 2, adjustedScore: 2, explanation: 'Reduced from 6 to 2.', evidenceIds: [] },
    },
    adjustedReadiness: {
      supplyReadiness: { rawScore: 75, maximumScore: 100, evidenceStatus: 'partial', evidenceCap: 0.7, maximumAllowedScore: 70, adjustedScore: 70, explanation: 'Capped.', evidenceIds: [] },
      distributionReadiness: { rawScore: 60, maximumScore: 100, evidenceStatus: 'partial', evidenceCap: 0.7, maximumAllowedScore: 70, adjustedScore: 60, explanation: 'Within cap.', evidenceIds: [] },
      utilityReadiness: { rawScore: 40, maximumScore: 100, evidenceStatus: 'missing', evidenceCap: 0.25, maximumAllowedScore: 25, adjustedScore: 25, explanation: 'Capped.', evidenceIds: [] },
    },
    trustScore: 69,
    supplyScore: 70,
    distributionScore: 60,
    utilityScore: 25,
    overallScore: 59,
    grade: 'C',
    evidenceQualitySummary: '4 verified, 4 partial, 1 needs review, 2 missing (of 11 dimensions)',
  },
  analystNotes: 'Test analyst notes.',
}

describe('canonicalizeReport', () => {
  it('produces same serialized string for the same report', () => {
    const s1 = serializeCanonicalReport(canonicalizeReport(BASE_REPORT))
    const s2 = serializeCanonicalReport(canonicalizeReport(BASE_REPORT))
    expect(s1).toBe(s2)
  })

  it('different key insertion order produces same serialized string', () => {
    // Rebuild the report with keys in different order
    const reordered: CanonicalReport = {
      version: BASE_REPORT.version,
      schemaVersion: BASE_REPORT.schemaVersion,
      analystNotes: BASE_REPORT.analystNotes,
      projectId: BASE_REPORT.projectId,
      projectName: BASE_REPORT.projectName,
      tagline: BASE_REPORT.tagline,
      assetType: BASE_REPORT.assetType,
      chain: BASE_REPORT.chain,
      websiteUrl: BASE_REPORT.websiteUrl,
      createdAt: BASE_REPORT.createdAt,
      issuer: BASE_REPORT.issuer,
      custodian: BASE_REPORT.custodian,
      contractAddress: BASE_REPORT.contractAddress,
      complianceModel: BASE_REPORT.complianceModel,
      accessModel: BASE_REPORT.accessModel,
      eligibleRegions: BASE_REPORT.eligibleRegions,
      distributionChannels: BASE_REPORT.distributionChannels,
      legalSummary: BASE_REPORT.legalSummary,
      complianceNotes: BASE_REPORT.complianceNotes,
      custodyLink: BASE_REPORT.custodyLink,
      proofOfReserveLink: BASE_REPORT.proofOfReserveLink,
      redemptionTerms: BASE_REPORT.redemptionTerms,
      liquidityDescription: BASE_REPORT.liquidityDescription,
      distributionNotes: BASE_REPORT.distributionNotes,
      defiUtility: BASE_REPORT.defiUtility,
      supplyNotes: BASE_REPORT.supplyNotes,
      utilityNotes: BASE_REPORT.utilityNotes,
      auditLink: BASE_REPORT.auditLink,
      evidence: BASE_REPORT.evidence,
      riskFlags: BASE_REPORT.riskFlags,
      trustDimensions: BASE_REPORT.trustDimensions,
      trustDimensionEvidenceStatus: BASE_REPORT.trustDimensionEvidenceStatus,
      readinessScores: BASE_REPORT.readinessScores,
      readinessEvidenceStatus: BASE_REPORT.readinessEvidenceStatus,
      scoring: BASE_REPORT.scoring,
    }
    const s1 = serializeCanonicalReport(canonicalizeReport(BASE_REPORT))
    const s2 = serializeCanonicalReport(canonicalizeReport(reordered))
    expect(s1).toBe(s2)
  })

  it('trims leading and trailing whitespace from text fields', () => {
    const padded = { ...BASE_REPORT, projectName: '  Test Project  ', analystNotes: '\n  Notes  \n' }
    const canon = canonicalizeReport(padded)
    expect(canon.projectName).toBe('Test Project')
    expect(canon.analystNotes).toBe('Notes')
  })

  it('normalizes Ethereum addresses to lowercase', () => {
    const mixed = { ...BASE_REPORT, contractAddress: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12' }
    const canon = canonicalizeReport(mixed)
    expect(canon.contractAddress).toBe('0xabcdef1234567890abcdef1234567890abcdef12')
  })

  it('sorts evidence deterministically by dimension, title, id', () => {
    const report: CanonicalReport = {
      ...BASE_REPORT,
      evidence: [
        { id: 'e3', dimension: 'compliance', title: 'Comp Report', description: '', sourceUrl: '', sourceType: 'issuer-provided', status: 'verified', updatedAt: '2026-01-01', analystNote: '' },
        { id: 'e1', dimension: 'assetBacking', title: 'Reserve Report', description: '', sourceUrl: '', sourceType: 'on-chain', status: 'verified', updatedAt: '2026-01-01', analystNote: '' },
        { id: 'e2', dimension: 'assetBacking', title: 'Audit Report', description: '', sourceUrl: '', sourceType: 'independent-third-party', status: 'verified', updatedAt: '2026-01-01', analystNote: '' },
      ],
    }
    const canon = canonicalizeReport(report)
    expect(canon.evidence[0].dimension).toBe('assetBacking')
    expect(canon.evidence[0].title).toBe('Audit Report')
    expect(canon.evidence[1].title).toBe('Reserve Report')
    expect(canon.evidence[2].dimension).toBe('compliance')
  })

  it('sorts riskFlags by severity (high→medium→low), category, id', () => {
    const report: CanonicalReport = {
      ...BASE_REPORT,
      riskFlags: [
        { id: 'r3', severity: 'low', category: 'Liquidity', description: 'Low risk' },
        { id: 'r1', severity: 'high', category: 'Legal', description: 'High risk' },
        { id: 'r2', severity: 'medium', category: 'Custody', description: 'Medium risk' },
      ],
    }
    const canon = canonicalizeReport(report)
    expect(canon.riskFlags[0].severity).toBe('high')
    expect(canon.riskFlags[1].severity).toBe('medium')
    expect(canon.riskFlags[2].severity).toBe('low')
  })
})

describe('hashCanonicalReport', () => {
  it('same report produces same hash', () => {
    const h1 = hashCanonicalReport(BASE_REPORT)
    const h2 = hashCanonicalReport(BASE_REPORT)
    expect(h1).toBe(h2)
  })

  it('different key insertion order produces same hash', () => {
    const reordered: CanonicalReport = {
      version: BASE_REPORT.version,
      schemaVersion: BASE_REPORT.schemaVersion,
      analystNotes: BASE_REPORT.analystNotes,
      projectId: BASE_REPORT.projectId,
      projectName: BASE_REPORT.projectName,
      tagline: BASE_REPORT.tagline,
      assetType: BASE_REPORT.assetType,
      chain: BASE_REPORT.chain,
      websiteUrl: BASE_REPORT.websiteUrl,
      createdAt: BASE_REPORT.createdAt,
      issuer: BASE_REPORT.issuer,
      custodian: BASE_REPORT.custodian,
      contractAddress: BASE_REPORT.contractAddress,
      complianceModel: BASE_REPORT.complianceModel,
      accessModel: BASE_REPORT.accessModel,
      eligibleRegions: BASE_REPORT.eligibleRegions,
      distributionChannels: BASE_REPORT.distributionChannels,
      legalSummary: BASE_REPORT.legalSummary,
      complianceNotes: BASE_REPORT.complianceNotes,
      custodyLink: BASE_REPORT.custodyLink,
      proofOfReserveLink: BASE_REPORT.proofOfReserveLink,
      redemptionTerms: BASE_REPORT.redemptionTerms,
      liquidityDescription: BASE_REPORT.liquidityDescription,
      distributionNotes: BASE_REPORT.distributionNotes,
      defiUtility: BASE_REPORT.defiUtility,
      supplyNotes: BASE_REPORT.supplyNotes,
      utilityNotes: BASE_REPORT.utilityNotes,
      auditLink: BASE_REPORT.auditLink,
      evidence: BASE_REPORT.evidence,
      riskFlags: BASE_REPORT.riskFlags,
      trustDimensions: BASE_REPORT.trustDimensions,
      trustDimensionEvidenceStatus: BASE_REPORT.trustDimensionEvidenceStatus,
      readinessScores: BASE_REPORT.readinessScores,
      readinessEvidenceStatus: BASE_REPORT.readinessEvidenceStatus,
      scoring: BASE_REPORT.scoring,
    }
    expect(hashCanonicalReport(BASE_REPORT)).toBe(hashCanonicalReport(reordered))
  })

  it('meaningful field change produces different hash', () => {
    const modified = { ...BASE_REPORT, projectName: 'Different Project Name' }
    expect(hashCanonicalReport(BASE_REPORT)).not.toBe(hashCanonicalReport(modified))
  })

  it('score change produces different hash', () => {
    const modified: CanonicalReport = {
      ...BASE_REPORT,
      trustDimensions: { ...BASE_REPORT.trustDimensions, legalClarity: 5 },
    }
    expect(hashCanonicalReport(BASE_REPORT)).not.toBe(hashCanonicalReport(modified))
  })

  it('evidence status change produces different hash', () => {
    const modified: CanonicalReport = {
      ...BASE_REPORT,
      trustDimensionEvidenceStatus: {
        ...BASE_REPORT.trustDimensionEvidenceStatus,
        legalClarity: 'missing',
      },
    }
    expect(hashCanonicalReport(BASE_REPORT)).not.toBe(hashCanonicalReport(modified))
  })

  it('hash is a valid 0x-prefixed 32-byte hex value', () => {
    const hash = hashCanonicalReport(BASE_REPORT)
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
  })
})

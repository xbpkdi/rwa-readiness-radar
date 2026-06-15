import type {
  CanonicalReport,
  TrustDimensions,
  TrustDimensionEvidenceStatus,
  ReadinessScores,
  ReadinessEvidenceStatus,
} from '@/domain/types'
import type { ResearchDraft } from '@/domain/research-types'
import { computeFullScoringResult } from '@/utils/scoring'

// Fictional asset/token contract — NOT the RWA Readiness Registry
// Registry: 0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5
export const DEMO_TOKEN_CONTRACT = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as const

// Fixed creation timestamp — ensures the demo report hash is always identical
export const DEMO_CREATED_AT = '2026-01-01T00:00:00.000Z' as const

const DEMO_TRUST_DIMENSIONS: TrustDimensions = {
  legalClarity: 13,
  custodyTransparency: 10,
  assetBacking: 14,
  redemptionProcess: 8,
  compliance: 13,
  issuerCredibility: 8,
  smartContractTransparency: 7,
  liquidityRisk: 6,
}

const DEMO_TRUST_EVIDENCE_STATUS: TrustDimensionEvidenceStatus = {
  legalClarity: 'verified',
  custodyTransparency: 'partial',
  assetBacking: 'verified',
  redemptionProcess: 'partial',
  compliance: 'verified',
  issuerCredibility: 'partial',
  smartContractTransparency: 'manual-review',
  liquidityRisk: 'partial',
}

const DEMO_READINESS_SCORES: ReadinessScores = {
  supplyReadiness: 75,
  distributionReadiness: 65,
  utilityReadiness: 60,
}

const DEMO_READINESS_EVIDENCE_STATUS: ReadinessEvidenceStatus = {
  supplyReadiness: 'partial',
  distributionReadiness: 'partial',
  utilityReadiness: 'manual-review',
}

export function buildDemoReport(): CanonicalReport {
  const scoring = computeFullScoringResult(
    DEMO_TRUST_DIMENSIONS,
    DEMO_TRUST_EVIDENCE_STATUS,
    DEMO_READINESS_SCORES,
    DEMO_READINESS_EVIDENCE_STATUS,
    [],
  )

  return {
    schemaVersion: '1.0',
    version: 1,
    projectId: 'meridian-t-bill-fund',
    projectName: 'Meridian T-Bill Fund',
    tagline: 'Tokenized U.S. Treasury exposure on Avalanche',
    assetType: 'tokenized-treasury',
    chain: 'Avalanche C-Chain',
    websiteUrl: 'https://example.com/meridian-tbill',
    createdAt: DEMO_CREATED_AT,
    issuer: 'Meridian Capital Management Ltd.',
    custodian: 'Northern Trust / Fireblocks',
    contractAddress: DEMO_TOKEN_CONTRACT,
    complianceModel: 'Reg D 506(c); AML/KYC gated',
    accessModel: 'Permissioned — accredited investors only',
    eligibleRegions: 'United States, Singapore, European Union',
    distributionChannels: 'Direct subscriptions, regulated broker-dealer partners, institutional OTC desks, and approved DeFi integrations.',
    legalSummary: 'The token represents a beneficial interest in a portfolio of short-term U.S. Treasury assets held through a bankruptcy-remote special purpose vehicle. Investor rights, redemption terms, and asset ownership are governed by the offering documents and applicable securities laws.',
    complianceNotes: 'Investor onboarding requires KYC/AML verification and accredited investor eligibility checks. Transfers are restricted to approved wallet addresses, with periodic compliance reviews and sanctions screening.',
    custodyLink: 'https://example.com/meridian-tbill/custody-report',
    proofOfReserveLink: 'https://example.com/meridian-tbill/proof-of-reserve',
    redemptionTerms: 'Investors may request redemption on business days before the daily cut-off time. Redemptions are settled in USDC or fiat within one to three business days, subject to liquidity availability, compliance checks, and a 0.25% redemption fee.',
    liquidityDescription: 'Primary liquidity is provided through issuer subscriptions and redemptions. Secondary liquidity may be available through approved OTC counterparties and selected on-chain liquidity venues, subject to transfer restrictions and market demand.',
    distributionNotes: 'Distribution is focused on qualified institutional and accredited investors. Access remains limited by jurisdiction, KYC/AML requirements, and approved-wallet controls, which may reduce secondary-market depth.',
    defiUtility: 'The token may be integrated into approved DeFi protocols as collateral, a treasury-management asset, and a source of yield-bearing exposure. Any integration must preserve transfer restrictions, compliance controls, and redemption rights.',
    supplyNotes: 'Token issuance is controlled by the issuer and limited to verified subscriptions backed by eligible underlying assets. Minting and burning follow subscription and redemption activity, with supply changes documented and reconciled against reserve records.',
    utilityNotes: 'Current utility is limited and depends on future protocol integrations, oracle support, liquidity depth, and institutional adoption. Smart-contract and counterparty risks should be reviewed before enabling collateral or lending use cases.',
    auditLink: 'https://example.com/meridian-tbill/audit-report',
    evidence: [],
    riskFlags: [],
    trustDimensions: DEMO_TRUST_DIMENSIONS,
    trustDimensionEvidenceStatus: DEMO_TRUST_EVIDENCE_STATUS,
    readinessScores: DEMO_READINESS_SCORES,
    readinessEvidenceStatus: DEMO_READINESS_EVIDENCE_STATUS,
    scoring,
    analystNotes: 'This is a fictional demonstration assessment. On-chain publication proves the report hash, publisher, timestamp, scores, and version history, but does not independently verify the truth of the underlying evidence.',
  }
}

export function buildDemoResearchDraft(): ResearchDraft {
  return {
    projectName: 'Meridian T-Bill Fund',
    websiteUrl: 'https://example.com/meridian-tbill',
    assetType: 'tokenized-treasury',
    chain: 'Avalanche C-Chain',
    tokenContractAddress: DEMO_TOKEN_CONTRACT,
    custodyUrl: 'https://example.com/meridian-tbill/custody-report',
    proofOfReserveUrl: 'https://example.com/meridian-tbill/proof-of-reserve',
    auditUrl: 'https://example.com/meridian-tbill/audit-report',
    findings: [
      {
        id: 'demo-legal-summary',
        category: 'legalClarity',
        field: 'legalSummary',
        value: 'The token represents a beneficial interest in a portfolio of short-term U.S. Treasury assets held through a bankruptcy-remote special purpose vehicle.',
        provenance: 'demo',
        reviewStatus: 'pending',
        evidenceUrls: ['https://example.com/meridian-tbill/custody-report'],
        analystNotes: '',
        isDemo: true,
      },
      {
        id: 'demo-custodian',
        category: 'custodyTransparency',
        field: 'custodian',
        value: 'Northern Trust / Fireblocks',
        provenance: 'demo',
        reviewStatus: 'pending',
        evidenceUrls: ['https://example.com/meridian-tbill/custody-report'],
        analystNotes: '',
        isDemo: true,
      },
    ],
    evidence: [
      {
        id: 'demo-custody-doc',
        title: 'Custody Report',
        sourceUrl: 'https://example.com/meridian-tbill/custody-report',
        category: 'Custody Documents',
        provenance: 'demo',
        reviewStatus: 'pending',
        description: 'Fictional demonstration custody report.',
        analystNotes: 'Demo data — not a real custody document.',
        includedInReport: true,
      },
      {
        id: 'demo-por-doc',
        title: 'Proof of Reserve',
        sourceUrl: 'https://example.com/meridian-tbill/proof-of-reserve',
        category: 'Proof of Reserve',
        provenance: 'demo',
        reviewStatus: 'pending',
        description: 'Fictional demonstration proof-of-reserve document.',
        analystNotes: 'Demo data — not a real proof-of-reserve report.',
        includedInReport: true,
      },
      {
        id: 'demo-audit-doc',
        title: 'Audit Report',
        sourceUrl: 'https://example.com/meridian-tbill/audit-report',
        category: 'Audit Report',
        provenance: 'demo',
        reviewStatus: 'pending',
        description: 'Fictional demonstration smart-contract audit report.',
        analystNotes: 'Demo data — not a real audit report.',
        includedInReport: true,
      },
    ],
    provenance: 'demo',
    isDemo: true,
    createdAt: DEMO_CREATED_AT,
  }
}

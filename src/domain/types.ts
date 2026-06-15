export type AssetType =
  | 'tokenized-treasury'
  | 'private-credit'
  | 'tokenized-equity'
  | 'real-estate'
  | 'commodity'
  | 'invoice-financing'

export type ChainName =
  | 'Avalanche C-Chain'
  | 'Avalanche L1'
  | 'Ethereum'
  | 'Polygon'
  | 'Other'

export type EvidenceStatus =
  | 'verified'
  | 'partial'
  | 'missing'
  | 'manual-review'

export type EvidenceSourceType =
  | 'issuer-provided'
  | 'independent-third-party'
  | 'on-chain'
  | 'regulatory-legal'
  | 'unverified-claim'

export type VerificationStatus =
  | 'published'
  | 'draft'
  | 'pending-review'
  | 'missing-evidence'

export interface EvidenceItem {
  id: string
  dimension: string
  title: string
  description: string
  sourceUrl: string
  sourceType: EvidenceSourceType
  status: EvidenceStatus
  updatedAt: string
  analystNote: string
}

export interface DimensionScore {
  label: string
  value: number
  max: number
  evidenceStatus: EvidenceStatus
}

export interface TrustDimensions {
  legalClarity: number
  custodyTransparency: number
  assetBacking: number
  redemptionProcess: number
  compliance: number
  issuerCredibility: number
  smartContractTransparency: number
  liquidityRisk: number
}

export type TrustDimensionKey = keyof TrustDimensions

export interface ReadinessScores {
  supplyReadiness: number
  distributionReadiness: number
  utilityReadiness: number
}

export type ReadinessDimensionKey = keyof ReadinessScores

export interface TrustDimensionEvidenceStatus {
  legalClarity: EvidenceStatus
  custodyTransparency: EvidenceStatus
  assetBacking: EvidenceStatus
  redemptionProcess: EvidenceStatus
  compliance: EvidenceStatus
  issuerCredibility: EvidenceStatus
  smartContractTransparency: EvidenceStatus
  liquidityRisk: EvidenceStatus
}

export interface ReadinessEvidenceStatus {
  supplyReadiness: EvidenceStatus
  distributionReadiness: EvidenceStatus
  utilityReadiness: EvidenceStatus
}

/**
 * Evidence-adjusted score for a single dimension.
 *
 * Rounding: maximumAllowedScore = Math.floor(maximumScore × evidenceCap)
 * adjustedScore = Math.min(rawScore, maximumAllowedScore)
 */
export interface EvidenceAdjustedDimensionScore {
  rawScore: number
  maximumScore: number
  evidenceStatus: EvidenceStatus
  evidenceCap: number
  maximumAllowedScore: number
  adjustedScore: number
  explanation: string
  evidenceIds: string[]
}

export interface ScoringResult {
  adjustedTrustDimensions: Record<TrustDimensionKey, EvidenceAdjustedDimensionScore>
  adjustedReadiness: {
    supplyReadiness: EvidenceAdjustedDimensionScore
    distributionReadiness: EvidenceAdjustedDimensionScore
    utilityReadiness: EvidenceAdjustedDimensionScore
  }
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallScore: number
  grade: string
  evidenceQualitySummary: string
}

export interface RiskFlag {
  id: string
  severity: 'high' | 'medium' | 'low'
  category: string
  description: string
}

export interface ReportVersion {
  version: number
  date: string
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallScore: number
  /** keccak256 of the canonical report payload — identifies report content */
  reportHash: string
  /** Avalanche publication transaction hash — identifies the on-chain event */
  txHash: string
  analystNote: string
}

/**
 * CanonicalReport — the versioned, deterministically serializable report payload.
 *
 * This is the structure that gets hashed with keccak256 to produce the report hash.
 * It must not include transient UI state (wizard step, loading state, etc.).
 *
 * Optional text fields absent from input are stored as empty string ''.
 * Optional arrays absent from input are stored as [].
 * createdAt is set once when the report version is created, never regenerated on re-render.
 */
export interface CanonicalReport {
  // ── Schema metadata ───────────────────────────────────────────────
  schemaVersion: string
  version: number

  // ── Project identity ─────────────────────────────────────────────
  projectId: string
  projectName: string
  tagline: string
  assetType: string
  chain: string
  websiteUrl: string
  createdAt: string

  // ── Issuer and structure ─────────────────────────────────────────
  issuer: string
  custodian: string
  contractAddress: string
  complianceModel: string
  accessModel: string
  eligibleRegions: string
  distributionChannels: string

  // ── Legal, custody, and compliance ───────────────────────────────
  legalSummary: string
  complianceNotes: string
  custodyLink: string

  // ── Asset backing and redemption ──────────────────────────────────
  proofOfReserveLink: string
  redemptionTerms: string
  liquidityDescription: string

  // ── Distribution ─────────────────────────────────────────────────
  distributionNotes: string

  // ── Utility and DeFi ─────────────────────────────────────────────
  defiUtility: string
  supplyNotes: string
  utilityNotes: string

  // ── Evidence ──────────────────────────────────────────────────────
  auditLink: string
  evidence: EvidenceItem[]
  riskFlags: RiskFlag[]

  // ── Raw scores (as entered by analyst) ───────────────────────────
  trustDimensions: TrustDimensions
  readinessScores: ReadinessScores

  // ── Evidence status per dimension ────────────────────────────────
  trustDimensionEvidenceStatus: TrustDimensionEvidenceStatus
  readinessEvidenceStatus: ReadinessEvidenceStatus

  // ── Evidence-adjusted scoring (computed from above) ───────────────
  scoring: ScoringResult

  // ── Analyst information ───────────────────────────────────────────
  analystNotes: string
}

export type PublicationStatus =
  | 'idle'
  | 'validating'
  | 'awaiting-wallet'
  | 'switching-network'
  | 'hashing'
  | 'submitting'
  | 'pending'
  | 'confirmed'
  | 'failed'

export interface PublicationReceipt {
  /** 'fuji' for a real on-chain publication; 'demo' for a simulated one */
  mode: 'fuji' | 'demo'
  transactionHash: `0x${string}`
  reportHash: `0x${string}`
  projectIdBytes32: `0x${string}`
  publisher: `0x${string}`
  chainId: number
  contractAddress: `0x${string}` | null
  blockNumber: number
  timestamp: string
  version: number
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallReadinessScore: number
  grade: number
  status: 'confirmed' | 'failed'
  explorerUrl: string | null
  /** Whether the emitted ReportPublished event was successfully verified */
  eventVerified: boolean
}

export interface RWAProject {
  id: string
  name: string
  tagline: string
  assetType: AssetType
  chain: ChainName
  issuer: string
  custodian: string
  complianceModel: string
  accessModel: string
  eligibleRegions: string[]
  distributionChannels: string[]
  liquidityDescription: string
  defiUtility: string
  verificationStatus: VerificationStatus
  lastUpdated: string
  version: number
  trustDimensions: TrustDimensions
  /** Optional explicit evidence status per dimension. If absent, inferred from evidence array. */
  trustDimensionEvidenceStatus?: TrustDimensionEvidenceStatus
  readinessScores: ReadinessScores
  readinessEvidenceStatus?: ReadinessEvidenceStatus
  evidence: EvidenceItem[]
  riskFlags: RiskFlag[]
  analystNotes: string
  versionHistory: ReportVersion[]
}

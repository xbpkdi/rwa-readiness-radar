/**
 * Research provider types — separate from CanonicalReport to keep canonical
 * serialization stable. Provenance and review-status are UI concerns and are
 * NOT included in the canonical report hash.
 */

export type FindingProvenance =
  | 'demo'
  | 'user-entered'
  | 'imported'
  | 'provider-generated'
  | 'analyst-edited'
  | 'analyst-approved'
  | 'missing'

export type ReviewStatus = 'pending' | 'approved' | 'needs-review'

export interface ResearchFinding {
  id: string
  category: string
  field: string
  value: string
  provenance: FindingProvenance
  reviewStatus: ReviewStatus
  evidenceUrls: string[]
  analystNotes: string
  isDemo: boolean
}

export interface ResearchEvidence {
  id: string
  title: string
  sourceUrl: string
  category: string
  provenance: FindingProvenance
  reviewStatus: ReviewStatus
  description: string
  analystNotes: string
  includedInReport: boolean
}

export interface ResearchDraft {
  projectName: string
  websiteUrl: string
  tokenContractAddress?: string
  assetType?: string
  chain?: string
  findings: ResearchFinding[]
  evidence: ResearchEvidence[]
  provenance: FindingProvenance
  isDemo: boolean
  createdAt: string
  custodyUrl?: string
  proofOfReserveUrl?: string
  auditUrl?: string
  legalDocumentUrl?: string
}

export interface ResearchRequest {
  websiteUrl: string
  projectName?: string
  assetTokenContract?: string
  network?: string
  evidenceUrls?: Partial<{
    whitepaper: string
    legalDocument: string
    custodyDocument: string
    proofOfReserve: string
    auditReport: string
    redemptionPolicy: string
    complianceDocument: string
    additional: string[]
  }>
}

export interface ResearchResponse {
  draft: ResearchDraft
  providerName: string
  isDemo: boolean
}

export interface ResearchProviderError {
  code: string
  message: string
  details?: string
}

export interface ResearchProvider {
  readonly name: string
  readonly isDemo: boolean
  research(request: ResearchRequest): Promise<ResearchResponse>
}

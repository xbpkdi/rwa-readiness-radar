import type { ResearchProvider, ResearchRequest, ResearchResponse, ResearchDraft, ResearchEvidence } from '@/domain/research-types'

/**
 * ManualResearchProvider creates a structured empty draft from user-supplied URLs.
 *
 * It does NOT invent, generate, or fabricate any findings.
 * Fields that cannot be determined from the supplied URLs are left empty.
 * Evidence status is left as 'missing' — the analyst must fill in all findings.
 *
 * URL documents are listed as 'imported' evidence requiring analyst review.
 * A URL alone does not become Verified evidence.
 */
export const manualResearchProvider: ResearchProvider = {
  name: 'ManualResearchProvider',
  isDemo: false,

  async research(request: ResearchRequest): Promise<ResearchResponse> {
    const evidence: ResearchEvidence[] = []
    const urls = request.evidenceUrls ?? {}

    if (urls.custodyDocument) {
      evidence.push({
        id: 'imported-custody',
        title: 'Custody Document',
        sourceUrl: urls.custodyDocument,
        category: 'Custody Documents',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.proofOfReserve) {
      evidence.push({
        id: 'imported-por',
        title: 'Proof of Reserve',
        sourceUrl: urls.proofOfReserve,
        category: 'Proof of Reserve',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.auditReport) {
      evidence.push({
        id: 'imported-audit',
        title: 'Audit Report',
        sourceUrl: urls.auditReport,
        category: 'Audit Report',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.legalDocument) {
      evidence.push({
        id: 'imported-legal',
        title: 'Legal Document',
        sourceUrl: urls.legalDocument,
        category: 'Legal Documents',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.whitepaper) {
      evidence.push({
        id: 'imported-whitepaper',
        title: 'Whitepaper',
        sourceUrl: urls.whitepaper,
        category: 'Official Website',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.redemptionPolicy) {
      evidence.push({
        id: 'imported-redemption',
        title: 'Redemption Policy',
        sourceUrl: urls.redemptionPolicy,
        category: 'Redemption Documentation',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    if (urls.complianceDocument) {
      evidence.push({
        id: 'imported-compliance',
        title: 'Compliance Document',
        sourceUrl: urls.complianceDocument,
        category: 'Compliance Documentation',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }
    for (const [i, url] of (urls.additional ?? []).entries()) {
      evidence.push({
        id: `imported-additional-${i}`,
        title: `Additional Evidence ${i + 1}`,
        sourceUrl: url,
        category: 'Other Supporting Evidence',
        provenance: 'imported',
        reviewStatus: 'pending',
        description: 'Analyst review required — URL supplied but contents not verified.',
        analystNotes: '',
        includedInReport: false,
      })
    }

    const draft: ResearchDraft = {
      projectName: request.projectName ?? '',
      websiteUrl: request.websiteUrl,
      tokenContractAddress: request.assetTokenContract,
      chain: request.network ?? 'Avalanche C-Chain',
      custodyUrl: urls.custodyDocument,
      proofOfReserveUrl: urls.proofOfReserve,
      auditUrl: urls.auditReport,
      legalDocumentUrl: urls.legalDocument,
      findings: [],
      evidence,
      provenance: 'user-entered',
      isDemo: false,
      createdAt: new Date().toISOString(),
    }

    return {
      draft,
      providerName: 'ManualResearchProvider',
      isDemo: false,
    }
  },
}

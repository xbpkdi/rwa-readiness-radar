import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, AlertTriangle, RotateCcw, Copy, CheckCircle2, Info, FlaskConical, X } from 'lucide-react'
import { useReportDraft } from '@/context/useReportDraft'
import {
  gradeFor,
  computeFullScoringResult,
  DEFAULT_TRUST_EVIDENCE_STATUS,
  DEFAULT_READINESS_EVIDENCE_STATUS,
} from '@/utils/scoring'
import { hashCanonicalReport } from '@/utils/canonical-report'
import { TRUST_DIMENSION_LABELS, TRUST_DIMENSION_MAXIMUMS, EVIDENCE_CAPS, EVIDENCE_STATUS_LABELS } from '@/config/scoring'
import { isValidUrl, isValidEthAddress, hasExampleDomain, URL_ERROR, ETH_ADDRESS_ERROR, EXAMPLE_DOMAIN_WARNING } from '@/utils/validation'
import { truncateHash } from '@/utils/format'
import { buildDemoReport } from '@/data/demo-report'
import type {
  TrustDimensions,
  ReadinessScores,
  CanonicalReport,
  EvidenceStatus,
  TrustDimensionKey,
  TrustDimensionEvidenceStatus,
  ReadinessEvidenceStatus,
} from '@/domain/types'

// ─── Form model ──────────────────────────────────────────────────────────────

interface FormData {
  // Step 0 – Project Basics
  projectName: string
  tagline: string
  assetType: string
  chain: string
  websiteUrl: string

  // Step 1 – Asset & Issuer
  issuer: string
  custodian: string
  complianceModel: string
  accessModel: string
  eligibleRegions: string

  // Step 2 – Legal & Custody
  legalSummary: string
  complianceNotes: string
  custodyLink: string

  // Step 3 – Backing & Redemption
  proofOfReserveLink: string
  redemptionTerms: string

  // Step 4 – Distribution
  distributionChannels: string
  liquidityDescription: string
  distributionNotes: string

  // Step 5 – Utility & DeFi
  defiUtility: string
  utilityNotes: string

  // Step 6 – Evidence
  contractAddress: string
  auditLink: string
  supplyNotes: string
  analystNotes: string

  // Step 7 – Scoring
  trustDimensions: TrustDimensions
  trustDimensionEvidenceStatus: TrustDimensionEvidenceStatus
  readinessScores: ReadinessScores
  readinessEvidenceStatus: ReadinessEvidenceStatus

  // Demo flag — not in canonical report; UI-only for validation purposes
  isDemoData: boolean
}

const DEFAULT_FORM: FormData = {
  projectName: '',
  tagline: '',
  assetType: 'tokenized-treasury',
  chain: 'Avalanche C-Chain',
  websiteUrl: '',
  issuer: '',
  custodian: '',
  complianceModel: '',
  accessModel: '',
  eligibleRegions: '',
  legalSummary: '',
  complianceNotes: '',
  custodyLink: '',
  proofOfReserveLink: '',
  redemptionTerms: '',
  distributionChannels: '',
  liquidityDescription: '',
  distributionNotes: '',
  defiUtility: '',
  utilityNotes: '',
  contractAddress: '',
  auditLink: '',
  supplyNotes: '',
  analystNotes: '',
  trustDimensions: {
    legalClarity: 0,
    custodyTransparency: 0,
    assetBacking: 0,
    redemptionProcess: 0,
    compliance: 0,
    issuerCredibility: 0,
    smartContractTransparency: 0,
    liquidityRisk: 0,
  },
  trustDimensionEvidenceStatus: { ...DEFAULT_TRUST_EVIDENCE_STATUS },
  readinessScores: {
    supplyReadiness: 0,
    distributionReadiness: 0,
    utilityReadiness: 0,
  },
  readinessEvidenceStatus: { ...DEFAULT_READINESS_EVIDENCE_STATUS },
  isDemoData: false,
}

const STEPS = [
  'Project Basics',
  'Asset & Issuer',
  'Legal & Custody',
  'Backing & Redemption',
  'Distribution',
  'Utility & DeFi',
  'Evidence Links',
  'Scoring Review',
  'Report Preview',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function draftToForm(draft: Partial<CanonicalReport>): FormData {
  const d = draft
  const isDemoData = d.projectId === 'meridian-t-bill-fund'
  return {
    projectName: d.projectName ?? '',
    tagline: d.tagline ?? '',
    assetType: d.assetType ?? 'tokenized-treasury',
    chain: d.chain ?? 'Avalanche C-Chain',
    websiteUrl: d.websiteUrl ?? '',
    issuer: d.issuer ?? '',
    custodian: d.custodian ?? '',
    complianceModel: d.complianceModel ?? '',
    accessModel: d.accessModel ?? '',
    eligibleRegions: d.eligibleRegions ?? '',
    legalSummary: d.legalSummary ?? '',
    complianceNotes: d.complianceNotes ?? '',
    custodyLink: d.custodyLink ?? '',
    proofOfReserveLink: d.proofOfReserveLink ?? '',
    redemptionTerms: d.redemptionTerms ?? '',
    distributionChannels: d.distributionChannels ?? '',
    liquidityDescription: d.liquidityDescription ?? '',
    distributionNotes: d.distributionNotes ?? '',
    defiUtility: d.defiUtility ?? '',
    utilityNotes: d.utilityNotes ?? '',
    contractAddress: d.contractAddress ?? '',
    auditLink: d.auditLink ?? '',
    supplyNotes: d.supplyNotes ?? '',
    analystNotes: d.analystNotes ?? '',
    trustDimensions: d.trustDimensions ?? DEFAULT_FORM.trustDimensions,
    trustDimensionEvidenceStatus: d.trustDimensionEvidenceStatus ?? { ...DEFAULT_TRUST_EVIDENCE_STATUS },
    readinessScores: d.readinessScores ?? DEFAULT_FORM.readinessScores,
    readinessEvidenceStatus: d.readinessEvidenceStatus ?? { ...DEFAULT_READINESS_EVIDENCE_STATUS },
    isDemoData,
  }
}

function validatePublish(form: FormData): {
  valid: boolean
  errors: Record<string, string>
  firstInvalidStep: number
} {
  const errors: Record<string, string> = {}
  let firstInvalidStep = STEPS.length

  if (!form.projectName.trim()) {
    errors.projectName = 'Project name is required'
    firstInvalidStep = Math.min(firstInvalidStep, 0)
  }
  if (!form.tagline.trim()) {
    errors.tagline = 'Tagline is required'
    firstInvalidStep = Math.min(firstInvalidStep, 0)
  }
  if (form.websiteUrl && !isValidUrl(form.websiteUrl)) {
    errors.websiteUrl = URL_ERROR
    firstInvalidStep = Math.min(firstInvalidStep, 0)
  }
  if (!form.issuer.trim()) {
    errors.issuer = 'Issuer name is required'
    firstInvalidStep = Math.min(firstInvalidStep, 1)
  }
  if (!form.legalSummary.trim()) {
    errors.legalSummary = 'Required — describe the legal structure or write "Not publicly disclosed"'
    firstInvalidStep = Math.min(firstInvalidStep, 2)
  }
  if (!isValidUrl(form.custodyLink)) {
    errors.custodyLink = URL_ERROR
    firstInvalidStep = Math.min(firstInvalidStep, 2)
  }
  if (!isValidUrl(form.proofOfReserveLink)) {
    errors.proofOfReserveLink = URL_ERROR
    firstInvalidStep = Math.min(firstInvalidStep, 3)
  }
  if (!isValidUrl(form.auditLink)) {
    errors.auditLink = URL_ERROR
    firstInvalidStep = Math.min(firstInvalidStep, 6)
  }
  if (form.contractAddress && !isValidEthAddress(form.contractAddress)) {
    errors.contractAddress = ETH_ADDRESS_ERROR
    firstInvalidStep = Math.min(firstInvalidStep, 6)
  }

  return { valid: Object.keys(errors).length === 0, errors, firstInvalidStep }
}

function buildCanonicalReport(form: FormData, existingCreatedAt?: string): CanonicalReport {
  const scoring = computeFullScoringResult(
    form.trustDimensions,
    form.trustDimensionEvidenceStatus,
    form.readinessScores,
    form.readinessEvidenceStatus,
    [],
  )
  return {
    schemaVersion: '1.0',
    projectId: form.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    projectName: form.projectName,
    tagline: form.tagline,
    assetType: form.assetType,
    chain: form.chain,
    websiteUrl: form.websiteUrl,
    version: 1,
    createdAt: existingCreatedAt ?? new Date().toISOString(),
    issuer: form.issuer,
    custodian: form.custodian,
    contractAddress: form.contractAddress,
    complianceModel: form.complianceModel,
    accessModel: form.accessModel,
    eligibleRegions: form.eligibleRegions,
    distributionChannels: form.distributionChannels,
    legalSummary: form.legalSummary,
    complianceNotes: form.complianceNotes,
    custodyLink: form.custodyLink,
    proofOfReserveLink: form.proofOfReserveLink,
    redemptionTerms: form.redemptionTerms,
    liquidityDescription: form.liquidityDescription,
    distributionNotes: form.distributionNotes,
    defiUtility: form.defiUtility,
    supplyNotes: form.supplyNotes,
    utilityNotes: form.utilityNotes,
    auditLink: form.auditLink,
    evidence: [],
    riskFlags: [],
    trustDimensions: form.trustDimensions,
    trustDimensionEvidenceStatus: form.trustDimensionEvidenceStatus,
    readinessScores: form.readinessScores,
    readinessEvidenceStatus: form.readinessEvidenceStatus,
    scoring,
    analystNotes: form.analystNotes,
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Submit() {
  const { draft, setDraft, clearDraft } = useReportDraft()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(() =>
    draft ? draftToForm(draft) : { ...DEFAULT_FORM },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewReport, setPreviewReport] = useState<CanonicalReport | null>(null)
  const [previewHash, setPreviewHash] = useState<`0x${string}` | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const navigate = useNavigate()
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [step])

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }))
  const updateDims = (patch: Partial<TrustDimensions>) =>
    setForm((f) => ({ ...f, trustDimensions: { ...f.trustDimensions, ...patch } }))
  const updateDimStatus = (patch: Partial<TrustDimensionEvidenceStatus>) =>
    setForm((f) => ({ ...f, trustDimensionEvidenceStatus: { ...f.trustDimensionEvidenceStatus, ...patch } }))
  const updateReadiness = (patch: Partial<ReadinessScores>) =>
    setForm((f) => ({ ...f, readinessScores: { ...f.readinessScores, ...patch } }))
  const updateReadinessStatus = (patch: Partial<ReadinessEvidenceStatus>) =>
    setForm((f) => ({ ...f, readinessEvidenceStatus: { ...f.readinessEvidenceStatus, ...patch } }))

  // Compute live scoring (evidence-adjusted)
  const scoring = computeFullScoringResult(
    form.trustDimensions,
    form.trustDimensionEvidenceStatus,
    form.readinessScores,
    form.readinessEvidenceStatus,
    [],
  )
  const { trustScore, supplyScore, distributionScore, utilityScore, overallScore } = scoring

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.projectName.trim()) e.projectName = 'Project name is required'
      if (!form.tagline.trim()) e.tagline = 'Tagline is required'
      if (form.websiteUrl && !isValidUrl(form.websiteUrl)) e.websiteUrl = URL_ERROR
    }
    if (s === 1) {
      if (!form.issuer.trim()) e.issuer = 'Issuer name is required'
    }
    if (s === 2) {
      if (!form.legalSummary.trim()) {
        e.legalSummary = 'Required — describe the legal structure or write "Not publicly disclosed"'
      }
      if (!isValidUrl(form.custodyLink)) e.custodyLink = URL_ERROR
    }
    if (s === 3) {
      if (!isValidUrl(form.proofOfReserveLink)) e.proofOfReserveLink = URL_ERROR
    }
    if (s === 6) {
      if (!isValidUrl(form.auditLink)) e.auditLink = URL_ERROR
      if (form.contractAddress && !isValidEthAddress(form.contractAddress)) e.contractAddress = ETH_ADDRESS_ERROR
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    if (step === 7) {
      // Generate preview report and hash when entering step 8
      const report = buildCanonicalReport(form, draft?.createdAt)
      const hash = hashCanonicalReport(report)
      setPreviewReport(report)
      setPreviewHash(hash)
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    setErrors({})
  }

  const back = () => {
    setStep((s) => Math.max(s - 1, 0))
    setErrors({})
  }

  const handlePublish = () => {
    const { valid, errors: publishErrors, firstInvalidStep } = validatePublish(form)
    if (!valid) {
      setErrors(publishErrors)
      setStep(firstInvalidStep)
      return
    }
    setErrors({})
    const report = previewReport ?? buildCanonicalReport(form, draft?.createdAt)
    const hash = previewHash ?? hashCanonicalReport(report)
    setDraft(report, hash)
    navigate('/publish')
  }

  const handleClearDraft = () => {
    if (!window.confirm('Start a new report? Current draft will be cleared.')) return
    clearDraft()
    setForm({ ...DEFAULT_FORM })
    setPreviewReport(null)
    setPreviewHash(null)
    setStep(0)
    setErrors({})
  }

  const handleCopyHash = async () => {
    if (!previewHash) return
    await navigator.clipboard.writeText(previewHash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const handleLoadDemo = () => {
    const hasMeaningfulDraft = form.projectName.trim()
    if (hasMeaningfulDraft && !window.confirm('Load the Meridian T-Bill Fund demo? Your current draft will be replaced.')) return
    const demoReport = buildDemoReport()
    const demoHash = hashCanonicalReport(demoReport)
    setDraft(demoReport, demoHash)
    setForm(draftToForm(demoReport))
    setPreviewReport(null)
    setPreviewHash(null)
    setStep(0)
    setErrors({})
  }

  const missingEvidence: string[] = []
  if (!form.custodyLink) missingEvidence.push('Custody evidence link')
  if (!form.proofOfReserveLink) missingEvidence.push('Proof of reserve link')
  if (!form.auditLink) missingEvidence.push('Audit report link')
  if (!form.contractAddress) missingEvidence.push('Asset / Token Contract Address')
  if (!form.legalSummary) missingEvidence.push('Legal claim summary')

  // Dimensions where evidence cap reduces the score
  const cappedDims = (Object.keys(TRUST_DIMENSION_LABELS) as TrustDimensionKey[]).filter((key) => {
    const adj = scoring.adjustedTrustDimensions[key]
    return adj.adjustedScore < adj.rawScore
  })

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">New Report</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-display font-bold">Submit a Readiness Report</h1>
          <p className="mt-2 text-sm text-[var(--muted-fg)] max-w-2xl">
            Complete the nine-step wizard to build a structured RWA readiness assessment. Evidence links
            and scoring are preserved across steps. When ready, proceed to publish.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--warning)] glass border border-[var(--warning)]/20 hover:bg-[var(--warning)]/10 transition-colors"
          >
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Load demo
          </button>
          {draft && (
            <button
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--muted-fg)] glass border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Start new report
            </button>
          )}
        </div>
      </div>

      {/* Demo data banner */}
      {form.isDemoData && (
        <div className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--warning)]/5 border border-[var(--warning)]/20">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-[var(--warning)] shrink-0" aria-hidden="true" />
            <p className="text-xs text-[var(--warning)] font-medium">
              Fictional demo data — not real research.
              <span className="text-[var(--muted-fg)] font-normal ml-1">
                All scores, evidence links, and fields are placeholders for demonstration only.
              </span>
            </p>
          </div>
          <button
            onClick={() => update({ isDemoData: false })}
            className="shrink-0 p-1 rounded text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Dismiss demo notice"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Mobile progress */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted-fg)]">Step {step + 1} of {STEPS.length}</span>
          <span className="text-xs font-medium">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step indicator */}
      <nav aria-label="Submission progress" className="mb-8">
        <ol className="hidden sm:grid sm:grid-cols-5 lg:grid-cols-9 gap-1">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={i === step ? 'step' : undefined}
                className={`w-full text-center px-2 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                  i === step
                    ? 'bg-gradient-to-r from-[var(--avax)]/20 to-[var(--azure)]/20 text-[var(--foreground)] border border-[var(--avax)]/30'
                    : i < step
                    ? 'text-[var(--success)] cursor-pointer hover:bg-white/5'
                    : 'text-[var(--muted-fg)] cursor-default'
                }`}
              >
                <span className={`block font-mono mb-0.5 ${i === step ? 'text-[var(--avax)]' : ''}`}>{i + 1}</span>
                <span className="uppercase tracking-wider">{s}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {/* Step 0 — Project Basics */}
              {step === 0 && (
                <StepSection title="Project Basics" headingRef={stepHeadingRef}>
                  <Field label="Project name *" error={errors.projectName}>
                    <TextInput value={form.projectName} onChange={(v) => update({ projectName: v })} placeholder="e.g. Meridian T-Bill Fund" />
                  </Field>
                  <Field label="Tagline *" error={errors.tagline}>
                    <TextInput value={form.tagline} onChange={(v) => update({ tagline: v })} placeholder="One-line description of the asset" />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Asset type">
                      <SelectInput
                        value={form.assetType}
                        onChange={(v) => update({ assetType: v })}
                        options={[
                          { value: 'tokenized-treasury', label: 'Tokenized Treasury' },
                          { value: 'private-credit', label: 'Private Credit' },
                          { value: 'tokenized-equity', label: 'Tokenized Equity' },
                          { value: 'real-estate', label: 'Real Estate' },
                          { value: 'commodity', label: 'Commodity' },
                          { value: 'invoice-financing', label: 'Invoice Financing' },
                        ]}
                      />
                    </Field>
                    <Field label="Chain / network">
                      <SelectInput
                        value={form.chain}
                        onChange={(v) => update({ chain: v })}
                        options={[
                          { value: 'Avalanche C-Chain', label: 'Avalanche C-Chain' },
                          { value: 'Avalanche L1', label: 'Avalanche L1' },
                          { value: 'Ethereum', label: 'Ethereum' },
                          { value: 'Other', label: 'Other' },
                        ]}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Project website"
                    error={errors.websiteUrl}
                    warning={!form.isDemoData && hasExampleDomain(form.websiteUrl) ? EXAMPLE_DOMAIN_WARNING : undefined}
                  >
                    <TextInput value={form.websiteUrl} onChange={(v) => update({ websiteUrl: v })} placeholder="https://" type="url" />
                  </Field>
                </StepSection>
              )}

              {/* Step 1 — Asset & Issuer */}
              {step === 1 && (
                <StepSection title="Asset & Issuer" headingRef={stepHeadingRef}>
                  <Field label="Issuer name *" error={errors.issuer}>
                    <TextInput value={form.issuer} onChange={(v) => update({ issuer: v })} placeholder="e.g. Acme Capital Management Ltd" />
                  </Field>
                  <Field label="Custodian">
                    <TextInput value={form.custodian} onChange={(v) => update({ custodian: v })} placeholder="e.g. Northern Trust (custody) / Fireblocks (digital)" />
                  </Field>
                  <Field label="Compliance model">
                    <TextInput value={form.complianceModel} onChange={(v) => update({ complianceModel: v })} placeholder="e.g. Reg D 506(c); AML/KYC gated" />
                  </Field>
                  <Field label="Access model">
                    <TextInput value={form.accessModel} onChange={(v) => update({ accessModel: v })} placeholder="e.g. Permissioned — accredited investors only" />
                  </Field>
                  <Field label="Eligible regions">
                    <TextInput value={form.eligibleRegions} onChange={(v) => update({ eligibleRegions: v })} placeholder="e.g. US (accredited), EU, Singapore" />
                  </Field>
                </StepSection>
              )}

              {/* Step 2 — Legal & Custody */}
              {step === 2 && (
                <StepSection title="Legal & Custody" headingRef={stepHeadingRef}>
                  <Field label="Legal claim summary *" error={errors.legalSummary}>
                    <TextArea value={form.legalSummary} onChange={(v) => update({ legalSummary: v })} placeholder='Describe the legal structure, jurisdiction, investor protections… or write "Not publicly disclosed"' />
                  </Field>
                  <Field label="Compliance notes">
                    <TextArea value={form.complianceNotes} onChange={(v) => update({ complianceNotes: v })} placeholder="AML/KYC provider, regulatory filings…" />
                  </Field>
                  <Field
                    label="Custody evidence link"
                    error={errors.custodyLink}
                    warning={!form.isDemoData && hasExampleDomain(form.custodyLink) ? EXAMPLE_DOMAIN_WARNING : undefined}
                  >
                    <TextInput value={form.custodyLink} onChange={(v) => update({ custodyLink: v })} placeholder="https://" type="url" />
                  </Field>
                </StepSection>
              )}

              {/* Step 3 — Asset Backing & Redemption */}
              {step === 3 && (
                <StepSection title="Asset Backing & Redemption" headingRef={stepHeadingRef}>
                  <Field
                    label="Proof of reserve link"
                    error={errors.proofOfReserveLink}
                    warning={!form.isDemoData && hasExampleDomain(form.proofOfReserveLink) ? EXAMPLE_DOMAIN_WARNING : undefined}
                  >
                    <TextInput value={form.proofOfReserveLink} onChange={(v) => update({ proofOfReserveLink: v })} placeholder="https://" type="url" />
                  </Field>
                  <Field label="Redemption terms">
                    <TextArea value={form.redemptionTerms} onChange={(v) => update({ redemptionTerms: v })} placeholder="Describe redemption mechanism, cut-off times, fees…" />
                  </Field>
                </StepSection>
              )}

              {/* Step 4 — Distribution */}
              {step === 4 && (
                <StepSection title="Distribution" headingRef={stepHeadingRef}>
                  <Field label="Distribution channels">
                    <TextInput value={form.distributionChannels} onChange={(v) => update({ distributionChannels: v })} placeholder="e.g. Prime brokerage, DEX, Direct OTC" />
                  </Field>
                  <Field label="Liquidity description">
                    <TextArea value={form.liquidityDescription} onChange={(v) => update({ liquidityDescription: v })} placeholder="Primary and secondary market liquidity…" />
                  </Field>
                  <Field label="Distribution notes">
                    <TextArea value={form.distributionNotes} onChange={(v) => update({ distributionNotes: v })} placeholder="Analyst observations on distribution quality…" />
                  </Field>
                </StepSection>
              )}

              {/* Step 5 — Utility & DeFi */}
              {step === 5 && (
                <StepSection title="Utility & DeFi" headingRef={stepHeadingRef}>
                  <Field label="DeFi utility">
                    <TextArea value={form.defiUtility} onChange={(v) => update({ defiUtility: v })} placeholder='Describe DeFi integrations, collateral use, yield mechanisms… or write "None identified"' />
                  </Field>
                  <Field label="Utility notes">
                    <TextArea value={form.utilityNotes} onChange={(v) => update({ utilityNotes: v })} placeholder="Analyst notes on utility readiness…" />
                  </Field>
                </StepSection>
              )}

              {/* Step 6 — Evidence Links */}
              {step === 6 && (
                <StepSection title="Evidence Links" headingRef={stepHeadingRef}>
                  <Field
                    label="Asset / Token Contract Address"
                    helpText="Optional. Enter the smart-contract address of the RWA asset being assessed. This is not the RWA Readiness Registry contract."
                    error={errors.contractAddress}
                  >
                    <TextInput value={form.contractAddress} onChange={(v) => update({ contractAddress: v })} placeholder="0x… (optional)" mono />
                  </Field>
                  <Field
                    label="Audit report link"
                    error={errors.auditLink}
                    warning={!form.isDemoData && hasExampleDomain(form.auditLink) ? EXAMPLE_DOMAIN_WARNING : undefined}
                  >
                    <TextInput value={form.auditLink} onChange={(v) => update({ auditLink: v })} placeholder="https://" type="url" />
                  </Field>
                  <Field label="Supply notes">
                    <TextArea value={form.supplyNotes} onChange={(v) => update({ supplyNotes: v })} placeholder="Notes on token supply mechanics, issuance controls…" />
                  </Field>
                  <Field label="Analyst notes">
                    <TextArea value={form.analystNotes} onChange={(v) => update({ analystNotes: v })} placeholder="Overall analyst observations and caveats…" />
                  </Field>
                </StepSection>
              )}

              {/* Step 7 — Scoring Review (with evidence-aware caps) */}
              {step === 7 && (
                <StepSection title="Scoring Review" headingRef={stepHeadingRef}>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--azure)]/5 border border-[var(--azure)]/20 mb-4">
                    <Info className="h-3.5 w-3.5 text-[var(--azure)] mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-[var(--muted-fg)]">
                      Set the evidence status for each dimension, then enter the raw score. The adjusted score is
                      the maximum that can be supported by available evidence — raw scores above the cap are reduced.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">Trust Foundation</h3>
                    {(Object.keys(TRUST_DIMENSION_LABELS) as TrustDimensionKey[]).map((key) => {
                      const adjScore = scoring.adjustedTrustDimensions[key]
                      return (
                        <EvidenceAwareScoreSlider
                          key={key}
                          label={TRUST_DIMENSION_LABELS[key]}
                          rawValue={form.trustDimensions[key]}
                          max={TRUST_DIMENSION_MAXIMUMS[key]}
                          evidenceStatus={form.trustDimensionEvidenceStatus[key]}
                          adjustedScore={adjScore.adjustedScore}
                          maximumAllowedScore={adjScore.maximumAllowedScore}
                          explanation={adjScore.explanation}
                          onValueChange={(v) => updateDims({ [key]: v } as Partial<TrustDimensions>)}
                          onStatusChange={(s) => updateDimStatus({ [key]: s } as Partial<TrustDimensionEvidenceStatus>)}
                        />
                      )
                    })}

                    <h3 className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider pt-2">Market Readiness</h3>

                    <EvidenceAwareScoreSlider
                      label="Supply Readiness"
                      rawValue={form.readinessScores.supplyReadiness}
                      max={100}
                      evidenceStatus={form.readinessEvidenceStatus.supplyReadiness}
                      adjustedScore={scoring.adjustedReadiness.supplyReadiness.adjustedScore}
                      maximumAllowedScore={scoring.adjustedReadiness.supplyReadiness.maximumAllowedScore}
                      explanation={scoring.adjustedReadiness.supplyReadiness.explanation}
                      onValueChange={(v) => updateReadiness({ supplyReadiness: v })}
                      onStatusChange={(s) => updateReadinessStatus({ supplyReadiness: s })}
                    />
                    <EvidenceAwareScoreSlider
                      label="Distribution Readiness"
                      rawValue={form.readinessScores.distributionReadiness}
                      max={100}
                      evidenceStatus={form.readinessEvidenceStatus.distributionReadiness}
                      adjustedScore={scoring.adjustedReadiness.distributionReadiness.adjustedScore}
                      maximumAllowedScore={scoring.adjustedReadiness.distributionReadiness.maximumAllowedScore}
                      explanation={scoring.adjustedReadiness.distributionReadiness.explanation}
                      onValueChange={(v) => updateReadiness({ distributionReadiness: v })}
                      onStatusChange={(s) => updateReadinessStatus({ distributionReadiness: s })}
                    />
                    <EvidenceAwareScoreSlider
                      label="Utility Readiness"
                      rawValue={form.readinessScores.utilityReadiness}
                      max={100}
                      evidenceStatus={form.readinessEvidenceStatus.utilityReadiness}
                      adjustedScore={scoring.adjustedReadiness.utilityReadiness.adjustedScore}
                      maximumAllowedScore={scoring.adjustedReadiness.utilityReadiness.maximumAllowedScore}
                      explanation={scoring.adjustedReadiness.utilityReadiness.explanation}
                      onValueChange={(v) => updateReadiness({ utilityReadiness: v })}
                      onStatusChange={(s) => updateReadinessStatus({ utilityReadiness: s })}
                    />
                  </div>
                </StepSection>
              )}

              {/* Step 8 — Report Preview */}
              {step === 8 && (
                <StepSection title="Report Preview" headingRef={stepHeadingRef}>
                  <p className="text-xs text-[var(--muted-fg)] mb-4">
                    Review the final report before proceeding to the publication workflow.
                    The report hash below is the keccak256 digest of the canonical payload.
                  </p>

                  {/* Report hash */}
                  {previewHash && (
                    <div className="mb-4 p-4 rounded-xl bg-white/3 border border-white/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">Report Hash (keccak256)</span>
                        <button
                          onClick={handleCopyHash}
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
                          aria-label="Copy report hash"
                        >
                          {copiedHash ? <CheckCircle2 className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
                          {copiedHash ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <code className="font-mono text-xs text-[var(--azure)] break-all">{previewHash}</code>
                      <p className="text-[10px] text-[var(--muted-fg)] mt-2">
                        Schema v{previewReport?.schemaVersion} · Report v{previewReport?.version} · This hash will be verified in the Publish flow.
                      </p>
                    </div>
                  )}

                  {/* Core fields */}
                  <div className="space-y-1 mb-4">
                    <PreviewRow label="Project" value={form.projectName || '—'} />
                    <PreviewRow label="Tagline" value={form.tagline || '—'} />
                    <PreviewRow label="Asset type" value={form.assetType} />
                    <PreviewRow label="Chain" value={form.chain} />
                    <PreviewRow label="Issuer" value={form.issuer || '—'} />
                    {form.custodian && <PreviewRow label="Custodian" value={form.custodian} />}
                    {form.complianceModel && <PreviewRow label="Compliance" value={form.complianceModel} />}
                  </div>

                  {/* Evidence links */}
                  <div className="space-y-1 mb-4">
                    <PreviewRow label="Custody link" value={form.custodyLink || '—'} />
                    <PreviewRow label="Proof of reserve" value={form.proofOfReserveLink || '—'} />
                    <PreviewRow label="Audit link" value={form.auditLink || '—'} />
                    <PreviewRow label="Contract address" value={form.contractAddress || '—'} mono />
                  </div>

                  {/* Adjusted scores */}
                  <div className="space-y-1 mb-4">
                    <PreviewRow label="Overall score (adj.)" value={String(overallScore)} />
                    <PreviewRow label="Trust score (adj.)" value={String(trustScore)} />
                    <PreviewRow label="Supply score (adj.)" value={String(supplyScore)} />
                    <PreviewRow label="Distribution score (adj.)" value={String(distributionScore)} />
                    <PreviewRow label="Utility score (adj.)" value={String(utilityScore)} />
                    <PreviewRow label="Grade" value={`${gradeFor(overallScore).grade} — ${gradeFor(overallScore).label}`} />
                  </div>

                  {/* Evidence caps applied */}
                  {cappedDims.length > 0 && (
                    <div className="mb-4 p-4 rounded-xl bg-[var(--warning)]/5 border border-[var(--warning)]/25">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--warning)] mb-2">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        Evidence caps applied ({cappedDims.length} dimension{cappedDims.length > 1 ? 's' : ''})
                      </div>
                      <ul className="space-y-1">
                        {cappedDims.map((key) => {
                          const adj = scoring.adjustedTrustDimensions[key]
                          return (
                            <li key={key} className="text-xs text-[var(--muted-fg)]">
                              <span className="text-[var(--warning)]">·</span>{' '}
                              {TRUST_DIMENSION_LABELS[key]}: raw {adj.rawScore} → adjusted {adj.adjustedScore}
                              {' '}({EVIDENCE_STATUS_LABELS[adj.evidenceStatus]}, cap {Math.round(adj.evidenceCap * 100)}%)
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {missingEvidence.length > 0 && (
                    <div className="mb-4 p-4 rounded-xl bg-[var(--warning)]/5 border border-[var(--warning)]/25">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--warning)] mb-2">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        Missing evidence ({missingEvidence.length})
                      </div>
                      <ul className="space-y-1">
                        {missingEvidence.map((m) => (
                          <li key={m} className="text-xs text-[var(--muted-fg)] flex gap-2">
                            <span className="text-[var(--warning)]">·</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handlePublish}
                    className="mt-2 w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity glow-red"
                  >
                    Proceed to Publish
                  </button>
                </StepSection>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Back / Continue navigation */}
          {step < 8 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium glass border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity"
              >
                Continue
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Live preview sidebar */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--muted-fg)] mb-3">Live preview (adjusted)</div>
            <div className="text-center py-4 border-b border-white/8 mb-4">
              <div className={`font-display text-5xl font-bold tabular-nums ${gradeColor(gradeFor(overallScore).color)}`}>
                {overallScore}
              </div>
              <div className="text-xs text-[var(--muted-fg)] mt-1 uppercase tracking-wider">Overall Readiness</div>
              <div className={`font-semibold text-sm mt-1 ${gradeColor(gradeFor(overallScore).color)}`}>
                Grade {gradeFor(overallScore).grade} · {gradeFor(overallScore).label}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <MiniScore label="Trust" value={trustScore} />
              <MiniScore label="Supply" value={supplyScore} />
              <MiniScore label="Distribution" value={distributionScore} />
              <MiniScore label="Utility" value={utilityScore} />
            </div>
            {previewHash && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Report hash</div>
                <code className="font-mono text-[10px] text-[var(--azure)] break-all">{truncateHash(previewHash, 8)}</code>
              </div>
            )}
            {missingEvidence.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex items-center gap-1.5 text-xs text-[var(--warning)] font-medium mb-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {missingEvidence.length} evidence gap{missingEvidence.length > 1 ? 's' : ''}
                </div>
                <p className="text-[10px] text-[var(--muted-fg)]">
                  Evidence status caps adjust the maximum score per dimension. Set status in Step 8.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function gradeColor(color: string) {
  const map: Record<string, string> = {
    success: 'text-[var(--success)]',
    azure:   'text-[var(--azure)]',
    warning: 'text-[var(--warning)]',
    avax:    'text-[var(--avax)]',
  }
  return map[color] ?? 'text-[var(--foreground)]'
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg px-2 py-2 text-center">
      <div className="font-mono font-semibold text-sm">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</div>
    </div>
  )
}

function StepSection({
  title,
  children,
  headingRef,
}: {
  title: string
  children: React.ReactNode
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-lg font-semibold mb-5 focus:outline-none">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  children,
  error,
  warning,
  helpText,
}: {
  label: string
  children: React.ReactNode
  error?: string
  warning?: string
  helpText?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-[var(--muted-fg)] mb-1.5">{label}</label>
      {helpText && <p className="text-[11px] text-[var(--muted-fg)] mb-1.5">{helpText}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-[var(--avax)]" role="alert">{error}</p>}
      {!error && warning && <p className="mt-1 text-xs text-[var(--warning)]">{warning}</p>}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  mono,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--azure)]/50 focus:ring-1 focus:ring-[var(--azure)]/20 transition-all ${mono ? 'font-mono' : ''}`}
    />
  )
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--azure)]/50 focus:ring-1 focus:ring-[var(--azure)]/20 transition-all resize-none"
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[var(--azure)]/50 transition-colors"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ backgroundColor: 'var(--background)' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

const EVIDENCE_STATUS_OPTIONS: { value: EvidenceStatus; label: string }[] = [
  { value: 'verified', label: `Verified (${Math.round(EVIDENCE_CAPS.verified * 100)}%)` },
  { value: 'partial', label: `Partial (${Math.round(EVIDENCE_CAPS.partial * 100)}%)` },
  { value: 'manual-review', label: `Needs Review (${Math.round(EVIDENCE_CAPS['manual-review'] * 100)}%)` },
  { value: 'missing', label: `Missing (${Math.round(EVIDENCE_CAPS.missing * 100)}%)` },
]

const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  verified: 'text-[var(--success)]',
  partial: 'text-[var(--warning)]',
  'manual-review': 'text-[var(--azure)]',
  missing: 'text-[var(--avax)]',
}

function EvidenceAwareScoreSlider({
  label,
  rawValue,
  max,
  evidenceStatus,
  adjustedScore,
  maximumAllowedScore,
  explanation,
  onValueChange,
  onStatusChange,
}: {
  label: string
  rawValue: number
  max: number
  evidenceStatus: EvidenceStatus
  adjustedScore: number
  maximumAllowedScore: number
  explanation: string
  onValueChange: (v: number) => void
  onStatusChange: (s: EvidenceStatus) => void
}) {
  const isCapped = adjustedScore < rawValue

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-[var(--muted-fg)]">{label}</span>
        <div className="flex items-center gap-2 text-xs font-mono">
          {isCapped ? (
            <>
              <span className="line-through text-[var(--muted-fg)] text-[10px]">{rawValue}</span>
              <span className="font-semibold text-[var(--warning)]">{adjustedScore}</span>
              <span className="text-[var(--muted-fg)]">/{max}</span>
            </>
          ) : (
            <>
              <span className="font-semibold">{rawValue}</span>
              <span className="text-[var(--muted-fg)]">/{max}</span>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
        <input
          type="range"
          min={0}
          max={max}
          value={rawValue}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="w-full accent-[var(--avax)]"
          aria-label={`${label} raw score: ${rawValue} of ${max}`}
        />
        <select
          value={evidenceStatus}
          onChange={(e) => onStatusChange(e.target.value as EvidenceStatus)}
          className={`text-[10px] rounded px-1.5 py-1 bg-white/5 border border-white/10 focus:outline-none focus:border-[var(--azure)]/50 ${EVIDENCE_STATUS_COLORS[evidenceStatus]}`}
          style={{ backgroundColor: 'var(--background)' }}
          aria-label={`${label} evidence status`}
        >
          {EVIDENCE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ backgroundColor: 'var(--background)' }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {isCapped && (
        <p className="text-[10px] text-[var(--warning)] leading-relaxed">
          {explanation} Max allowed: {maximumAllowedScore}/{max}.
        </p>
      )}
    </div>
  )
}

function PreviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/6 text-sm gap-4">
      <span className="text-[var(--muted-fg)] text-xs uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-right text-xs truncate max-w-[60%] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

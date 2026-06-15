import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, Trash2, Info, AlertTriangle } from 'lucide-react'
import { useReportDraft } from '@/context/useReportDraft'
import { manualResearchProvider } from '@/services/research/manual-provider'
import { isValidUrl, isValidEthAddress, ETH_ADDRESS_ERROR } from '@/utils/validation'
import { TRUST_DIMENSION_MAXIMUMS } from '@/config/scoring'
import {
  computeFullScoringResult,
  DEFAULT_TRUST_EVIDENCE_STATUS,
  DEFAULT_READINESS_EVIDENCE_STATUS,
} from '@/utils/scoring'
import type { CanonicalReport, TrustDimensions, ReadinessScores } from '@/domain/types'

const DEFAULT_TRUST_DIMS: TrustDimensions = {
  legalClarity: 0,
  custodyTransparency: 0,
  assetBacking: 0,
  redemptionProcess: 0,
  compliance: 0,
  issuerCredibility: 0,
  smartContractTransparency: 0,
  liquidityRisk: 0,
}

const DEFAULT_READINESS: ReadinessScores = {
  supplyReadiness: 0,
  distributionReadiness: 0,
  utilityReadiness: 0,
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
}

interface QuickScanForm {
  websiteUrl: string
  projectName: string
  assetTokenContract: string
  network: string
  whitepaper: string
  legalDocument: string
  custodyDocument: string
  proofOfReserve: string
  auditReport: string
  redemptionPolicy: string
  complianceDocument: string
  additional: string[]
}

const DEFAULT_FORM: QuickScanForm = {
  websiteUrl: '',
  projectName: '',
  assetTokenContract: '',
  network: 'Avalanche C-Chain',
  whitepaper: '',
  legalDocument: '',
  custodyDocument: '',
  proofOfReserve: '',
  auditReport: '',
  redemptionPolicy: '',
  complianceDocument: '',
  additional: [],
}

function urlError(v: string): string | undefined {
  if (!v.trim()) return undefined
  if (!isValidUrl(v)) return 'Must be a valid https:// URL'
  return undefined
}

export function QuickScan() {
  const navigate = useNavigate()
  const { setDraft } = useReportDraft()
  const [form, setForm] = useState<QuickScanForm>(DEFAULT_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (patch: Partial<QuickScanForm>) => setForm((f) => ({ ...f, ...patch }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.websiteUrl.trim()) {
      e.websiteUrl = 'Project website URL is required'
    } else if (!isValidUrl(form.websiteUrl)) {
      e.websiteUrl = 'Must be a valid https:// URL'
    }
    if (form.assetTokenContract && !isValidEthAddress(form.assetTokenContract)) {
      e.assetTokenContract = ETH_ADDRESS_ERROR
    }
    const optionalUrls: (keyof QuickScanForm)[] = [
      'whitepaper', 'legalDocument', 'custodyDocument', 'proofOfReserve',
      'auditReport', 'redemptionPolicy', 'complianceDocument',
    ]
    for (const key of optionalUrls) {
      const v = form[key] as string
      const err = urlError(v)
      if (err) e[key] = err
    }
    for (const [i, url] of form.additional.entries()) {
      const err = urlError(url)
      if (err) e[`additional-${i}`] = err
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const response = await manualResearchProvider.research({
        websiteUrl: form.websiteUrl,
        projectName: form.projectName || undefined,
        assetTokenContract: form.assetTokenContract || undefined,
        network: form.network,
        evidenceUrls: {
          whitepaper: form.whitepaper || undefined,
          legalDocument: form.legalDocument || undefined,
          custodyDocument: form.custodyDocument || undefined,
          proofOfReserve: form.proofOfReserve || undefined,
          auditReport: form.auditReport || undefined,
          redemptionPolicy: form.redemptionPolicy || undefined,
          complianceDocument: form.complianceDocument || undefined,
          additional: form.additional.filter(Boolean),
        },
      })
      const draft = response.draft

      const scoring = computeFullScoringResult(
        DEFAULT_TRUST_DIMS,
        DEFAULT_TRUST_EVIDENCE_STATUS,
        DEFAULT_READINESS,
        DEFAULT_READINESS_EVIDENCE_STATUS,
        [],
      )
      const projectName = draft.projectName || form.projectName || ''

      const partial: Partial<CanonicalReport> = {
        schemaVersion: '1.0',
        version: 1,
        projectId: slugify(projectName),
        projectName,
        tagline: '',
        assetType: draft.assetType ?? 'tokenized-treasury',
        chain: draft.chain ?? form.network,
        websiteUrl: form.websiteUrl,
        createdAt: new Date().toISOString(),
        issuer: '',
        custodian: '',
        contractAddress: form.assetTokenContract || '',
        complianceModel: '',
        accessModel: '',
        eligibleRegions: '',
        distributionChannels: '',
        legalSummary: '',
        complianceNotes: '',
        custodyLink: draft.custodyUrl ?? form.custodyDocument ?? '',
        proofOfReserveLink: draft.proofOfReserveUrl ?? form.proofOfReserve ?? '',
        redemptionTerms: '',
        liquidityDescription: '',
        distributionNotes: '',
        defiUtility: '',
        supplyNotes: '',
        utilityNotes: '',
        auditLink: draft.auditUrl ?? form.auditReport ?? '',
        evidence: [],
        riskFlags: [],
        trustDimensions: DEFAULT_TRUST_DIMS,
        trustDimensionEvidenceStatus: { ...DEFAULT_TRUST_EVIDENCE_STATUS },
        readinessScores: DEFAULT_READINESS,
        readinessEvidenceStatus: { ...DEFAULT_READINESS_EVIDENCE_STATUS },
        scoring,
        analystNotes: '',
      }

      setDraft(partial, null)
      navigate('/submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAdditional = () => update({ additional: [...form.additional, ''] })
  const removeAdditional = (i: number) =>
    update({ additional: form.additional.filter((_, idx) => idx !== i) })
  const setAdditional = (i: number, v: string) => {
    const next = [...form.additional]
    next[i] = v
    update({ additional: next })
  }

  const maxDims = Object.values(TRUST_DIMENSION_MAXIMUMS).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          to="/assess"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Assessment
        </Link>
        <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">Quick Scan</p>
        <h1 className="mt-1 text-3xl font-display font-bold">Create Research Draft</h1>
        <p className="mt-2 text-sm text-[var(--muted-fg)] max-w-2xl">
          Supply evidence links and the system creates a structured research draft. Every field
          requires analyst review before scoring and publication.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-[var(--azure)]/5 border border-[var(--azure)]/20">
        <Info className="h-4 w-4 text-[var(--azure)] mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-[var(--muted-fg)]">
          Quick Scan organizes supplied evidence into a structured draft that opens in the
          assessment wizard. All findings require analyst review. Supplying a URL alone does not
          verify or confirm the contents.
          Trust dimensions ({maxDims} points) and Market Readiness scores must be set by the analyst.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-strong rounded-2xl p-6 space-y-6"
      >
        {/* Required */}
        <section>
          <h2 className="font-semibold text-sm mb-4">Project information</h2>
          <div className="space-y-4">
            <QField label="Project website URL *" error={errors.websiteUrl}>
              <QInput
                type="url"
                value={form.websiteUrl}
                onChange={(v) => update({ websiteUrl: v })}
                placeholder="https://example.com/project"
              />
            </QField>
            <div className="grid sm:grid-cols-2 gap-4">
              <QField label="Project name (optional)" error={errors.projectName}>
                <QInput
                  value={form.projectName}
                  onChange={(v) => update({ projectName: v })}
                  placeholder="e.g. Meridian T-Bill Fund"
                />
              </QField>
              <QField label="Network">
                <select
                  value={form.network}
                  onChange={(e) => update({ network: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[var(--azure)]/50 transition-colors"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  {['Avalanche C-Chain', 'Avalanche L1', 'Ethereum', 'Other'].map((n) => (
                    <option key={n} value={n} style={{ backgroundColor: 'var(--background)' }}>{n}</option>
                  ))}
                </select>
              </QField>
            </div>
            <QField
              label="Asset / Token Contract Address"
              helpText="Optional. The smart-contract address of the RWA asset being assessed. This is not the RWA Readiness Registry contract."
              error={errors.assetTokenContract}
            >
              <QInput
                value={form.assetTokenContract}
                onChange={(v) => update({ assetTokenContract: v })}
                placeholder="0x… (optional)"
                mono
              />
            </QField>
          </div>
        </section>

        {/* Evidence links */}
        <section>
          <h2 className="font-semibold text-sm mb-1">Evidence links <span className="text-[var(--muted-fg)] font-normal">(all optional)</span></h2>
          <p className="text-xs text-[var(--muted-fg)] mb-4">
            These are imported as evidence records requiring analyst review.
            A URL alone does not become Verified evidence.
          </p>
          <div className="space-y-3">
            {([
              ['custodyDocument', 'Custody Document URL'],
              ['proofOfReserve', 'Proof of Reserve URL'],
              ['auditReport', 'Audit Report URL'],
              ['legalDocument', 'Legal Document URL'],
              ['whitepaper', 'Whitepaper URL'],
              ['redemptionPolicy', 'Redemption Policy URL'],
              ['complianceDocument', 'Compliance Document URL'],
            ] as [keyof QuickScanForm, string][]).map(([key, label]) => (
              <QField key={key} label={label} error={errors[key]}>
                <QInput
                  type="url"
                  value={form[key] as string}
                  onChange={(v) => update({ [key]: v })}
                  placeholder="https://"
                />
              </QField>
            ))}

            {/* Additional URLs */}
            {form.additional.map((url, i) => (
              <QField key={i} label={`Additional evidence URL ${i + 1}`} error={errors[`additional-${i}`]}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <QInput
                      type="url"
                      value={url}
                      onChange={(v) => setAdditional(i, v)}
                      placeholder="https://"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditional(i)}
                    className="p-2.5 rounded-lg text-[var(--muted-fg)] hover:text-[var(--avax)] glass border border-white/10 transition-colors"
                    aria-label="Remove URL"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </QField>
            ))}
            <button
              type="button"
              onClick={addAdditional}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors py-1"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add another evidence URL
            </button>
          </div>
        </section>

        {/* Review notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--warning)]/5 border border-[var(--warning)]/20">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-[var(--muted-fg)]">
            The created draft opens in the assessment wizard where you must complete all scoring
            dimensions, set evidence status, and review every field before publication.
            Score dimensions start at 0 — analyst input is required.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link to="/assess" className="text-sm text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Creating draft…' : 'Create Research Draft'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function QField({
  label,
  helpText,
  error,
  children,
}: {
  label: string
  helpText?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-[var(--muted-fg)] mb-1.5">{label}</label>
      {helpText && <p className="text-[11px] text-[var(--muted-fg)] mb-1.5">{helpText}</p>}
      {children}
      {error && (
        <p className="mt-1 text-xs text-[var(--avax)]" role="alert">{error}</p>
      )}
    </div>
  )
}

function QInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  mono,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  mono?: boolean
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

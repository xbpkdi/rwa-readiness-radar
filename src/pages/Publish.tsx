import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Wallet, Network, Hash, Upload, CheckCircle2, XCircle, RefreshCw,
  AlertTriangle, Copy, ChevronDown, ChevronUp, ExternalLink, FlaskConical,
} from 'lucide-react'
import { useSwitchChain } from 'wagmi'
import { useReportDraft } from '@/context/useReportDraft'
import { computeReportHash } from '@/services/report-hash'
import { serializeCanonicalReport, canonicalizeReport } from '@/utils/canonical-report'
import { gradeFor } from '@/utils/scoring'
import { truncateHash, formatDate } from '@/utils/format'
import { StepProgress } from '@/components/publication/StepProgress'
import { PublishStep } from '@/components/publication/PublishStep'
import { WalletButton } from '@/components/wallet/WalletButton'
import { NetworkBadge } from '@/components/wallet/NetworkBadge'
import { useWalletConnection } from '@/hooks/useWalletConnection'
import { usePublishReport } from '@/hooks/usePublishReport'
import { IS_CONTRACT_DEPLOYED, FUJI_CHAIN_ID, REGISTRY_ADDRESS, explorerTxUrl, explorerAddressUrl, explorerContractUrl } from '@/config/contracts'
import { useLatestVersion, useIsReportHashUsed } from '@/hooks/useRegistryReads'
import { extractDevDetails } from '@/utils/contract-errors'
import type { PublicationStatus, PublicationReceipt, CanonicalReport } from '@/domain/types'

const PUBLISH_STEPS = [
  { label: 'Review' },
  { label: 'Validate' },
  { label: 'Wallet' },
  { label: 'Network' },
  { label: 'Hash' },
  { label: 'Submit' },
  { label: 'Pending' },
  { label: 'Result' },
]

type FlowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const statusToStep: Record<PublicationStatus, FlowStep> = {
  idle:                0,
  validating:          1,
  'awaiting-wallet':   2,
  'switching-network': 3,
  hashing:             4,
  submitting:          5,
  pending:             6,
  confirmed:           7,
  failed:              7,
}

export function Publish() {
  const { draft, reportHash: storedHash } = useReportDraft()
  const { isConnected, isOnFuji, address } = useWalletConnection()
  const { switchChainAsync } = useSwitchChain()
  const { status, message, receipt, error, errorCode, isDemo, publish, reset } = usePublishReport()

  const [showPayloadJson, setShowPayloadJson] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedRegistry, setCopiedRegistry] = useState(false)

  const fullReport = draft as CanonicalReport | null

  const { version: latestVersion } = useLatestVersion(fullReport?.projectId ?? '')
  const nextVersion = latestVersion !== null ? latestVersion + 1 : 1

  const flowStep = statusToStep[status]

  const { liveHash, integrityMismatch } = useMemo(() => {
    if (!fullReport || !storedHash) return { liveHash: null, integrityMismatch: false }
    try {
      const fresh = computeReportHash(fullReport)
      return { liveHash: fresh, integrityMismatch: fresh !== storedHash }
    } catch (e) {
      console.error('Hash integrity check failed', e)
      return { liveHash: null, integrityMismatch: true }
    }
  }, [fullReport, storedHash])

  const { isUsed: isHashAlreadyPublished } = useIsReportHashUsed(
    fullReport?.projectId ?? '',
    liveHash,
  )

  const canPublish =
    !integrityMismatch &&
    !!liveHash &&
    !isHashAlreadyPublished &&
    (isDemo || (isConnected && isOnFuji))

  const startPublication = async () => {
    if (!fullReport) return
    if (!canPublish) return
    await publish(fullReport, liveHash!)
  }

  const retry = () => reset()

  const handleCopyHash = async () => {
    const h = liveHash ?? storedHash
    if (!h) return
    await navigator.clipboard.writeText(h)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const handleCopyRegistry = async () => {
    if (!REGISTRY_ADDRESS) return
    await navigator.clipboard.writeText(REGISTRY_ADDRESS)
    setCopiedRegistry(true)
    setTimeout(() => setCopiedRegistry(false), 2000)
  }

  const displayHash = liveHash ?? storedHash
  const scoring = fullReport?.scoring
  const overallScore = scoring?.overallScore ?? 0
  const grade = scoring?.grade ?? gradeFor(overallScore).grade

  const publicationMode = isDemo
    ? 'Demo mode — registry not configured'
    : IS_CONTRACT_DEPLOYED
      ? 'Fuji connected'
      : 'Registry not configured'

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-2 flex items-center justify-between">
        <Link
          to="/submit"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Submit
        </Link>
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <span className={`text-[10px] px-2 py-0.5 rounded border ${
            isDemo
              ? 'text-[var(--muted-fg)] border-white/10 bg-white/3'
              : 'text-[var(--success)] border-[var(--success)]/25 bg-[var(--success)]/5'
          }`}>
            {publicationMode}
          </span>
        </div>
      </div>

      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">Publication Flow</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-display font-bold">Publish to Avalanche</h1>
        <p className="mt-2 text-sm text-[var(--muted-fg)] max-w-2xl mx-auto">
          Report hash, scores, version, and publisher wallet will be anchored on Avalanche Fuji,
          creating a public, verifiable proof of publication.
        </p>
      </div>

      {!draft && (
        <div className="glass-strong rounded-2xl p-8 text-center mb-8">
          <p className="text-[var(--muted-fg)] text-sm mb-4">
            No report draft found. Complete the submission wizard first.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90"
          >
            Go to Submit
          </Link>
        </div>
      )}

      {fullReport && (
        <>
          {integrityMismatch && (
            <div className="mb-6 p-5 rounded-2xl bg-[var(--avax)]/5 border border-[var(--avax)]/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--avax)] mb-2">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                Report integrity mismatch
              </div>
              <p className="text-xs text-[var(--muted-fg)] mb-3">
                The current report content does not match the hash generated during Submit.
                Return to Submit to regenerate the preview.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold glass border border-white/10 hover:bg-white/10 transition-colors"
              >
                Return to Submit
              </Link>
            </div>
          )}

          {/* Report summary panel */}
          <div className="mb-6 glass rounded-2xl p-5">
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Project</div>
                <div className="font-semibold text-sm truncate">{fullReport.projectName}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Schema / Version</div>
                <div className="font-mono text-sm">v{fullReport.schemaVersion} · r{fullReport.version}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Score / Grade</div>
                <div className="font-semibold text-sm">{overallScore} / 100 · Grade {grade}</div>
              </div>
            </div>

            {displayHash && (
              <div className="pt-4 border-t border-white/8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">
                    Report Hash (keccak256) — not a transaction hash
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="inline-flex items-center gap-1 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
                    aria-label="Copy report hash"
                  >
                    {copiedHash ? <CheckCircle2 className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <code className="font-mono text-xs text-[var(--azure)] break-all">{displayHash}</code>
                {storedHash && liveHash && storedHash === liveHash && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[var(--success)]">
                    <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Hash verified — matches Submit preview
                  </div>
                )}
              </div>
            )}

            {/* Wallet status row */}
            {!isDemo && (
              <div className="pt-3 mt-3 border-t border-white/8 flex flex-wrap items-center gap-3">
                <WalletButton compact />
                {isConnected && (
                  <>
                    <span className="text-[10px] font-mono text-[var(--muted-fg)]">
                      {address?.slice(0, 8)}…{address?.slice(-4)}
                    </span>
                    {!isOnFuji && (
                      <button
                        onClick={() => switchChainAsync({ chainId: FUJI_CHAIN_ID })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/25 hover:bg-[var(--warning)]/20 transition-colors"
                      >
                        <Network className="h-3 w-3" aria-hidden="true" />
                        Switch to Fuji
                      </button>
                    )}
                    {isOnFuji && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[var(--success)]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Avalanche Fuji
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Registry contract info */}
            {IS_CONTRACT_DEPLOYED && REGISTRY_ADDRESS && (
              <div className="pt-3 mt-3 border-t border-white/8">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">Registry contract</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--success)]">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Verified on Fuji
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-[11px] text-[var(--azure)] break-all">{REGISTRY_ADDRESS}</code>
                  <button
                    onClick={handleCopyRegistry}
                    aria-label="Copy registry address"
                    className="text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {copiedRegistry ? <CheckCircle2 className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
                  </button>
                  {explorerContractUrl() && (
                    <a
                      href={explorerContractUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
                      aria-label="View registry contract on Snowtrace"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      Snowtrace
                    </a>
                  )}
                </div>
                <div className="text-[10px] text-[var(--muted-fg)] mt-1">
                  Chain ID {FUJI_CHAIN_ID} (Avalanche Fuji)
                  {!isDemo && ` · Expected next version: v${nextVersion}`}
                </div>
              </div>
            )}

            {/* Collapsible canonical JSON */}
            <div className="pt-3 mt-3 border-t border-white/8">
              <button
                onClick={() => setShowPayloadJson((p) => !p)}
                className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPayloadJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showPayloadJson ? 'Hide' : 'Show'} canonical payload
              </button>
              {showPayloadJson && (
                <pre className="mt-2 p-3 rounded-lg bg-white/3 border border-white/10 text-[10px] font-mono text-[var(--muted-fg)] overflow-auto max-h-64 whitespace-pre-wrap break-all">
                  {serializeCanonicalReport(canonicalizeReport(fullReport))}
                </pre>
              )}
            </div>
          </div>

          <StepProgress steps={PUBLISH_STEPS} currentStep={flowStep} />

          <AnimatePresence mode="wait">
            {status !== 'confirmed' && status !== 'failed' && (
              <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {flowStep === 0 && (
                  <PublishStep
                    stepNumber={1}
                    totalSteps={8}
                    title="Review Report"
                    description="Confirm the report payload and hash before publication."
                    icon={<CheckCircle2 className="h-7 w-7" />}
                    status="idle"
                    onAction={canPublish ? startPublication : undefined}
                    actionLabel={
                      integrityMismatch || isHashAlreadyPublished
                        ? undefined
                        : !isDemo && !isConnected
                          ? undefined
                          : !isDemo && !isOnFuji
                            ? undefined
                            : 'Begin Publication'
                    }
                  >
                    <div className="grid sm:grid-cols-2 gap-2 text-xs mt-2">
                      <InfoCell label="Project" value={fullReport.projectName ?? '—'} />
                      <InfoCell label="Version" value={`v${fullReport.version ?? 1}`} />
                      <InfoCell label="Schema" value={`v${fullReport.schemaVersion}`} />
                      <InfoCell label="Created" value={formatDate(fullReport.createdAt ?? '')} />
                      {displayHash && (
                        <InfoCell label="Report hash" value={truncateHash(displayHash, 8)} mono />
                      )}
                      <InfoCell label="Mode" value={isDemo ? 'Demo' : 'Fuji'} />
                    </div>
                    {/* Duplicate hash warning — shown before the wallet prompt */}
                    {!isDemo && isHashAlreadyPublished && !integrityMismatch && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--avax)]/5 border border-[var(--avax)]/25 text-xs text-[var(--avax)]">
                        <div className="font-semibold mb-1">Identical content already published</div>
                        v{nextVersion} is available, but this report content is identical to the previously published version.
                        Change at least one meaningful report field so the report hash changes before publishing.
                        <div className="mt-2">
                          <Link to="/submit" className="underline hover:opacity-80">Return to report to make changes</Link>
                        </div>
                      </div>
                    )}
                    {integrityMismatch && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--avax)]/5 border border-[var(--avax)]/25 text-xs text-[var(--avax)]">
                        Publication blocked — integrity mismatch. Return to Submit.
                      </div>
                    )}
                    {!isDemo && !isConnected && !integrityMismatch && !isHashAlreadyPublished && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--azure)]/5 border border-[var(--azure)]/20 text-xs text-[var(--azure)]">
                        Connect a wallet to publish on Avalanche Fuji.
                      </div>
                    )}
                    {!isDemo && isConnected && !isOnFuji && !integrityMismatch && !isHashAlreadyPublished && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--warning)]/5 border border-[var(--warning)]/20 text-xs text-[var(--warning)]">
                        Switch to Avalanche Fuji (chain 43113) to continue.
                      </div>
                    )}
                  </PublishStep>
                )}

                {flowStep === 1 && (
                  <PublishStep stepNumber={2} totalSteps={8} title="Validating Payload" description="Checking report structure and hash integrity." icon={<CheckCircle2 className="h-7 w-7" />} status={status} message={message} />
                )}

                {flowStep === 2 && (
                  <PublishStep stepNumber={3} totalSteps={8} title="Wallet Connection" description={isDemo ? 'Demo mode — wallet skipped.' : 'Confirming wallet is connected.'} icon={<Wallet className="h-7 w-7" />} status={status} message={message}>
                    {!isDemo && (
                      <div className="mt-2 text-xs text-[var(--muted-fg)]">
                        Connected: <span className="font-mono">{address ?? 'Not connected'}</span>
                      </div>
                    )}
                  </PublishStep>
                )}

                {flowStep === 3 && (
                  <PublishStep stepNumber={4} totalSteps={8} title="Confirm Network" description={isDemo ? 'Demo mode — network check skipped.' : 'Confirming Avalanche Fuji (Chain ID 43113).'} icon={<Network className="h-7 w-7" />} status={status} message={message}>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <InfoCell label="Expected chain" value="Avalanche Fuji (43113)" />
                      <InfoCell label="Current chain" value={isDemo ? 'Demo' : String(FUJI_CHAIN_ID)} />
                    </div>
                  </PublishStep>
                )}

                {flowStep === 4 && (
                  <PublishStep stepNumber={5} totalSteps={8} title="Prepare Arguments" description="Building contract call arguments and encoding project ID." icon={<Hash className="h-7 w-7" />} status={status} message={message}>
                    {displayHash && (
                      <div className="font-mono text-xs text-[var(--azure)] bg-white/5 border border-white/10 rounded-lg p-3 break-all mt-2">
                        {displayHash}
                      </div>
                    )}
                  </PublishStep>
                )}

                {flowStep === 5 && (
                  <PublishStep stepNumber={6} totalSteps={8} title="Submit Transaction" description={isDemo ? 'Demo mode — simulating transaction.' : 'Approve the transaction in your wallet.'} icon={<Upload className="h-7 w-7" />} status={status} message={message}>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <InfoCell label="Target chain" value="Avalanche Fuji (43113)" />
                      <InfoCell label="Function" value="publishReport" mono />
                    </div>
                  </PublishStep>
                )}

                {flowStep === 6 && (
                  <PublishStep stepNumber={7} totalSteps={8} title="Awaiting Confirmation" description="Transaction submitted. Waiting for Avalanche block confirmation." icon={<Upload className="h-7 w-7" />} status={status} message={message}>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <InfoCell label="Chain ID" value="43113 (Fuji)" />
                      <InfoCell label="Est. time" value="< 3 seconds" />
                    </div>
                  </PublishStep>
                )}
              </motion.div>
            )}

            {status === 'confirmed' && receipt && (
              <SuccessPanel
                receipt={receipt}
                projectName={fullReport.projectName ?? 'Report'}
                isDemo={isDemo}
              />
            )}

            {status === 'failed' && errorCode === 'DuplicateReportHash' && (
              <DuplicateErrorPanel
                projectName={fullReport.projectName ?? ''}
                reportHash={displayHash}
                latestVersion={latestVersion}
                nextVersion={nextVersion}
                onReset={retry}
              />
            )}

            {status === 'failed' && errorCode !== 'DuplicateReportHash' && (
              <GenericErrorPanel
                error={error}
                onRetry={retry}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

// ─── Duplicate error panel ────────────────────────────────────────────────────

function DuplicateErrorPanel({
  projectName,
  reportHash,
  latestVersion,
  nextVersion,
  onReset,
}: {
  projectName: string
  reportHash: string | null
  latestVersion: number | null
  nextVersion: number
  onReset: () => void
}) {
  const [copiedHash, setCopiedHash] = useState(false)
  return (
    <motion.div
      key="duplicate"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-2xl p-8 text-center relative overflow-hidden"
    >
      <div className="relative">
        <div className="mx-auto h-16 w-16 rounded-full grid place-items-center bg-[var(--avax)]/10 border border-[var(--avax)]/30 mb-5">
          <XCircle className="h-8 w-8 text-[var(--avax)]" />
        </div>

        <h2 className="font-display text-2xl font-bold mb-2">Report already published</h2>
        <p className="text-sm text-[var(--muted-fg)] mb-2 max-w-lg mx-auto">
          This exact report hash has already been published for this project.
        </p>
        <p className="text-xs text-[var(--muted-fg)] mb-6 max-w-lg mx-auto">
          Avalanche versions are immutable. Publishing a new version requires a change to the
          canonical report content so that a new report hash is generated.
        </p>

        <div className="max-w-sm mx-auto grid gap-2 text-left mb-8">
          {projectName && <DetailRow label="Project" value={projectName} />}
          {reportHash && (
            <div className="glass rounded-lg px-3 py-2 grid grid-cols-[minmax(auto,130px)_minmax(0,1fr)_auto] gap-2 items-center">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] shrink-0">Report hash</span>
              <span className="text-xs font-mono truncate">{truncateHash(reportHash, 10)}</span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(reportHash)
                  setCopiedHash(true)
                  setTimeout(() => setCopiedHash(false), 2000)
                }}
                aria-label="Copy report hash"
                className="text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
              >
                {copiedHash ? <CheckCircle2 className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}
          {latestVersion !== null && (
            <DetailRow label="Published version" value={`v${latestVersion}`} />
          )}
          <DetailRow label="Next version" value={`v${nextVersion} (requires new hash)`} />
          {IS_CONTRACT_DEPLOYED && REGISTRY_ADDRESS && (
            <DetailRow label="Registry" value={truncateHash(REGISTRY_ADDRESS, 8)} mono />
          )}
          <DetailRow label="Network" value={`Avalanche Fuji (${FUJI_CHAIN_ID})`} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity"
          >
            Edit Report to Create v{nextVersion}
          </Link>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors"
          >
            Back to Report Preview
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Generic error panel ──────────────────────────────────────────────────────

function GenericErrorPanel({
  error,
  onRetry,
}: {
  error: string | null
  onRetry: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const devDetails = extractDevDetails(error)

  return (
    <motion.div
      key="failed"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-2xl p-8 text-center"
    >
      <XCircle className="mx-auto h-12 w-12 text-[var(--avax)] mb-4" />
      <h2 className="font-display text-xl font-bold mb-2">Publication failed</h2>
      <p className="text-sm text-[var(--muted-fg)] mb-6">{error ?? 'An unexpected error occurred.'}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>

      {/* Collapsed developer details */}
      <div className="mt-6 text-left">
        <button
          onClick={() => setShowDetails((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
        >
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Developer details
        </button>
        {showDetails && (
          <div className="mt-2 p-3 rounded-lg bg-white/3 border border-white/10 text-[10px] font-mono text-[var(--muted-fg)] text-left space-y-1">
            {devDetails.errorName && <div>error: {devDetails.errorName}</div>}
            {devDetails.shortMessage && <div>short: {devDetails.shortMessage}</div>}
            {devDetails.messageSummary && <div>message: {devDetails.messageSummary}</div>}
            {!devDetails.errorName && !devDetails.shortMessage && !devDetails.messageSummary && (
              <div>No structured error details available.</div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SuccessPanel({
  receipt,
  projectName,
  isDemo,
}: {
  receipt: PublicationReceipt
  projectName: string
  isDemo: boolean
}) {
  const [copiedTx, setCopiedTx] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)

  async function copyValue(v: string, setCopied: (b: boolean) => void) {
    await navigator.clipboard.writeText(v)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerLink = receipt.mode === 'fuji' && receipt.transactionHash
    ? explorerTxUrl(receipt.transactionHash)
    : null

  const publisherLink = receipt.mode === 'fuji' && receipt.publisher
    ? explorerAddressUrl(receipt.publisher)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} aria-hidden="true" />
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280 }}
          className={`mx-auto h-16 w-16 rounded-full grid place-items-center mb-5 ${
            isDemo
              ? 'bg-[var(--warning)]/15 border border-[var(--warning)]/35'
              : 'bg-[var(--success)]/15 border border-[var(--success)]/35'
          }`}
        >
          {isDemo
            ? <FlaskConical className="h-8 w-8 text-[var(--warning)]" />
            : <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
          }
        </motion.div>

        {isDemo ? (
          <>
            <h2 className="font-display text-2xl font-bold mb-1">Simulation complete</h2>
            <p className="text-sm text-[var(--muted-fg)] mb-2">
              No blockchain transaction was sent. This is a fictional demonstration.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/25 mb-6">
              Simulation mode — configure VITE_RWA_REGISTRY_ADDRESS to publish on Fuji
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold mb-1">Report anchored on Avalanche</h2>
            <p className="text-sm text-[var(--muted-fg)] mb-6">
              <strong>{projectName}</strong> v{receipt.version} is now publicly verifiable on Fuji.
            </p>
          </>
        )}

        {receipt.eventVerified && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/25 text-[10px] text-[var(--success)] font-medium mb-6">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Verified from ReportPublished event
          </div>
        )}

        <div className="max-w-md mx-auto grid gap-2 text-left mb-8">
          {isDemo ? (
            <DetailRow label="Transaction" value="Simulation — no transaction sent" />
          ) : (
            <CopyRow
              label="Transaction hash"
              value={receipt.transactionHash}
              display={truncateHash(receipt.transactionHash, 12)}
              mono
              isCopied={copiedTx}
              onCopy={() => copyValue(receipt.transactionHash, setCopiedTx)}
            />
          )}
          <CopyRow
            label="Report hash (keccak256)"
            value={receipt.reportHash}
            display={truncateHash(receipt.reportHash, 12)}
            mono
            isCopied={copiedHash}
            onCopy={() => copyValue(receipt.reportHash, setCopiedHash)}
          />
          <DetailRow label="Publisher" value={isDemo ? 'Demo simulation' : truncateHash(receipt.publisher, 8)} mono={!isDemo} />
          <DetailRow label="Block number" value={isDemo ? '—' : receipt.blockNumber.toLocaleString()} />
          <DetailRow label="Timestamp" value={formatDate(receipt.timestamp)} />
          <DetailRow label="Version" value={`v${receipt.version}`} />
          <DetailRow label="Grade" value={`${['', 'A', 'B', 'C', 'D'][receipt.grade] ?? '?'} (${receipt.grade})`} />
          {receipt.contractAddress && (
            <DetailRow label="Contract" value={truncateHash(receipt.contractAddress, 8)} mono />
          )}
          <DetailRow label="Chain ID" value={`${receipt.chainId} (${receipt.mode === 'fuji' ? 'Avalanche Fuji' : 'Demo'})`} />
        </div>

        {/* Explorer links - only for real Fuji receipts */}
        {receipt.mode === 'fuji' && (
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {explorerLink && (
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                View on Snowtrace
              </a>
            )}
            {publisherLink && (
              <a
                href={publisherLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Publisher on Snowtrace
              </a>
            )}
          </div>
        )}

        <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-white/3 border border-white/10 text-left text-[10px] text-[var(--muted-fg)]">
          <p className="font-semibold mb-1">What this proves</p>
          <p>
            This on-chain snapshot proves that the shown wallet published these specific scores and
            report hash at the recorded block time. It does not prove the truth of the underlying
            report or the quality of the publisher.
          </p>
        </div>

        <Link
          to="/explore"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors"
        >
          Back to Explorer
        </Link>
      </div>
    </motion.div>
  )
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="glass rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</div>
      <div className={`text-xs font-medium truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="glass rounded-lg px-3 py-2 grid grid-cols-[minmax(auto,130px)_minmax(0,1fr)] gap-3 items-center">
      <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] shrink-0">{label}</span>
      <span className={`text-xs truncate text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function CopyRow({
  label, display, mono, isCopied, onCopy,
}: {
  label: string
  value: string
  display: string
  mono?: boolean
  isCopied: boolean
  onCopy: () => void
}) {
  return (
    <div className="glass rounded-lg px-3 py-2 grid grid-cols-[minmax(auto,130px)_minmax(0,1fr)_auto] gap-2 items-center">
      <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] shrink-0">{label}</span>
      <span className={`text-xs truncate ${mono ? 'font-mono' : ''}`}>{display}</span>
      <button
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        className="text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
      >
        {isCopied ? <CheckCircle2 className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

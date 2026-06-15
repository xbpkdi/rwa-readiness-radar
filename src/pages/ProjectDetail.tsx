import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Building2, Scale, Lock, Coins, Calendar,
  Globe, Users, Zap, MapPin, CheckCircle2, Mountain, ExternalLink, Hash,
} from 'lucide-react'
import { getProject, mockProjects } from '@/data/projects'
import { computeProjectScores } from '@/utils/scoring'
import { assetTypeLabel, formatDate } from '@/utils/format'
import { truncateHash } from '@/utils/format'
import { TRUST_DIMENSION_LABELS, TRUST_DIMENSION_MAXIMUMS } from '@/config/scoring'
import { IS_CONTRACT_DEPLOYED, explorerAddressUrl, explorerTxUrl, uint8ToGrade } from '@/config/contracts'
import type { ReportVersion } from '@/domain/types'
import { RadarChart } from '@/components/scoring/RadarChart'
import { DimensionRow } from '@/components/scoring/DimensionRow'
import { ReadinessScoreGrid } from '@/components/scoring/ReadinessScoreGrid'
import { EvidenceTable } from '@/components/evidence/EvidenceTable'
import { RiskFlagList } from '@/components/evidence/RiskFlagList'
import { TrustBoundaryNotice } from '@/components/evidence/TrustBoundaryNotice'
import { ProofPanel } from '@/components/publication/ProofPanel'
import { VersionTimeline } from '@/components/publication/VersionTimeline'
import { VerificationBadge } from '@/components/projects/VerificationBadge'
import { Card } from '@/components/common/Card'
import { useLatestSnapshot, useVersionHistory, useLatestVersion } from '@/hooks/useRegistryReads'
import type { OnChainSnapshot } from '@/services/report-verification'

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = getProject(projectId ?? '')

  const { version: onChainVersion } = useLatestVersion(projectId ?? '')
  const { snapshot: onChainSnapshot, isLoading: snapshotLoading } = useLatestSnapshot(projectId ?? '')
  const { snapshots: onChainHistory } = useVersionHistory(projectId ?? '', onChainVersion)

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Project not found</h1>
        <p className="text-[var(--muted-fg)] text-sm mb-6">
          No project exists with the ID <code className="font-mono">{projectId}</code>.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-[var(--azure)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Explorer
        </Link>
      </div>
    )
  }

  const scoring = computeProjectScores(project)
  const { trustScore, supplyScore, distributionScore, utilityScore, overallScore } = scoring

  const dimensionKeys = Object.keys(TRUST_DIMENSION_LABELS) as (keyof typeof TRUST_DIMENSION_LABELS)[]

  const latestVersion = [...project.versionHistory].sort((a, b) => b.version - a.version)[0]

  const projectIndex = mockProjects.findIndex((p) => p.id === project.id)
  const prevProject = projectIndex > 0 ? mockProjects[projectIndex - 1] : null
  const nextProject = projectIndex < mockProjects.length - 1 ? mockProjects[projectIndex + 1] : null

  const showTrustNotice =
    project.verificationStatus === 'draft' || project.verificationStatus === 'missing-evidence'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Back to Explorer
        </Link>
        <div className="flex items-center gap-3">
          {prevProject && (
            <Link
              to={`/projects/${prevProject.id}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
              aria-label={`Previous project: ${prevProject.name}`}
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              {prevProject.name}
            </Link>
          )}
          {prevProject && nextProject && <span className="text-white/20 text-xs">·</span>}
          {nextProject && (
            <Link
              to={`/projects/${nextProject.id}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
              aria-label={`Next project: ${nextProject.name}`}
            >
              {nextProject.name}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">
            <span>{assetTypeLabel(project.assetType)}</span>
            <span className="opacity-40">·</span>
            <span>{project.chain}</span>
            <span className="opacity-40">·</span>
            <span className="font-mono">v{project.version}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight truncate">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">{project.tagline}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <VerificationBadge status={project.verificationStatus} />
          <span className="text-xs text-[var(--muted-fg)]">Updated {formatDate(project.lastUpdated)}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence notice — only for draft/missing-evidence projects */}
          {showTrustNotice && <TrustBoundaryNotice />}

          {/* Scores */}
          <Card elevated>
            <h2 className="font-display text-lg font-semibold mb-4">Readiness Scores</h2>
            <ReadinessScoreGrid
              trustScore={trustScore}
              supplyScore={supplyScore}
              distributionScore={distributionScore}
              utilityScore={utilityScore}
              overallScore={overallScore}
            />
          </Card>

          {/* Radar + dimension breakdown */}
          <Card elevated>
            <h2 className="font-display text-lg font-semibold mb-1">Trust Profile</h2>
            <p className="text-xs text-[var(--muted-fg)] mb-6">Eight-dimension evidence-based trust analysis</p>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <RadarChart dimensions={project.trustDimensions} />
              <div className="space-y-3">
                {dimensionKeys.map((key, i) => {
                  const adj = scoring.adjustedTrustDimensions[key]
                  return (
                    <DimensionRow
                      key={key}
                      label={TRUST_DIMENSION_LABELS[key]}
                      value={adj.adjustedScore}
                      max={TRUST_DIMENSION_MAXIMUMS[key]}
                      rawValue={adj.rawScore}
                      isCapped={adj.adjustedScore < adj.rawScore}
                      index={i}
                    />
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Risk flags */}
          <Card elevated>
            <h2 className="font-display text-lg font-semibold mb-4">Risk Flags</h2>
            <RiskFlagList flags={project.riskFlags} />
          </Card>

          {/* Evidence table */}
          <Card elevated>
            <h2 className="font-display text-lg font-semibold mb-1">Evidence</h2>
            <p className="text-xs text-[var(--muted-fg)] mb-4">Source documents, on-chain data, and analyst notes by dimension.</p>
            <EvidenceTable evidence={project.evidence} />
          </Card>

          {/* Analyst notes */}
          <Card>
            <h2 className="font-display text-base font-semibold mb-2">Analyst Notes</h2>
            <p className="text-sm text-[var(--muted-fg)] leading-relaxed">{project.analystNotes}</p>
          </Card>

          {/* Readiness progression */}
          {project.versionHistory.length > 1 && (
            <Card elevated>
              <h2 className="font-display text-lg font-semibold mb-1">Readiness Over Time</h2>
              <p className="text-xs text-[var(--muted-fg)] mb-6">Score progression across published versions</p>
              <ReadinessProgression versions={project.versionHistory} />
            </Card>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-6">
          {/* Project overview */}
          <Card elevated>
            <h3 className="font-display text-base font-semibold mb-4">Project Overview</h3>
            <dl className="space-y-3 text-sm">
              <MetaRow icon={Coins} label="Asset type" value={assetTypeLabel(project.assetType)} />
              <MetaRow icon={Building2} label="Issuer" value={project.issuer} />
              <MetaRow icon={Lock} label="Custodian" value={project.custodian} />
              <MetaRow icon={Globe} label="Chain" value={project.chain} />
              <MetaRow icon={Scale} label="Compliance" value={project.complianceModel} />
              <MetaRow icon={Users} label="Access model" value={project.accessModel} />
              <MetaRow icon={MapPin} label="Eligible regions" value={project.eligibleRegions.join(', ')} />
              <MetaRow icon={Zap} label="DeFi utility" value={project.defiUtility} />
              <MetaRow icon={Calendar} label="Last updated" value={formatDate(project.lastUpdated)} />
            </dl>
          </Card>

          {/* Proof panel */}
          <ProofPanel
            reportHash={latestVersion?.reportHash ?? '—'}
            txHash={latestVersion?.txHash ?? '—'}
            publisher="0x7A3F5dA2C8b9E4F1A0c6B2e5D8c1F9a4E7b3D2f5"
            publishedAt={project.lastUpdated}
            version={project.version}
          />

          {/* On-chain snapshot — only shown when contract is configured */}
          <OnChainPanel
            snapshot={onChainSnapshot}
            isLoading={snapshotLoading}
            history={onChainHistory}
          />

          {/* Version history (mock dataset) */}
          <Card elevated>
            <h3 className="font-display text-base font-semibold mb-4">Version History (Mock)</h3>
            <VersionTimeline versions={project.versionHistory} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function OnChainPanel({
  snapshot,
  isLoading,
  history,
}: {
  snapshot: OnChainSnapshot | null
  isLoading: boolean
  history: OnChainSnapshot[]
}) {
  if (!IS_CONTRACT_DEPLOYED) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Mountain className="h-4 w-4 text-[var(--avax)]" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold">Avalanche Fuji</h3>
        </div>
        <p className="text-[10px] text-[var(--muted-fg)]">
          Registry not configured. Set VITE_RWA_REGISTRY_ADDRESS to enable on-chain reads.
        </p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Mountain className="h-4 w-4 text-[var(--avax)]" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold">Avalanche Fuji</h3>
        </div>
        <div className="text-[10px] text-[var(--muted-fg)] animate-pulse">Reading from registry…</div>
      </Card>
    )
  }

  if (!snapshot || snapshot.version === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Mountain className="h-4 w-4 text-[var(--avax)]" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold">Avalanche Fuji</h3>
        </div>
        <p className="text-[10px] text-[var(--muted-fg)]">
          Not published on Avalanche Fuji.
        </p>
      </Card>
    )
  }

  const publishedAt = new Date(Number(snapshot.publishedAt) * 1000).toISOString()
  let gradeLabel = '?'
  try { gradeLabel = uint8ToGrade(snapshot.grade) } catch { /* ignore */ }

  return (
    <Card elevated>
      <div className="flex items-center gap-2 mb-4">
        <Mountain className="h-4 w-4 text-[var(--avax)]" aria-hidden="true" />
        <h3 className="font-display text-sm font-semibold">Avalanche Fuji — On-chain</h3>
        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/25">
          <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
          v{snapshot.version}
        </span>
      </div>

      <dl className="space-y-2.5 text-xs">
        <OnChainRow icon={Hash} label="Report hash" value={truncateHash(snapshot.reportHash, 8)} mono />
        <OnChainRow icon={Mountain} label="Publisher" value={truncateHash(snapshot.publisher, 6)} mono
          link={explorerAddressUrl(snapshot.publisher)} />
        <OnChainRow icon={Mountain} label="Published" value={formatDate(publishedAt)} />
        <OnChainRow icon={Mountain} label="Grade" value={`${gradeLabel} (overall ${snapshot.overallReadinessScore})`} />
        <OnChainRow icon={Mountain} label="Trust score" value={String(snapshot.trustScore)} />
      </dl>

      <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2">
        <a
          href={explorerTxUrl(snapshot.reportHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-[var(--azure)] hover:underline"
          aria-label="View on Snowtrace"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Snowtrace
        </a>
      </div>

      <p className="mt-3 text-[9px] text-[var(--muted-fg)] leading-snug">
        Verified match means the displayed report matches the snapshot published by the shown wallet.
        It does not confirm that the underlying evidence is true.
      </p>

      {history.length > 1 && (
        <div className="mt-4 pt-3 border-t border-white/8">
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-2">
            On-chain version history
          </div>
          <ol className="space-y-1.5" aria-label="On-chain version history">
            {history.map((v) => {
              let vGrade = '?'
              try { vGrade = uint8ToGrade(v.grade) } catch { /* ignore */ }
              return (
                <li key={v.version} className="grid grid-cols-[24px_minmax(0,1fr)_40px] gap-2 items-center text-[10px]">
                  <span className="font-mono text-[var(--muted-fg)] text-right">v{v.version}</span>
                  <span className="font-mono truncate text-[var(--muted-fg)]">{truncateHash(v.publisher, 4)}</span>
                  <span className="text-right font-semibold">{vGrade} {v.overallReadinessScore}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </Card>
  )
}

function OnChainRow({
  icon: Icon, label, value, mono, link,
}: {
  icon: typeof Hash
  label: string
  value: string
  mono?: boolean
  link?: string
}) {
  return (
    <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-2 items-start">
      <Icon className="h-3.5 w-3.5 text-[var(--muted-fg)] mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[9px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</dt>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer"
            className={`text-xs text-[var(--azure)] hover:underline truncate block ${mono ? 'font-mono' : ''}`}>
            {value}
          </a>
        ) : (
          <dd className={`text-xs truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
        )}
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 items-start">
      <Icon className="h-3.5 w-3.5 text-[var(--muted-fg)] mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</dt>
        <dd className="text-sm">{value}</dd>
      </div>
    </div>
  )
}

function ReadinessProgression({ versions }: { versions: ReportVersion[] }) {
  const sorted = [...versions].sort((a, b) => a.version - b.version)
  const maxScore = 100

  return (
    <div className="space-y-2" aria-label="Score progression over versions">
      {sorted.map((v, i) => (
        <motion.div
          key={v.version}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="grid grid-cols-[40px_minmax(0,1fr)_40px] gap-3 items-center text-xs"
        >
          <span className="font-mono text-[var(--muted-fg)] text-right">v{v.version}</span>
          <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(v.overallScore / maxScore) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.7 }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--avax)] to-[var(--azure)]"
            />
          </div>
          <span className="font-mono font-semibold">{v.overallScore}</span>
        </motion.div>
      ))}
    </div>
  )
}


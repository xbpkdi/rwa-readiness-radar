import { motion } from 'framer-motion'
import {
  FileSearch, Hash, Mountain, CheckCircle2, GitBranch, ShieldCheck,
  Layers, ArrowRight, Info,
} from 'lucide-react'
import { Card } from '@/components/common/Card'
import { PageHeader } from '@/components/common/PageHeader'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type StageStatus = 'current' | 'simulated' | 'future'

const PROOF_FLOW: { icon: typeof FileSearch; label: string; desc: string; status: StageStatus }[] = [
  {
    icon: FileSearch,
    label: 'Off-chain Research',
    desc: 'Full report: evidence links, analyst notes, scores, versions. Stored off-chain.',
    status: 'current',
  },
  {
    icon: Layers,
    label: 'Canonical Report',
    desc: 'Deterministic serialization of the report payload into a canonical JSON structure.',
    status: 'current',
  },
  {
    icon: Hash,
    label: 'Report Hash',
    desc: 'keccak256 of the canonical payload computed client-side via viem — a unique, tamper-evident fingerprint.',
    status: 'current',
  },
  {
    icon: Mountain,
    label: 'Avalanche Registry',
    desc: 'Hash, score, version, analyst wallet, and timestamp anchored on-chain via a verified registry contract on Fuji.',
    status: 'current',
  },
  {
    icon: CheckCircle2,
    label: 'Transaction Proof',
    desc: 'Immutable on-chain receipt: block, txHash, timestamp, and ReportPublished event — independently verifiable on Snowtrace.',
    status: 'current',
  },
  {
    icon: GitBranch,
    label: 'Version History',
    desc: 'Each new report version creates a new on-chain entry. All versions are retained and queryable.',
    status: 'current',
  },
  {
    icon: ShieldCheck,
    label: 'Verification',
    desc: 'Any party can re-hash the canonical report and compare the result against the on-chain record.',
    status: 'current',
  },
]

const STAGE_BADGE: Record<StageStatus, { label: string; classes: string }> = {
  current:   { label: 'Active — Fuji',            classes: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/25' },
  simulated: { label: 'Demo only',                classes: 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/25' },
  future:    { label: 'Planned',                   classes: 'bg-[var(--azure)]/10 text-[var(--azure)] border border-[var(--azure)]/25' },
}

const ICON_STYLE: Record<StageStatus, string> = {
  current:   'bg-[var(--success)]/15 border border-[var(--success)]/30',
  simulated: 'bg-[var(--warning)]/10 border border-[var(--warning)]/20',
  future:    'bg-gradient-to-br from-[var(--avax)]/20 to-[var(--azure)]/20 border border-white/10',
}

const ICON_COLOR: Record<StageStatus, string> = {
  current:   'text-[var(--success)]',
  simulated: 'text-[var(--warning)]',
  future:    'text-[var(--foreground)]',
}

export function Architecture() {
  const reduced = useReducedMotion()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <PageHeader
        eyebrow="System design"
        title="Proof Architecture"
        description="How RWA Readiness Radar uses Avalanche to create a tamper-evident public record of research provenance, scores, and version history."
      />

      {/* Current state notice */}
      <div
        className="flex items-start gap-3 glass rounded-xl px-4 py-3 mb-10 text-xs text-[var(--muted-fg)]"
        role="note"
      >
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--azure)]" aria-hidden="true" />
        <p>
          <strong className="text-[var(--foreground)]">Deployed:</strong> The full publication flow is live on Avalanche Fuji.
          Connect MetaMask, switch to Fuji (chain ID 43113), complete an assessment, and publish to the
          verified registry at{' '}
          <code className="font-mono text-[10px] bg-white/8 px-1 py-0.5 rounded">0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5</code>.
        </p>
      </div>

      {/* Flow visualization */}
      <section aria-label="Publication proof flow">
        <h2 className="font-display text-2xl font-bold mb-6">Off-chain report → On-chain receipt</h2>

        <div className="relative space-y-4 mb-12">
          {PROOF_FLOW.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                initial={reduced ? {} : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 items-start"
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${ICON_STYLE[step.status]}`}>
                    <Icon className={`h-5 w-5 ${ICON_COLOR[step.status]}`} aria-hidden="true" />
                  </div>
                  {i < PROOF_FLOW.length - 1 && (
                    <div className="flex-1 w-0.5 bg-white/20 min-h-[16px]" aria-hidden="true" />
                  )}
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-sm">{step.label}</h3>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STAGE_BADGE[step.status].classes}`}>
                      {STAGE_BADGE[step.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-fg)]">{step.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Why Avalanche */}
      <section aria-label="Why Avalanche">
        <h2 className="font-display text-2xl font-bold mb-6">Why Avalanche</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            { title: 'EVM compatibility', desc: 'Works natively with existing tooling — MetaMask, Solidity, ethers.js, viem — with no integration friction.' },
            { title: 'Sub-second finality', desc: 'Avalanche C-Chain finalizes blocks in under 2 seconds, making on-chain registration fast and practical.' },
            { title: 'Institutional RWA readiness', desc: 'Predictable fees and established institutional adoption make Avalanche suitable for regulated asset publishing.' },
            { title: 'Permissioned L1s', desc: 'Avalanche L1s (formerly subnets) support KYC-gated environments for compliance-heavy RWA ecosystems.' },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="font-display font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-[var(--muted-fg)]">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What on-chain publication proves / does not prove */}
      <section aria-label="Publication scope">
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Card elevated>
            <h3 className="font-display font-semibold mb-3 text-[var(--success)]">What publication proves</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" aria-hidden="true" />
                A specific canonical report existed at a specific time
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" aria-hidden="true" />
                A specific analyst wallet authorized that publication
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" aria-hidden="true" />
                The report has not been retroactively altered
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" aria-hidden="true" />
                Version history is sequential and publicly auditable
              </li>
            </ul>
          </Card>
          <Card elevated>
            <h3 className="font-display font-semibold mb-3 text-[var(--avax)]">What publication does not prove</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--avax)] mt-0.5 shrink-0" aria-hidden="true" />
                The accuracy of the underlying evidence
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--avax)] mt-0.5 shrink-0" aria-hidden="true" />
                The independence or competence of the analyst
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--avax)] mt-0.5 shrink-0" aria-hidden="true" />
                That the underlying asset is safe or suitable
              </li>
              <li className="flex gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--avax)] mt-0.5 shrink-0" aria-hidden="true" />
                Future performance or solvency of the issuer
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contract details */}
      <section aria-label="Verified registry contract">
        <Card elevated>
          <div className="flex items-start gap-4">
            <Mountain className="h-8 w-8 text-[var(--avax)] shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-semibold mb-2">Verified registry contract</h2>
              <div className="space-y-2 text-sm text-[var(--muted-fg)]">
                <p>
                  Publication uses <strong className="text-[var(--foreground)]">wagmi</strong> for wallet connection
                  and <strong className="text-[var(--foreground)]">viem</strong> for writing to the on-chain registry.
                  Report hashes are computed client-side via viem's <code className="font-mono text-xs bg-white/8 px-1 py-0.5 rounded">keccak256</code>
                  {' '}and verified against the canonical payload before any transaction is attempted.
                </p>
                <p>
                  Network: <strong className="text-[var(--foreground)]">Avalanche Fuji C-Chain</strong> · Chain ID 43113
                </p>
                <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/10 space-y-1 text-xs font-mono">
                  <div className="text-[var(--muted-fg)]">Registry address</div>
                  <div className="text-[var(--azure)] break-all">0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5</div>
                  <a
                    href="https://testnet.snowtrace.io/address/0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5#code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors not-italic font-sans"
                  >
                    View verified source on Snowtrace
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <p className="text-[11px]">
                  This registry records report hashes — not the underlying RWA token contract.
                  Each project's on-chain record is keyed by a deterministic project identifier
                  derived from the project slug.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

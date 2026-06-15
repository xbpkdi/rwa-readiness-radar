import { motion } from 'framer-motion'
import {
  Scale, ShieldCheck, Database, RefreshCw, FileText, Building2,
  Code, Droplets, TrendingUp, Zap, Network, Info,
} from 'lucide-react'
import { GRADE_BANDS, OVERALL_SCORE_WEIGHTS, EVIDENCE_CAPS } from '@/config/scoring'
import { Card } from '@/components/common/Card'
import { PageHeader } from '@/components/common/PageHeader'
import { EvidenceBadge } from '@/components/evidence/EvidenceBadge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { EvidenceStatus } from '@/domain/types'

const TRUST_DIMS = [
  { icon: Scale, label: 'Legal Clarity', max: 15, desc: 'Jurisdiction, regulatory filings, legal claim to underlying assets, investor protections, SPV structure.' },
  { icon: ShieldCheck, label: 'Custody Transparency', max: 15, desc: 'Custodian identity, attestation frequency, segregation of assets, digital vs. traditional custody.' },
  { icon: Database, label: 'Asset Backing', max: 15, desc: 'Proof of reserve, NAV oracle, independent verification, backing asset quality and accessibility.' },
  { icon: RefreshCw, label: 'Redemption Process', max: 10, desc: 'Redemption mechanism, cut-off times, fees, fail-safes, liquidity during stress events.' },
  { icon: FileText, label: 'Compliance', max: 15, desc: 'AML/KYC procedures, regulatory registration, Travel Rule compliance, investor eligibility controls.' },
  { icon: Building2, label: 'Issuer Credibility', max: 10, desc: 'Team track record, prior products, governance transparency, regulatory history.' },
  { icon: Code, label: 'Smart Contract Transparency', max: 10, desc: 'Verified contracts, independent audits, access controls, upgrade mechanisms.' },
  { icon: Droplets, label: 'Liquidity Risk', max: 10, desc: 'Primary and secondary market depth, redemption mismatch risk, market maker presence.' },
]

const MARKET_DIMS = [
  { icon: TrendingUp, label: 'Supply Readiness', weight: '20%', desc: 'Token supply mechanics, issuance controls, NAV accuracy, token lifecycle events.' },
  { icon: Network, label: 'Distribution Readiness', weight: '20%', desc: 'Liquidity, access model, distribution channels, secondary market depth, eligible regions.' },
  { icon: Zap, label: 'Utility Readiness', weight: '20%', desc: 'DeFi protocol integrations, collateral eligibility, yield mechanisms, composability.' },
]

const gradeColorMap: Record<string, string> = {
  success: 'text-[var(--success)] border-[var(--success)]/25 bg-[var(--success)]/5',
  azure:   'text-[var(--azure)] border-[var(--azure)]/25 bg-[var(--azure)]/5',
  warning: 'text-[var(--warning)] border-[var(--warning)]/25 bg-[var(--warning)]/5',
  avax:    'text-[var(--avax)] border-[var(--avax)]/25 bg-[var(--avax)]/5',
}

const TOC_ITEMS = [
  { id: 'evidence-principle', label: 'Evidence Principle' },
  { id: 'trust-foundation', label: 'Trust Foundation' },
  { id: 'market-readiness', label: 'Market Readiness' },
  { id: 'evidence-caps', label: 'Evidence Caps' },
  { id: 'overall-score', label: 'Overall Score' },
  { id: 'grade-bands', label: 'Grade Bands' },
  { id: 'evidence-status', label: 'Evidence Status' },
  { id: 'score-interpretation', label: 'Score Interpretation' },
  { id: 'limitations', label: 'Limitations' },
]

const EVIDENCE_STATUS_ENTRIES: { status: EvidenceStatus; desc: string }[] = [
  { status: 'verified', desc: 'Source independently confirmed against primary documents, on-chain data, or regulatory filings.' },
  { status: 'partial', desc: 'Some supporting evidence exists but is incomplete, unconfirmed, or partially accessible.' },
  { status: 'manual-review', desc: 'Evidence exists but requires manual analyst judgment or is in a format that resists automated verification.' },
  { status: 'missing', desc: 'No credible evidence found for this dimension. Score contribution reduced accordingly.' },
]

export function Methodology() {
  const reduced = useReducedMotion()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <PageHeader
        eyebrow="Framework"
        title="Scoring Methodology"
        description="A two-layer, evidence-first scoring framework for tokenized real-world asset readiness. Every score requires source-linked evidence — missing evidence is never assumed."
      />

      {/* In-page TOC */}
      <nav aria-label="On this page" className="glass rounded-2xl p-4 mb-10">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-3">On this page</p>
        <ol className="grid sm:grid-cols-2 gap-1.5 text-sm">
          {TOC_ITEMS.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex items-center gap-2 text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
              >
                <span className="font-mono text-[10px] opacity-50 w-4 shrink-0">{i + 1}.</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Evidence principle */}
      <section id="evidence-principle" aria-label="Evidence principle">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-2xl p-6 sm:p-8 mb-10"
        >
          <Info className="h-6 w-6 text-[var(--azure)] mb-3" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold mb-2">Evidence over inference</h2>
          <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
            Every dimension score must be supported by evidence — public filings, custody attestations, on-chain data,
            smart contract audits, and direct analyst observation. Scores for dimensions with missing or unverifiable
            evidence are capped, not estimated. A confident-looking score with poor evidence quality should be read
            as an assessment of the evidence, not the asset.
          </p>
        </motion.div>
      </section>

      {/* Trust foundation */}
      <section id="trust-foundation" aria-label="Trust Foundation methodology">
        <h2 className="font-display text-2xl font-bold mb-1">Trust Foundation</h2>
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Eight dimensions totaling 100 points. Weighted at{' '}
          <strong>{Math.round(OVERALL_SCORE_WEIGHTS.trust * 100)}%</strong> of the overall readiness score.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {TRUST_DIMS.map((d, i) => {
            const Icon = d.icon
            return (
              <motion.div
                key={d.label}
                initial={reduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br from-[var(--avax)]/25 to-[var(--azure)]/25">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold">{d.max}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">points</div>
                  </div>
                </div>
                <h3 className="font-display font-semibold mb-1">{d.label}</h3>
                <p className="text-xs text-[var(--muted-fg)]">{d.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Market readiness */}
      <section id="market-readiness" aria-label="Market Readiness methodology">
        <h2 className="font-display text-2xl font-bold mb-1">Market Readiness</h2>
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Three dimensions, each scored 0–100. Collectively weighted at{' '}
          <strong>{Math.round((OVERALL_SCORE_WEIGHTS.supply + OVERALL_SCORE_WEIGHTS.distribution + OVERALL_SCORE_WEIGHTS.utility) * 100)}%</strong> of the overall score.
        </p>
        <div className="space-y-4 mb-10">
          {MARKET_DIMS.map((d, i) => {
            const Icon = d.icon
            return (
              <motion.div
                key={d.label}
                initial={reduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 flex items-start gap-5"
              >
                <div className="h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-[var(--azure)]/25 to-[var(--avax)]/25 shrink-0">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-semibold">{d.label}</h3>
                    <span className="font-mono text-xs text-[var(--azure)]">{d.weight} weight</span>
                  </div>
                  <p className="text-sm text-[var(--muted-fg)]">{d.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Evidence caps */}
      <section id="evidence-caps" aria-label="Evidence-aware scoring caps">
        <Card elevated className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-2">Evidence-Aware Score Caps</h2>
          <p className="text-sm text-[var(--muted-fg)] mb-4">
            Every dimension score is subject to a cap based on available evidence quality. A high raw
            analyst score with weak evidence is reduced to the maximum the evidence can support.
            Caps reduce unsupported confidence — they do not prove the evidence is true.
          </p>

          <div className="font-mono text-xs text-[var(--azure)] bg-white/5 rounded-lg px-4 py-3 mb-4 space-y-1">
            <div>maximumAllowedScore = floor(maximumScore × evidenceCap)</div>
            <div>adjustedScore = min(rawScore, maximumAllowedScore)</div>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] border-b border-white/8">
                  <th className="text-left py-2 pr-4">Evidence status</th>
                  <th className="text-right py-2 pr-4">Cap</th>
                  <th className="text-right py-2">Effect on max 20 dimension</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {(['verified', 'partial', 'manual-review', 'missing'] as const).map((status) => (
                  <tr key={status}>
                    <td className="py-2.5 pr-4">
                      <EvidenceBadge status={status} />
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono font-semibold">
                      {Math.round(EVIDENCE_CAPS[status] * 100)}%
                    </td>
                    <td className="py-2.5 text-right font-mono text-[var(--muted-fg)]">
                      max {Math.floor(20 * EVIDENCE_CAPS[status])} / 20
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-white/3 border border-white/10">
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">Worked example — Legal Clarity</p>
            <div className="font-mono text-xs text-[var(--muted-fg)] space-y-1">
              <div>Maximum:           15 points</div>
              <div>Raw analyst score: 13</div>
              <div>Evidence status:   Partial</div>
              <div>Cap:               70%</div>
              <div>Maximum allowed:   floor(15 × 0.70) = 10</div>
              <div className="text-[var(--warning)] font-semibold">Adjusted score:    min(13, 10) = 10</div>
            </div>
          </div>

          <p className="text-xs text-[var(--muted-fg)] mt-4">
            Evidence caps apply to all Trust Foundation dimensions and all three Market Readiness
            dimensions independently. Raw scores below the cap are unchanged.
            Analyst judgment still determines the raw score — caps limit how much confidence
            can be claimed without supporting evidence.
          </p>
        </Card>
      </section>

      {/* Overall score */}
      <section id="overall-score" aria-label="Overall score formula">
        <Card elevated className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Overall RWA Readiness Score</h2>
          <div className="font-mono text-sm text-[var(--azure)] bg-white/5 rounded-lg px-4 py-3 mb-4">
            Score = Trust×{Math.round(OVERALL_SCORE_WEIGHTS.trust * 100)}% + Supply×{Math.round(OVERALL_SCORE_WEIGHTS.supply * 100)}% + Distribution×{Math.round(OVERALL_SCORE_WEIGHTS.distribution * 100)}% + Utility×{Math.round(OVERALL_SCORE_WEIGHTS.utility * 100)}%
          </div>
          <p className="text-sm text-[var(--muted-fg)]">
            Weights are provisional and defined in a single configuration file, not hard-coded into UI components.
            They can be updated as the methodology evolves without changing data or presentation logic.
          </p>
        </Card>
      </section>

      {/* Grade bands */}
      <section id="grade-bands" aria-label="Grade bands">
        <h2 className="font-display text-2xl font-bold mb-6">Grade Bands</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {GRADE_BANDS.map((band, i) => (
            <motion.div
              key={band.grade}
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-5 border ${gradeColorMap[band.color]}`}
            >
              <div className="font-display text-4xl font-bold mb-1">{band.grade}</div>
              <div className="font-mono text-sm mb-2">{band.min}–{band.max}</div>
              <div className="text-sm">{band.label}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-fg)] mb-10">
          Grade bands are analytical guidance only. A grade reflects the quality of available evidence at the time of publication.
          They are not investment ratings, credit ratings, or performance guarantees. Always verify the publication receipt and
          review the full evidence table before relying on a score.
        </p>
      </section>

      {/* Evidence status */}
      <section id="evidence-status" aria-label="Evidence status types">
        <h2 className="font-display text-2xl font-bold mb-4">Evidence Status</h2>
        <div className="glass-strong rounded-2xl divide-y divide-white/8 mb-10">
          {EVIDENCE_STATUS_ENTRIES.map((e) => (
            <div key={e.status} className="px-6 py-4 flex items-start gap-4">
              <div className="pt-0.5 shrink-0">
                <EvidenceBadge status={e.status} />
              </div>
              <p className="text-xs text-[var(--muted-fg)]">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Score interpretation */}
      <section id="score-interpretation" aria-label="Score interpretation">
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <Card elevated>
            <h3 className="font-display font-semibold mb-3 text-[var(--success)]">What a score means</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li>↳ Quality and completeness of available evidence at time of publication</li>
              <li>↳ Relative trust and readiness across a structured set of dimensions</li>
              <li>↳ A versioned snapshot that can be tracked and audited over time</li>
              <li>↳ A starting point for deeper institutional due diligence</li>
            </ul>
          </Card>
          <Card elevated>
            <h3 className="font-display font-semibold mb-3 text-[var(--avax)]">What a score does not mean</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li>↳ Investment advice or a recommendation to buy, sell, or hold</li>
              <li>↳ A guarantee of performance, solvency, or redemption</li>
              <li>↳ An assessment of the underlying asset's market value</li>
              <li>↳ A statement about counterparty creditworthiness</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Limitations */}
      <section id="limitations" aria-label="Methodology limitations">
        <Card>
          <h2 className="font-display text-xl font-semibold mb-3">Limitations & Conflict of Interest</h2>
          <div className="space-y-3 text-sm text-[var(--muted-fg)]">
            <p>
              Scores reflect available evidence at the time of publication. Rapidly changing market conditions,
              new regulatory developments, or issuer actions may affect project risk between report versions.
            </p>
            <p>
              Analysts must disclose any financial interest in the assets they score. Reports that cannot be
              produced without a conflict of interest should be declined or prominently flagged.
            </p>
            <p>
              Evidence verification is conducted manually by the analyst. No automated real-time monitoring
              or live data feeds are active in this release. Scores reflect available evidence at the
              time of publication only.
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}

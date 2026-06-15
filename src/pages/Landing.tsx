import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, ShieldCheck, TrendingUp, Network, FileSearch,
  BarChart3, Hash, Upload, CheckCircle2, GitBranch,
} from 'lucide-react'
import { mockProjects } from '@/data/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ReadinessCommandCenter } from '@/components/home/ReadinessCommandCenter'
import {
  HERO_HEADLINE_LEAD_LINE1,
  HERO_HEADLINE_LEAD_LINE2,
  HERO_HEADLINE_GRADIENT_LINE1,
  HERO_HEADLINE_GRADIENT_LINE2,
  HERO_HEADLINE_GRADIENT_LINE3,
  HERO_HEADLINE_GRADIENT_LINE4,
  HERO_DESCRIPTION,
  HERO_CTA_HELPER,
  PRIMARY_CTA,
  SECONDARY_CTA,
  MANUAL_ASSESSMENT_LINK,
} from '@/components/home/home-content'

const FEATURED_IDS = ['meridian-tbill-fund', 'aurix-gold-token', 'aether-credit-pool-ii']

const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity glow-red'
const btnSecondary = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors'
const btnGhost = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors text-[var(--muted-fg)]'

export function Landing() {
  const reduced = useReducedMotion()

  const featuredProjects = FEATURED_IDS
    .map((id) => mockProjects.find((p) => p.id === id))
    .filter(Boolean) as typeof mockProjects

  return (
    <div className="relative">
      {/* HERO */}
      <section
        className="relative overflow-hidden min-h-[calc(100dvh-5.5rem)] flex items-center"
        aria-label="Hero"
      >
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} aria-hidden="true" />
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[var(--avax)]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[var(--azure)]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <div className="flex flex-col justify-center lg:pr-4 xl:pr-8">
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full text-xs glass border border-[var(--avax)]/30"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--avax)] animate-pulse" aria-hidden="true" />
                <span className="text-[var(--muted-fg)]">Avalanche Edition · Fuji Testnet</span>
              </motion.div>

              <motion.h1
                initial={reduced ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mt-5 text-[1.875rem] sm:text-4xl lg:text-[3.15rem] xl:text-[3.45rem] font-display font-bold tracking-tight leading-[1.15] max-w-xl lg:max-w-none"
              >
                <span className="block text-[var(--foreground)]">
                  {HERO_HEADLINE_LEAD_LINE1}
                </span>
                <span className="block text-[var(--foreground)]">
                  {HERO_HEADLINE_LEAD_LINE2}
                </span>
                <span className="block hero-headline-gradient hero-headline-gradient-1">
                  {HERO_HEADLINE_GRADIENT_LINE1}
                </span>
                <span className="block hero-headline-gradient hero-headline-gradient-2">
                  {HERO_HEADLINE_GRADIENT_LINE2}
                </span>
                <span className="block hero-headline-gradient hero-headline-gradient-3">
                  {HERO_HEADLINE_GRADIENT_LINE3}
                </span>
                <span className="block hero-headline-gradient hero-headline-gradient-4">
                  {HERO_HEADLINE_GRADIENT_LINE4}
                </span>
              </motion.h1>

              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="mt-5 text-sm sm:text-base text-[var(--muted-fg)] max-w-lg leading-relaxed"
              >
                {HERO_DESCRIPTION}
              </motion.p>

              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.4 }}
                className="mt-6 sm:mt-7 w-full max-w-lg rounded-2xl glass-strong p-4 sm:p-5 shadow-[var(--shadow-elevated)]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to={PRIMARY_CTA.to}
                    className={`${btnPrimary} w-full justify-center py-3`}
                    aria-label={`${PRIMARY_CTA.label} — opens research-assisted evidence workflow`}
                  >
                    {PRIMARY_CTA.label}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                  <Link
                    to={SECONDARY_CTA.to}
                    className={`${btnSecondary} w-full justify-center py-3`}
                    aria-label={`${SECONDARY_CTA.label} — fictional demonstration data`}
                  >
                    {SECONDARY_CTA.label}
                    <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-white/6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to={MANUAL_ASSESSMENT_LINK.to}
                    className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
                    aria-label={`${MANUAL_ASSESSMENT_LINK.label} — open manual assessment wizard`}
                  >
                    {MANUAL_ASSESSMENT_LINK.label}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </Link>
                  <p className="text-xs leading-relaxed text-[var(--muted-fg)]/80 sm:max-w-[13rem] sm:text-right">
                    {HERO_CTA_HELPER}
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.45 }}
              className="relative w-full min-w-0 lg:pl-2"
            >
              <div
                className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-gradient-to-br from-[var(--avax)]/12 via-transparent to-[var(--azure)]/12 blur-2xl pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative">
                <ReadinessCommandCenter reduced={reduced} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16" aria-label="Platform capabilities">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: 'Trust Foundation', desc: 'Eight dimensions of institutional-grade trust analysis: legal clarity, custody, asset backing, redemption, compliance, issuer credibility, smart contracts, and liquidity.' },
            { icon: TrendingUp, title: 'Market Readiness', desc: 'Supply, distribution, and utility scoring tells you whether a tokenized asset is actually usable — not just legally structured.' },
            { icon: Network, title: 'Avalanche Verification', desc: 'Report hashes, scores, and version history anchored on Avalanche — creating a public, immutable audit trail for research provenance.' },
          ].map((v, i) => {
            const Icon = v.icon
            return (
              <motion.div
                key={v.title}
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br from-[var(--avax)]/25 to-[var(--azure)]/25 group-hover:scale-110 transition-transform mb-4">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--muted-fg)]">{v.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* FRAMEWORK EXPLANATION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16" aria-label="Assessment framework">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">Two-layer assessment</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
            Trust Foundation → Market Readiness
          </h2>
          <p className="mt-3 text-[var(--muted-fg)] max-w-2xl mx-auto text-sm">
            A project can be legally sound but operationally illiquid. Both layers must score well for genuine institutional readiness.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-[var(--avax)]" aria-hidden="true" />
              <h3 className="font-display font-semibold text-lg">Trust Foundation</h3>
              <span className="ml-auto text-xs text-[var(--muted-fg)] font-mono">40% weight</span>
            </div>
            <p className="text-sm text-[var(--muted-fg)] mb-4">
              Eight dimensions assess whether the asset is genuinely safe to hold.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Legal Clarity', 'Custody Transparency', 'Asset Backing',
                'Redemption Process', 'Compliance', 'Issuer Credibility',
                'Smart Contract Transparency', 'Liquidity Risk',
              ].map((dim) => (
                <div key={dim} className="px-2.5 py-1.5 rounded-md bg-white/5 text-xs text-[var(--muted-fg)]">
                  {dim}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[var(--azure)]" aria-hidden="true" />
              <h3 className="font-display font-semibold text-lg">Market Readiness</h3>
              <span className="ml-auto text-xs text-[var(--muted-fg)] font-mono">60% weight</span>
            </div>
            <p className="text-sm text-[var(--muted-fg)] mb-4">
              Three dimensions assess whether the asset can function productively in institutional and DeFi markets.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Supply Readiness', desc: 'Token mechanics, issuance controls, NAV accuracy', weight: '20%' },
                { label: 'Distribution Readiness', desc: 'Liquidity, access model, secondary markets', weight: '20%' },
                { label: 'Utility Readiness', desc: 'DeFi integrations, collateral use, yield mechanisms', weight: '20%' },
              ].map((d) => (
                <div key={d.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs text-[var(--muted-fg)]">{d.desc}</div>
                  </div>
                  <span className="font-mono text-xs text-[var(--azure)] shrink-0">{d.weight}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16" aria-label="Product workflow">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">How it works</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Research → Score → Verify</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: FileSearch, label: 'Research', step: 1 },
            { icon: BarChart3, label: 'Score', step: 2 },
            { icon: Hash, label: 'Hash Report', step: 3 },
            { icon: Upload, label: 'Publish', step: 4 },
            { icon: CheckCircle2, label: 'Verify', step: 5 },
            { icon: GitBranch, label: 'Version', step: 6 },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                initial={reduced ? {} : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="glass rounded-xl p-4 text-center"
              >
                <div className="mx-auto h-10 w-10 rounded-full grid place-items-center bg-gradient-to-br from-[var(--avax)]/20 to-[var(--azure)]/20 border border-white/8 mb-3">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">Step {s.step}</div>
                <div className="text-sm font-semibold">{s.label}</div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16" aria-label="Featured projects">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">Featured samples</p>
            <h2 className="mt-1 text-3xl font-display font-bold">Illustrative project profiles</h2>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">Fictional demonstration data — not live evaluations</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--azure)] hover:underline shrink-0"
          >
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* AVALANCHE SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16" aria-label="Avalanche verification">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[var(--azure)]/12 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[var(--avax)]/12 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)] mb-3">Proof of research</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Evidence-backed scores, anchored on Avalanche.
            </h2>
            <p className="text-[var(--muted-fg)] text-sm mb-6">
              Published reports can be hashed and registered on Avalanche — creating a tamper-evident record of
              report integrity and version history. Readers can verify when a score was published and by which wallet,
              but on-chain proof does not independently verify the truth of the underlying evidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/architecture" className={btnSecondary}>Learn how it works</Link>
              <Link to="/methodology" className={btnGhost}>Read methodology</Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20" aria-label="Call to action">
        <div className="glass-strong rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} aria-hidden="true" />
          <div className="relative">
            <ShieldCheck className="mx-auto h-10 w-10 text-[var(--azure)] mb-4" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-display font-bold">Evaluate with evidence.</h2>
            <p className="mt-3 text-[var(--muted-fg)] max-w-xl mx-auto text-sm">
              Browse sample project profiles or start a new reviewable readiness assessment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/explore" className={btnPrimary}>Browse Projects</Link>
              <Link to="/assess" className={btnSecondary}>Start Assessment</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


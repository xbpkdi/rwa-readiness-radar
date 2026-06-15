import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, FlaskConical, ClipboardList, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useReportDraft } from '@/context/useReportDraft'
import { buildDemoReport } from '@/data/demo-report'
import { hashCanonicalReport } from '@/utils/canonical-report'
import {
  HERO_HEADLINE_LEAD_LINE1,
  HERO_HEADLINE_LEAD_LINE2,
  HERO_HEADLINE_GRADIENT_LINE1,
  HERO_HEADLINE_GRADIENT_LINE2,
  HERO_HEADLINE_GRADIENT_LINE3,
  HERO_HEADLINE_GRADIENT_LINE4,
  HERO_DESCRIPTION,
  HERO_CTA_HELPER,
} from '@/components/home/home-content'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--avax)] to-[var(--azure)] text-white hover:opacity-90 transition-opacity'
const btnSecondary =
  'inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/10 transition-colors'
const btnGhost =
  'inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors text-[var(--muted-fg)]'

export function Assess() {
  const navigate = useNavigate()
  const { draft, setDraft } = useReportDraft()

  const hasMeaningfulDraft = !!(draft && draft.projectName && draft.projectName.trim())

  const handleLoadDemo = () => {
    if (hasMeaningfulDraft) {
      const confirmed = window.confirm(
        'Load demo report? Your current draft will be replaced with fictional demonstration data.',
      )
      if (!confirmed) return
    }
    const demoReport = buildDemoReport()
    const demoHash = hashCanonicalReport(demoReport)
    setDraft(demoReport, demoHash)
    navigate('/submit')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)] mb-3">Assessment</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 leading-[1.12]">
          <span className="block text-[var(--foreground)]">
            {HERO_HEADLINE_LEAD_LINE1} {HERO_HEADLINE_LEAD_LINE2}
          </span>
          <span className="block mt-2 hero-headline-gradient hero-headline-gradient-1">
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
        </h1>
        <p className="text-base text-[var(--muted-fg)] max-w-2xl mx-auto">
          {HERO_DESCRIPTION}
        </p>
        <p className="mt-2 text-xs text-[var(--muted-fg)] max-w-2xl mx-auto">
          {HERO_CTA_HELPER}
        </p>
      </div>

      {/* Product flow */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--muted-fg)]">
          {['Import Evidence', 'Research Draft', 'Analyst Review', 'Score', 'Publish', 'Track Versions'].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg glass border border-white/10 text-[var(--foreground)] font-medium">
                {step}
              </span>
              {i < arr.length - 1 && <span className="text-[var(--muted-fg)]">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Three mode cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {/* Mode 1 — Quick Scan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-strong rounded-2xl p-6 flex flex-col"
        >
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-[var(--avax)]/25 to-[var(--azure)]/25 mb-4">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="font-display font-semibold text-lg">Quick Scan</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--avax)]/15 text-[var(--avax)] font-medium uppercase tracking-wider">
              Recommended
            </span>
          </div>
          <p className="text-sm text-[var(--muted-fg)] mb-4 flex-1">
            Enter a project URL and evidence links. The system creates a structured research draft.
            All findings require analyst review before publication.
          </p>
          <Link to="/quick-scan" className={btnPrimary}>
            Start Quick Scan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Mode 2 — Demo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.07 }}
          className="glass-strong rounded-2xl p-6 flex flex-col"
        >
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-[var(--azure)]/25 to-[var(--success)]/25 mb-4">
            <FlaskConical className="h-5 w-5 text-[var(--azure)]" aria-hidden="true" />
          </div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="font-display font-semibold text-lg">Load Demo Project</h2>
          </div>
          <p className="text-sm text-[var(--muted-fg)] mb-4 flex-1">
            Load a fictional demonstration RWA assessment. Explore the full scoring, hashing, and
            publication flow with no real data.
          </p>
          <div className="mb-3 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--warning)]/8 border border-[var(--warning)]/20">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] shrink-0" aria-hidden="true" />
            <span className="text-[11px] text-[var(--warning)]">Fictional demo data — not real research</span>
          </div>
          <button onClick={handleLoadDemo} className={btnSecondary}>
            Load Demo Project
          </button>
        </motion.div>

        {/* Mode 3 — Manual */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="glass-strong rounded-2xl p-6 flex flex-col"
        >
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-white/10 to-white/5 mb-4">
            <ClipboardList className="h-5 w-5 text-[var(--muted-fg)]" aria-hidden="true" />
          </div>
          <h2 className="font-display font-semibold text-lg mb-1">Manual Assessment</h2>
          <p className="text-sm text-[var(--muted-fg)] mb-4 flex-1">
            Complete every research field and score manually using the nine-step wizard.
            Recommended for analysts who need full control over every dimension.
          </p>
          <Link to="/submit" className={btnGhost}>
            Open Manual Assessment
          </Link>
        </motion.div>
      </div>

      {/* What the platform does / does not do */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-sm mb-3">What this platform proves</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--success)] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              What on-chain publication proves
            </p>
            <ul className="space-y-1 text-xs text-[var(--muted-fg)]">
              {[
                'Which report was published',
                'Who published it',
                'When it was published',
                'The report hash',
                'The report version',
                'Whether the report was changed',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-[var(--success)] mt-0.5">·</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--warning)] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              What on-chain publication does not prove
            </p>
            <ul className="space-y-1 text-xs text-[var(--muted-fg)]">
              {[
                'That the underlying documents are truthful',
                'That the asset is safe to hold',
                'That the issuer is legitimate',
                'That reserves are actually present',
                'That compliance claims are accurate',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-[var(--warning)] mt-0.5">·</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-[var(--muted-fg)] border-t border-white/8 pt-3">
          This report is a structured readiness assessment, not financial, legal, or investment advice.
          Publication on Avalanche proves report integrity and version history, not the truth of the underlying evidence.
        </p>
      </div>

      {/* Target users */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)] mb-3">Built for</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['RWA analysts', 'investment research teams', 'DAO treasuries', 'funds', 'marketplaces', 'issuers', 'compliance teams'].map((u) => (
            <span key={u} className="px-2.5 py-1 rounded-full text-xs glass border border-white/10 text-[var(--muted-fg)]">
              {u}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useTransform,
  animate,
} from 'framer-motion'
import {
  CheckCircle2,
  FolderOpen,
  FileText,
  UserCheck,
  BarChart3,
  Hash,
  ShieldCheck,
  CircleDot,
} from 'lucide-react'
import {
  METRICS,
  PIPELINE_STAGES,
  OVERALL_SCORE,
  OVERALL_GRADE,
  SCORE_INTERPRETATION,
  DASHBOARD_STATUS_LABEL,
  DASHBOARD_HEADER_LABEL,
} from './command-center-data'

// ── Icon map for pipeline stages ──────────────────────────────────────────────

const STAGE_ICONS = {
  import:   FolderOpen,
  research: FileText,
  review:   UserCheck,
  score:    BarChart3,
  hash:     Hash,
  chain:    ShieldCheck,
} as const satisfies Record<string, typeof FolderOpen>

// ── Evidence status dot color ─────────────────────────────────────────────────

function evidenceDotClass(status: string): string {
  return status === 'verified' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  reduced: boolean
}

export function ReadinessCommandCenter({ reduced }: Props) {
  // Score count-up via MotionValue — no setState inside useEffect
  const scoreValue = useMotionValue(reduced ? OVERALL_SCORE : 0)
  const displayScore = useTransform(scoreValue, (v) => String(Math.round(v)))

  useEffect(() => {
    if (reduced) return
    const controls = animate(scoreValue, OVERALL_SCORE, {
      delay: 0.35,
      duration: 1.0,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [reduced, scoreValue])

  // Pointer-following soft glow (no React state — pure MotionValues)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const glowBg = useMotionTemplate`radial-gradient(circle 300px at ${springX}% ${springY}%, oklch(0.66 0.24 25 / 6%), transparent 70%)`

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
      mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
    },
    [reduced, mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(50)
    mouseY.set(50)
  }, [mouseX, mouseY])

  // Build pipeline (nodes + connecting lines as a flat list)
  const pipelineItems: React.JSX.Element[] = []
  PIPELINE_STAGES.forEach((stage, i) => {
    const Icon = STAGE_ICONS[stage.id]
    const isActive = !stage.completed

    pipelineItems.push(
      <motion.div
        key={stage.id}
        className="flex flex-col items-center gap-1.5 shrink-0"
        initial={reduced ? {} : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.05 + i * 0.09, duration: 0.25 }}
      >
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center border ${
            isActive
              ? 'border-[var(--avax)]/45 bg-[var(--avax)]/10'
              : 'border-[var(--success)]/35 bg-[var(--success)]/8'
          }`}
        >
          {isActive ? (
            <CircleDot className="h-3 w-3 text-[var(--avax)]" aria-hidden="true" />
          ) : (
            <Icon className="h-3 w-3 text-[var(--success)]" aria-hidden="true" />
          )}
        </div>
        <span
          className={`text-[8.5px] text-center leading-tight whitespace-nowrap ${
            isActive ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-fg)]'
          }`}
        >
          {stage.label}
        </span>
      </motion.div>,
    )

    if (i < PIPELINE_STAGES.length - 1) {
      pipelineItems.push(
        <motion.div
          key={`conn-${i}`}
          className="flex-1 h-px bg-white/10 self-start mt-3 min-w-[12px] origin-left"
          initial={reduced ? {} : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: reduced ? 0 : 1.12 + i * 0.09, duration: 0.22 }}
        />,
      )
    }
  })

  return (
    <motion.div
      className="relative w-full overflow-hidden glass-strong rounded-2xl border border-white/10"
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Soft pointer glow — sits behind all content */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: glowBg }}
        aria-hidden="true"
      />

      {/* Screen-reader accessible summary */}
      <p className="sr-only">
        Illustrative evidence-adjusted assessment. Overall readiness score {OVERALL_SCORE} out of
        100, Grade {OVERALL_GRADE}, {SCORE_INTERPRETATION}.
        {METRICS.map((m) => ` ${m.label}: ${m.score}.`).join('')}
        Evidence pipeline:{' '}
        {PIPELINE_STAGES.map(
          (s) => `${s.label} ${s.completed ? 'complete' : 'in progress'}`,
        ).join(', ')}.
      </p>

      {/* ── Header ── */}
      <motion.div
        className="relative flex items-center justify-between px-4 py-2.5 border-b border-white/6"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.16, duration: 0.28 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted-fg)]">
          {DASHBOARD_HEADER_LABEL}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--azure)]/70 ring-1 ring-[var(--azure)]/30" aria-hidden="true" />
          <span className="text-[10px] font-medium text-[var(--muted-fg)]">{DASHBOARD_STATUS_LABEL}</span>
        </div>
      </motion.div>

      {/* ── Body: score panel + metric rows ── */}
      <div className="relative grid grid-cols-1 sm:grid-cols-[180px_1fr]">

        {/* ── Left: Overall score panel ── */}
        <motion.div
          className="flex flex-col items-center justify-center px-5 py-6 border-b border-white/6 sm:border-b-0 sm:border-r sm:border-white/6"
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.2, duration: 0.3 }}
        >
          {/* Ring */}
          <div className="relative w-[128px] h-[128px]">
            <svg
              viewBox="0 0 128 128"
              className="w-full h-full"
              aria-hidden="true"
            >
              {/* Soft glow halo — gives depth without a loud orb effect */}
              <circle
                cx="64" cy="64" r="50"
                fill="none"
                stroke="oklch(0.66 0.24 25 / 10%)"
                strokeWidth="16"
              />
              {/* Track */}
              <circle
                cx="64" cy="64" r="50"
                fill="none"
                stroke="oklch(1 0 0 / 7%)"
                strokeWidth="6"
              />
              {/* Progress arc — SVG transform rotates only this element so gradient stays stable */}
              <motion.circle
                cx="64" cy="64" r="50"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                stroke="oklch(0.66 0.24 25)"
                transform="rotate(-90 64 64)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: OVERALL_SCORE / 100 }}
                transition={{
                  delay: reduced ? 0 : 0.3,
                  duration: reduced ? 0 : 1.0,
                  ease: 'easeOut',
                }}
              />
            </svg>

            {/* Centered score overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span
                className="font-display font-bold text-[2.6rem] leading-none text-gradient-mix"
                aria-label={`Score ${OVERALL_SCORE}`}
              >
                {displayScore}
              </motion.span>
              <div className="mt-2">
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide border border-white/10 text-[var(--muted-fg)]">
                  Grade {OVERALL_GRADE}
                </span>
              </div>
            </div>

            {/* Slow ambient breathing glow — starts after entrance completes */}
            {!reduced && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, oklch(0.66 0.24 25 / 7%) 38%, transparent 68%)',
                }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Text below ring */}
          <div className="mt-4 text-center space-y-0.5">
            <div className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
              Overall Readiness
            </div>
            <div className="text-[10px] text-[var(--muted-fg)]">
              Evidence-adjusted score
            </div>
            <div className="pt-1.5 text-[10px] font-medium text-[var(--success)]">
              {SCORE_INTERPRETATION}
            </div>
            <div className="text-[9px] text-[var(--muted-fg)] opacity-55">
              Evidence gaps remain
            </div>
          </div>
        </motion.div>

        {/* ── Right: Readiness dimension rows ── */}
        <div className="px-4 py-3">
          <div>
            {METRICS.map((metric, i) => (
              <motion.div
                key={metric.id}
                className="flex items-center gap-3 rounded-md px-1.5 py-2.5 border-b border-white/5 last:border-b-0"
                initial={reduced ? {} : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduced ? 0 : 0.6 + i * 0.08, duration: 0.26 }}
                whileHover={reduced ? {} : { backgroundColor: 'oklch(1 0 0 / 4%)' }}
              >
                {/* Evidence status indicator */}
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${evidenceDotClass(metric.evidenceStatus)}`}
                  aria-hidden="true"
                />

                {/* Label + animated progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[var(--foreground)] leading-tight">
                    {metric.label}
                  </div>
                  <div
                    className="mt-1.5 h-1 rounded-full overflow-hidden"
                    style={{ background: 'oklch(1 0 0 / 7%)' }}
                    role="progressbar"
                    aria-valuenow={metric.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${metric.label}: ${metric.score} out of 100`}
                  >
                    <motion.div
                      className="h-full rounded-full origin-left"
                      style={{
                        background:
                          'linear-gradient(90deg, oklch(0.66 0.24 25), oklch(0.68 0.18 240))',
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: metric.score / 100 }}
                      transition={{
                        delay: reduced ? 0 : 0.65 + i * 0.08,
                        duration: reduced ? 0 : 0.65,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>

                {/* Score number */}
                <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums shrink-0 w-6 text-right leading-tight">
                  {metric.score}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Evidence legend */}
          <motion.div
            className="mt-3 flex items-center gap-4"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.0, duration: 0.28 }}
          >
            <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--muted-fg)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
              Verified evidence
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--muted-fg)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" aria-hidden="true" />
              Partial / needs review
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Evidence pipeline ── */}
      <div className="relative border-t border-white/6 px-4 py-3.5">
        {/* Scrollable on very narrow screens */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex items-start gap-0 min-w-max">
            {pipelineItems}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <motion.div
        className="relative border-t border-white/6 px-4 py-2.5 flex items-center justify-between"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.4, duration: 0.28 }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-medium text-[var(--foreground)]">Avalanche Fuji</span>
          <span className="text-[10px] text-[var(--muted-fg)]">· Illustrative context</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[var(--muted-fg)]">
          <span>Versioned reports</span>
          <span aria-hidden="true">·</span>
          <span>Report integrity anchored on-chain</span>
        </div>
        <span className="sm:hidden text-[10px] text-[var(--muted-fg)]">Versioned reports</span>
      </motion.div>
    </motion.div>
  )
}

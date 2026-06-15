import { motion } from 'framer-motion'
import type { ReportVersion } from '@/domain/types'
import { formatDate, truncateHash } from '@/utils/format'
import { gradeFor } from '@/utils/scoring'

interface VersionTimelineProps {
  versions: ReportVersion[]
}

const gradeColor: Record<string, string> = {
  success: 'text-[var(--success)]',
  azure:   'text-[var(--azure)]',
  warning: 'text-[var(--warning)]',
  avax:    'text-[var(--avax)]',
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  const sorted = [...versions].reverse()

  return (
    <ol className="relative space-y-4" aria-label="Version history">
      {sorted.map((v, i) => {
        const { grade, color } = gradeFor(v.overallScore)
        return (
          <motion.li
            key={v.version}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
          >
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="h-5 w-5 rounded-full grid place-items-center glass border border-white/10 text-[10px] font-mono font-semibold shrink-0">
                {v.version}
              </div>
              {i < sorted.length - 1 && (
                <div className="flex-1 w-px bg-white/10 min-h-[20px]" aria-hidden="true" />
              )}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[var(--muted-fg)]">{formatDate(v.date)}</span>
                <span className={`font-display font-bold text-sm ${gradeColor[color]}`}>
                  {v.overallScore} · {grade}
                </span>
              </div>
              {v.analystNote && (
                <p className="text-[11px] text-[var(--muted-fg)] mt-0.5">{v.analystNote}</p>
              )}
              {v.txHash !== 'draft' && v.txHash !== 'not-published' && (
                <p className="font-mono text-[10px] text-[var(--muted-fg)] mt-1">{truncateHash(v.txHash, 8)}</p>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}

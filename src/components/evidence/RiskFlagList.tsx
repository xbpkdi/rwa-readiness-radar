import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { RiskFlag } from '@/domain/types'

const severityConfig = {
  high:   { icon: AlertTriangle, classes: 'bg-[var(--avax)]/5 border-[var(--avax)]/25 text-[var(--avax)]' },
  medium: { icon: AlertCircle,   classes: 'bg-[var(--warning)]/5 border-[var(--warning)]/25 text-[var(--warning)]' },
  low:    { icon: Info,          classes: 'bg-[var(--azure)]/5 border-[var(--azure)]/25 text-[var(--azure)]' },
}

interface RiskFlagListProps {
  flags: RiskFlag[]
}

export function RiskFlagList({ flags }: RiskFlagListProps) {
  if (flags.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-fg)] py-2">No risk flags identified at this time.</p>
    )
  }

  return (
    <ul className="space-y-2" aria-label="Risk flags">
      {flags.map((flag, i) => {
        const { icon: Icon, classes } = severityConfig[flag.severity]
        return (
          <motion.li
            key={flag.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={`flex items-start gap-3 p-3 rounded-lg border ${classes}`}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider mb-0.5">{flag.category}</div>
              <p className="text-sm text-[var(--foreground)]">{flag.description}</p>
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}

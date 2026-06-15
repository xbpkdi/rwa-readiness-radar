import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { EvidenceItem } from '@/domain/types'
import { EvidenceBadge, SourceBadge } from './EvidenceBadge'

interface EvidenceTableProps {
  evidence: EvidenceItem[]
}

export function EvidenceTable({ evidence }: EvidenceTableProps) {
  return (
    <div className="divide-y divide-white/6" role="list" aria-label="Evidence items">
      {evidence.map((item, i) => (
        <motion.div
          key={item.id}
          role="listitem"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.3 }}
          className="py-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-medium">{item.title}</span>
              <EvidenceBadge status={item.status} />
              <SourceBadge sourceType={item.sourceType} />
            </div>
            <p className="text-xs text-[var(--muted-fg)] mb-1">{item.description}</p>
            {item.analystNote && (
              <p className="text-xs text-[var(--muted-fg)] italic">↳ {item.analystNote}</p>
            )}
          </div>
          {item.sourceUrl && item.sourceUrl !== '#' ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-[var(--azure)] hover:underline shrink-0"
              aria-label={`Source for ${item.title} (opens in new tab)`}
            >
              Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-xs text-[var(--muted-fg)] shrink-0">No source link</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

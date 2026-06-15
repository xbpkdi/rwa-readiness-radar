import { CheckCircle2, AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import type { EvidenceStatus, EvidenceSourceType } from '@/domain/types'
import { EVIDENCE_STATUS_LABELS } from '@/config/scoring'

interface EvidenceBadgeProps {
  status: EvidenceStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<EvidenceStatus, {
  icon: typeof CheckCircle2
  classes: string
}> = {
  verified:       { icon: CheckCircle2, classes: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30' },
  partial:        { icon: AlertCircle,  classes: 'text-[var(--azure)] bg-[var(--azure)]/10 border-[var(--azure)]/30' },
  'manual-review':{ icon: HelpCircle,  classes: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30' },
  missing:        { icon: AlertTriangle,classes: 'text-[var(--avax)] bg-[var(--avax)]/10 border-[var(--avax)]/30' },
}

export function EvidenceBadge({ status, size = 'sm' }: EvidenceBadgeProps) {
  const { icon: Icon, classes } = statusConfig[status]
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${classes} ${textSize}`}>
      <Icon className={iconSize} aria-hidden="true" />
      {EVIDENCE_STATUS_LABELS[status]}
    </span>
  )
}

const sourceConfig: Record<EvidenceSourceType, { label: string; classes: string }> = {
  'on-chain':              { label: 'On-chain', classes: 'text-[var(--azure)] bg-[var(--azure)]/10 border-[var(--azure)]/20' },
  'independent-third-party': { label: 'Independent', classes: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20' },
  'regulatory-legal':     { label: 'Regulatory', classes: 'text-[var(--azure)] bg-[var(--azure)]/8 border-[var(--azure)]/15' },
  'issuer-provided':      { label: 'Issuer', classes: 'text-[var(--muted-fg)] bg-white/5 border-white/10' },
  'unverified-claim':     { label: 'Unverified', classes: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20' },
}

interface SourceBadgeProps {
  sourceType: EvidenceSourceType
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  const { label, classes } = sourceConfig[sourceType]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${classes}`}>
      {label}
    </span>
  )
}

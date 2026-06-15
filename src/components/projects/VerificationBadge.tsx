import type { VerificationStatus } from '@/domain/types'

const config: Record<VerificationStatus, { label: string; classes: string; dot: string }> = {
  published:        { label: 'Published', classes: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30', dot: 'bg-[var(--success)]' },
  draft:            { label: 'Draft', classes: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30', dot: 'bg-[var(--warning)]' },
  'pending-review': { label: 'Pending Review', classes: 'text-[var(--azure)] bg-[var(--azure)]/10 border-[var(--azure)]/30', dot: 'bg-[var(--azure)]' },
  'missing-evidence': { label: 'Missing Evidence', classes: 'text-[var(--avax)] bg-[var(--avax)]/10 border-[var(--avax)]/30', dot: 'bg-[var(--avax)]' },
}

interface VerificationBadgeProps {
  status: VerificationStatus
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const { label, classes, dot } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}

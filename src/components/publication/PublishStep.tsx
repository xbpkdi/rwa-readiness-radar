import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { PublicationStatus } from '@/domain/types'
import { Button } from '@/components/common/Button'

interface PublishStepProps {
  stepNumber: number
  totalSteps: number
  title: string
  description: string
  icon: ReactNode
  status: PublicationStatus
  message?: string
  onAction?: () => void
  actionLabel?: string
  children?: ReactNode
}

export function PublishStep({
  stepNumber,
  totalSteps,
  title,
  description,
  icon,
  status,
  message,
  onAction,
  actionLabel = 'Continue',
  children,
}: PublishStepProps) {
  const isLoading = status === 'validating' || status === 'switching-network' || status === 'submitting' || status === 'pending'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-strong rounded-2xl p-8 sm:p-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative h-16 w-16 rounded-2xl grid place-items-center bg-gradient-to-br from-[var(--avax)]/25 to-[var(--azure)]/25 border border-white/10 shrink-0">
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-[var(--azure)]" aria-label="Processing" />
          ) : (
            <span className="h-7 w-7 flex items-center justify-center text-[var(--foreground)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <motion.span
            className="absolute inset-0 rounded-2xl border border-[var(--azure)]/35"
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[var(--muted-fg)] mb-1">
            Step {stepNumber} of {totalSteps}
          </div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            {message ?? description}
          </p>
          {children && <div className="mt-4">{children}</div>}
        </div>

        {onAction && !isLoading && (
          <Button
            variant="primary"
            size="lg"
            onClick={onAction}
            className="shrink-0"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

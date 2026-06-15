import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl p-16 text-center">
      {icon && (
        <div className="mx-auto mb-4 h-12 w-12 rounded-full grid place-items-center bg-white/5 text-[var(--muted-fg)]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-fg)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

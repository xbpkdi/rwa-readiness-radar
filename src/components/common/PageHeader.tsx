import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl sm:text-4xl font-display font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-[var(--muted-fg)] max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

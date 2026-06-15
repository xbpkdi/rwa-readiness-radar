import { Link } from 'react-router-dom'
import { Radar } from 'lucide-react'

interface AppBrandProps {
  variant?: 'header' | 'footer'
}

export function AppBrand({ variant = 'header' }: AppBrandProps) {
  const isHeader = variant === 'header'

  return (
    <Link
      to="/"
      className={`group flex items-center gap-3 min-w-0 shrink-0 rounded-lg outline-offset-4 ${
        isHeader ? 'py-1 pr-2' : 'py-0.5'
      }`}
      aria-label="RWA Readiness Radar home"
    >
      <div
        className={`relative grid place-items-center shrink-0 rounded-lg bg-gradient-to-br from-[var(--avax)] to-[var(--azure)] ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${
          isHeader ? 'h-9 w-9' : 'h-8 w-8'
        }`}
      >
        <Radar className={isHeader ? 'h-[18px] w-[18px] text-white' : 'h-4 w-4 text-white'} aria-hidden="true" />
      </div>
      <div className="min-w-0 leading-none">
        <div
          className={`font-display font-semibold tracking-tight text-[var(--foreground)] truncate ${
            isHeader ? 'text-[15px]' : 'text-sm'
          }`}
        >
          RWA Readiness Radar
        </div>
        <div
          className={`text-[var(--muted-fg)] truncate ${
            isHeader
              ? 'mt-1 text-[11px] tracking-[0.12em] uppercase'
              : 'mt-0.5 text-xs'
          }`}
        >
          {isHeader ? 'Avalanche Edition' : 'Evidence-linked reports on Avalanche'}
        </div>
      </div>
    </Link>
  )
}
/* eslint-disable react-refresh/only-export-components */
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ASSET_TYPE_OPTIONS, CHAIN_OPTIONS, VERIFICATION_STATUS_OPTIONS } from '@/data/projects'
import { GRADE_BANDS } from '@/config/scoring'

export type SortKey =
  | 'overall-desc'
  | 'overall-asc'
  | 'trust-desc'
  | 'supply-desc'
  | 'distribution-desc'
  | 'utility-desc'
  | 'updated-desc'
  | 'name-asc'
  | 'name-desc'

export interface FilterState {
  search: string
  assetType: string
  chain: string
  grade: string
  verificationStatus: string
  sort: SortKey
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  assetType: '',
  chain: '',
  grade: '',
  verificationStatus: '',
  sort: 'overall-desc',
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'overall-desc', label: 'Overall ↓' },
  { value: 'overall-asc', label: 'Overall ↑' },
  { value: 'trust-desc', label: 'Trust ↓' },
  { value: 'supply-desc', label: 'Supply ↓' },
  { value: 'distribution-desc', label: 'Distribution ↓' },
  { value: 'utility-desc', label: 'Utility ↓' },
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
]

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
  totalCount: number
}

export function FilterBar({ filters, onChange, resultCount, totalCount }: FilterBarProps) {
  const hasFilters =
    filters.search !== '' ||
    filters.assetType !== '' ||
    filters.chain !== '' ||
    filters.grade !== '' ||
    filters.verificationStatus !== ''

  const reset = () => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })

  return (
    <div className="glass rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-fg)]" aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by project name or issuer…"
            aria-label="Search projects"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--azure)]/50 focus:ring-1 focus:ring-[var(--azure)]/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-fg)] shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-live="polite">{resultCount} of {totalCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SelectFilter
          label="Asset type"
          value={filters.assetType}
          onChange={(v) => onChange({ ...filters, assetType: v })}
          options={ASSET_TYPE_OPTIONS}
        />
        <SelectFilter
          label="Chain"
          value={filters.chain}
          onChange={(v) => onChange({ ...filters, chain: v })}
          options={CHAIN_OPTIONS}
        />
        <SelectFilter
          label="Grade"
          value={filters.grade}
          onChange={(v) => onChange({ ...filters, grade: v })}
          options={GRADE_BANDS.map((b) => ({ value: b.grade, label: `${b.grade} — ${b.label}` }))}
        />
        <SelectFilter
          label="Status"
          value={filters.verificationStatus}
          onChange={(v) => onChange({ ...filters, verificationStatus: v })}
          options={VERIFICATION_STATUS_OPTIONS}
        />
        <SelectFilter
          label="Sort by"
          value={filters.sort}
          onChange={(v) => onChange({ ...filters, sort: v as SortKey })}
          options={SORT_OPTIONS}
          allLabel={null}
        />
      </div>

      {hasFilters && (
        <button
          onClick={reset}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  )
}

interface SelectFilterProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly { value: string; label: string }[]
  allLabel?: string | null
}

function SelectFilter({ label, value, onChange, options, allLabel = 'All' }: SelectFilterProps) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[var(--azure)]/50 transition-colors"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {allLabel !== null && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ backgroundColor: 'var(--background)' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

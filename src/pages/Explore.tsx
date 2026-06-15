import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FlaskConical } from 'lucide-react'
import { mockProjects } from '@/data/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { FilterBar, DEFAULT_FILTERS, type FilterState } from '@/components/projects/FilterBar'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { allScores, gradeFor } from '@/utils/scoring'
import { assetTypeLabel } from '@/utils/format'

function sortKey(p: (typeof mockProjects)[number], sort: FilterState['sort']): number | string {
  const { trustScore, supplyScore, distributionScore, utilityScore, overallScore } = allScores(
    p.trustDimensions,
    p.readinessScores,
  )
  switch (sort) {
    case 'overall-desc':   return -overallScore
    case 'overall-asc':    return overallScore
    case 'trust-desc':     return -trustScore
    case 'supply-desc':    return -supplyScore
    case 'distribution-desc': return -distributionScore
    case 'utility-desc':   return -utilityScore
    case 'updated-desc':   return new Date(p.lastUpdated).getTime() * -1
    case 'name-asc':       return p.name.toLowerCase()
    case 'name-desc':      return p.name.toLowerCase()
  }
}

export function Explore() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    const matching = mockProjects.filter((p) => {
      const { overallScore } = allScores(p.trustDimensions, p.readinessScores)
      const { grade } = gradeFor(overallScore)

      const searchMatch =
        filters.search === '' ||
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.issuer.toLowerCase().includes(filters.search.toLowerCase()) ||
        assetTypeLabel(p.assetType).toLowerCase().includes(filters.search.toLowerCase())

      return (
        searchMatch &&
        (filters.assetType === '' || p.assetType === filters.assetType) &&
        (filters.chain === '' || p.chain === filters.chain) &&
        (filters.grade === '' || grade === filters.grade) &&
        (filters.verificationStatus === '' || p.verificationStatus === filters.verificationStatus)
      )
    })

    const isDescStr = filters.sort === 'name-desc'
    return [...matching].sort((a, b) => {
      const ka = sortKey(a, filters.sort)
      const kb = sortKey(b, filters.sort)
      if (typeof ka === 'string' && typeof kb === 'string') {
        return isDescStr ? kb.localeCompare(ka) : ka.localeCompare(kb)
      }
      return (ka as number) - (kb as number)
    })
  }, [filters])

  const avgScore =
    filtered.length === 0
      ? null
      : Math.round(
          filtered.reduce((sum, p) => {
            const { overallScore } = allScores(p.trustDimensions, p.readinessScores)
            return sum + overallScore
          }, 0) / filtered.length,
        )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Demo dataset notice */}
      <div className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-xl glass border border-[var(--warning)]/20 text-xs text-[var(--muted-fg)]">
        <FlaskConical className="h-3.5 w-3.5 text-[var(--warning)] mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="text-[var(--warning)] font-medium">Demo dataset</strong>{' '}
          — these projects are fictional examples created for demonstration purposes.
          Public registry indexing is planned for a future release.
        </span>
      </div>

      <PageHeader
        eyebrow="Project Explorer"
        title="RWA Readiness Dashboard"
        description="Browse evidence-scored tokenized real-world asset projects across trust and market readiness dimensions."
        actions={
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatCell label="Avg score" value={avgScore !== null ? String(avgScore) : '—'} />
            <StatCell label="Published" value={String(mockProjects.filter((p) => p.verificationStatus === 'published').length)} />
            <StatCell label="In draft" value={String(mockProjects.filter((p) => p.verificationStatus !== 'published').length)} />
          </div>
        }
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={mockProjects.length}
      />

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No projects match these filters"
              description="Try adjusting your search terms or clearing the filters."
              action={
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="px-4 py-2 rounded-lg text-sm font-medium glass border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Clear all filters
                </button>
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg px-3 py-2">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</div>
    </div>
  )
}

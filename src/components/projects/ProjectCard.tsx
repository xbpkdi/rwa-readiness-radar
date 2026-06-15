import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { RWAProject } from '@/domain/types'
import { allScores } from '@/utils/scoring'
import { gradeFor } from '@/utils/scoring'
import { assetTypeLabel } from '@/utils/format'
import { VerificationBadge } from './VerificationBadge'

interface ProjectCardProps {
  project: RWAProject
  index?: number
}

const gradeColorClasses: Record<string, string> = {
  success: 'text-[var(--success)]',
  azure:   'text-[var(--azure)]',
  warning: 'text-[var(--warning)]',
  avax:    'text-[var(--avax)]',
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { trustScore, supplyScore, distributionScore, utilityScore, overallScore } = allScores(
    project.trustDimensions,
    project.readinessScores,
  )
  const { grade, color } = gradeFor(overallScore)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      layout
    >
      <Link
        to={`/projects/${project.id}`}
        className="block glass rounded-2xl p-5 hover:bg-white/[0.04] transition-colors group h-full"
        aria-label={`View ${project.name} readiness report`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">
              {assetTypeLabel(project.assetType)} · {project.chain}
            </div>
            <h3 className="font-display font-semibold text-base truncate">{project.name}</h3>
            <p className="text-xs text-[var(--muted-fg)] truncate">{project.issuer}</p>
          </div>
          <div className="text-center shrink-0">
            <div className={`font-display text-2xl font-bold tabular-nums ${gradeColorClasses[color]}`}>
              {overallScore}
            </div>
            <div className={`text-xs font-bold ${gradeColorClasses[color]}`}>{grade}</div>
          </div>
        </div>

        <p className="text-xs text-[var(--muted-fg)] mb-4 line-clamp-2">{project.tagline}</p>

        <div className="flex items-center gap-3 mb-4 text-[var(--muted-fg)]">
          {[
            { label: 'T', title: 'Trust', value: trustScore },
            { label: 'S', title: 'Supply', value: supplyScore },
            { label: 'D', title: 'Distribution', value: distributionScore },
            { label: 'U', title: 'Utility', value: utilityScore },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1" title={s.title}>
              <span className="text-[9px] uppercase tracking-wider">{s.label}</span>
              <span className="font-mono text-xs">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <VerificationBadge status={project.verificationStatus} />
          <ArrowRight
            className="h-3.5 w-3.5 text-[var(--muted-fg)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { gradeFor } from '@/utils/scoring'

interface ScoreCardProps {
  label: string
  score: number
  size?: 'sm' | 'md' | 'lg'
  showGrade?: boolean
  delay?: number
}

const colorMap: Record<string, string> = {
  success: 'text-[var(--success)]',
  azure:   'text-[var(--azure)]',
  warning: 'text-[var(--warning)]',
  avax:    'text-[var(--avax)]',
}

export function ScoreCard({ label, score, size = 'md', showGrade = true, delay = 0 }: ScoreCardProps) {
  const displayed = useCountUp(score, 900, 0)
  const { grade, label: gradeLabel, color } = gradeFor(score)

  const numberSize = { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl' }[size]
  const labelSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-xl p-4 text-center"
    >
      <div className={`font-display font-bold tabular-nums ${numberSize} ${colorMap[color]}`}>
        {displayed}
      </div>
      {showGrade && (
        <div className={`font-display font-semibold text-base ${colorMap[color]}`}>
          {grade}
        </div>
      )}
      <div className={`mt-0.5 uppercase tracking-widest text-[var(--muted-fg)] ${labelSize}`}>{label}</div>
      {showGrade && (
        <div className={`mt-1 text-[10px] ${colorMap[color]} opacity-80`}>{gradeLabel}</div>
      )}
    </motion.div>
  )
}

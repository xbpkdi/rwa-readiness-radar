import { motion } from 'framer-motion'

interface DimensionRowProps {
  label: string
  value: number
  max: number
  index?: number
  rawValue?: number
  isCapped?: boolean
}

export function DimensionRow({ label, value, max, index = 0, rawValue, isCapped }: DimensionRowProps) {
  const pct = (value / max) * 100
  const showCap = isCapped && rawValue !== undefined && rawValue !== value

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.35 }}
    >
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[var(--muted-fg)]">{label}</span>
        <span className="font-mono text-xs flex items-center gap-1.5">
          {showCap && (
            <span className="line-through text-[var(--muted-fg)] text-[10px]">{rawValue}</span>
          )}
          <span className={`font-semibold ${showCap ? 'text-[var(--warning)]' : 'text-[var(--foreground)]'}`}>{value}</span>
          <span className="text-[var(--muted-fg)]">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4 + index * 0.05, duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${showCap ? 'from-[var(--warning)]/70 to-[var(--warning)]' : 'from-[var(--avax)] to-[var(--azure)]'}`}
        />
      </div>
    </motion.div>
  )
}

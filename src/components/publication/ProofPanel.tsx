import { motion } from 'framer-motion'
import { Mountain, Hash, Clock, User, Layers } from 'lucide-react'
import { truncateHash, formatDate } from '@/utils/format'

interface ProofPanelProps {
  reportHash: string
  txHash: string
  publisher: string
  publishedAt: string
  version: number
  chainId?: number
}

export function ProofPanel({ reportHash, txHash, publisher, publishedAt, version, chainId }: ProofPanelProps) {
  const isPublished = txHash && txHash !== 'draft' && txHash !== 'not-published'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-strong rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Mountain className="h-4 w-4 text-[var(--avax)]" aria-hidden="true" />
        <h3 className="font-display text-sm font-semibold">Avalanche Proof</h3>
        {isPublished ? (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/25">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Published
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/25">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
            Not published
          </span>
        )}
      </div>

      <dl className="space-y-3">
        <ProofRow
          icon={Hash}
          label="Report Hash"
          value={truncateHash(reportHash, 8)}
          detail="Content fingerprint of the canonical report payload"
          mono
        />
        <ProofRow
          icon={Layers}
          label="Transaction"
          value={isPublished ? truncateHash(txHash, 8) : '—'}
          detail={isPublished ? 'Avalanche publication transaction' : 'Not yet published to Avalanche'}
          mono
        />
        <ProofRow icon={User} label="Publisher" value={truncateHash(publisher, 6)} mono />
        <ProofRow icon={Clock} label="Published" value={formatDate(publishedAt)} />
        {chainId && <ProofRow icon={Mountain} label="Chain ID" value={String(chainId)} mono />}
        <ProofRow icon={Layers} label="Version" value={`v${version}`} mono />
      </dl>

      {!isPublished && (
        <p className="mt-4 text-[10px] text-[var(--muted-fg)] border-t border-white/8 pt-3">
          This report has not been published to Avalanche. Scores reflect available evidence only.
        </p>
      )}
    </motion.div>
  )
}

function ProofRow({ icon: Icon, label, value, mono, detail }: { icon: typeof Hash; label: string; value: string; mono?: boolean; detail?: string }) {
  return (
    <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 items-start">
      <Icon className="h-3.5 w-3.5 text-[var(--muted-fg)] mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">{label}</dt>
        <dd className={`text-xs truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
        {detail && <p className="text-[9px] text-[var(--muted-fg)] mt-0.5 leading-snug">{detail}</p>}
      </div>
    </div>
  )
}

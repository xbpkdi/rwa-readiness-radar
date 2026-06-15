import { Info } from 'lucide-react'

export function TrustBoundaryNotice() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/10 text-xs text-[var(--muted-fg)]"
      role="note"
      aria-label="Trust boundary notice"
    >
      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--azure)]" aria-hidden="true" />
      <p>
        Scores reflect available evidence at the time of this report version. They are not investment advice,
        ratings, or guarantees of performance. Missing evidence is never assumed; it reduces score confidence.
        Always verify the on-chain publication receipt against the full off-chain report before relying on a score.
      </p>
    </div>
  )
}

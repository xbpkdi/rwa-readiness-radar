import { ScoreCard } from './ScoreCard'

interface ReadinessScoreGridProps {
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallScore: number
}

export function ReadinessScoreGrid({
  trustScore,
  supplyScore,
  distributionScore,
  utilityScore,
  overallScore,
}: ReadinessScoreGridProps) {
  return (
    <div className="space-y-3">
      <div className="glass-strong rounded-2xl p-5 text-center">
        <div className="text-[10px] uppercase tracking-widest text-[var(--muted-fg)] mb-2">Overall Readiness</div>
        <ScoreCard label="RWA Readiness Score" score={overallScore} size="lg" delay={0} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Trust Score" score={trustScore} size="sm" delay={0.05} />
        <ScoreCard label="Supply" score={supplyScore} size="sm" delay={0.1} />
        <ScoreCard label="Distribution" score={distributionScore} size="sm" delay={0.15} />
        <ScoreCard label="Utility" score={utilityScore} size="sm" delay={0.2} />
      </div>
    </div>
  )
}

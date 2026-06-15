import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import type { TrustDimensions } from '@/domain/types'
import { TRUST_DIMENSION_LABELS, TRUST_DIMENSION_MAXIMUMS } from '@/config/scoring'

interface RadarChartProps {
  dimensions: TrustDimensions
}

export function RadarChart({ dimensions }: RadarChartProps) {
  const keys = Object.keys(TRUST_DIMENSION_LABELS) as (keyof TrustDimensions)[]

  const data = keys.map((key) => ({
    subject: TRUST_DIMENSION_LABELS[key],
    value: Math.round((dimensions[key] / TRUST_DIMENSION_MAXIMUMS[key]) * 100),
    fullMark: 100,
  }))

  return (
    <div role="img" aria-label="Trust dimension radar chart">
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="oklch(1 0 0 / 10%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'oklch(0.68 0.02 260)', fontSize: 10, fontFamily: 'Inter' }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="oklch(0.66 0.24 25)"
            fill="oklch(0.66 0.24 25)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            animationBegin={200}
            animationDuration={800}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
      <p className="sr-only">
        Radar chart showing trust scores:{' '}
        {data.map((d) => `${d.subject}: ${d.value}/100`).join(', ')}
      </p>
    </div>
  )
}

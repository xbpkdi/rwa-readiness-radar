/** Illustrative demo data — not real analytics, not linked to any real investment product */

export type EvidenceStatus = 'verified' | 'partial' | 'review'

export type ReadinessMetric = {
  id: string
  label: string
  score: number
  evidenceStatus: EvidenceStatus
}

export type PipelineStageId = 'import' | 'research' | 'review' | 'score' | 'hash' | 'chain'

export type PipelineStage = {
  id: PipelineStageId
  label: string
  completed: boolean
}

export const DASHBOARD_STATUS_LABEL = 'Demo snapshot'
export const DASHBOARD_HEADER_LABEL = 'Illustrative evidence-adjusted assessment'

export const OVERALL_SCORE = 82
export const OVERALL_GRADE = 'B'
export const SCORE_INTERPRETATION = 'Strong foundation'

export const METRICS: ReadinessMetric[] = [
  { id: 'legal',        label: 'Legal Clarity',    score: 93, evidenceStatus: 'verified' },
  { id: 'trust',        label: 'Trust Foundation', score: 88, evidenceStatus: 'verified' },
  { id: 'supply',       label: 'Supply Readiness', score: 82, evidenceStatus: 'verified' },
  { id: 'distribution', label: 'Distribution',     score: 76, evidenceStatus: 'partial'  },
  { id: 'utility',      label: 'Utility',          score: 72, evidenceStatus: 'review'   },
]

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'import',   label: 'Import',      completed: true  },
  { id: 'research', label: 'Research',    completed: true  },
  { id: 'review',   label: 'Review',      completed: true  },
  { id: 'score',    label: 'Score',       completed: true  },
  { id: 'hash',     label: 'Report Hash', completed: true  },
  { id: 'chain',    label: 'Avalanche',   completed: false },
]

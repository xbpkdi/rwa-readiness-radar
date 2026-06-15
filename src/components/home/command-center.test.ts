import { describe, it, expect } from 'vitest'
import {
  METRICS,
  PIPELINE_STAGES,
  OVERALL_SCORE,
  OVERALL_GRADE,
  SCORE_INTERPRETATION,
  DASHBOARD_STATUS_LABEL,
  DASHBOARD_HEADER_LABEL,
} from './command-center-data'

// ── Overall score ─────────────────────────────────────────────────────────────

describe('OVERALL_SCORE', () => {
  it('renders the correct overall score of 82', () => {
    expect(OVERALL_SCORE).toBe(82)
  })

  it('is within the valid 0-100 range', () => {
    expect(OVERALL_SCORE).toBeGreaterThanOrEqual(0)
    expect(OVERALL_SCORE).toBeLessThanOrEqual(100)
  })

  it('grade is B for score 82', () => {
    expect(OVERALL_GRADE).toBe('B')
  })

  it('has a non-empty score interpretation', () => {
    expect(SCORE_INTERPRETATION.trim().length).toBeGreaterThan(0)
  })
})

// ── Readiness metrics ─────────────────────────────────────────────────────────

describe('METRICS', () => {
  it('contains exactly five readiness dimensions', () => {
    expect(METRICS).toHaveLength(5)
  })

  it('includes Legal Clarity with full label (not "Legal" only)', () => {
    const metric = METRICS.find((m) => m.id === 'legal')
    expect(metric).toBeDefined()
    expect(metric?.label).toBe('Legal Clarity')
  })

  it('includes Trust Foundation with full label', () => {
    const metric = METRICS.find((m) => m.id === 'trust')
    expect(metric?.label).toBe('Trust Foundation')
  })

  it('includes Supply Readiness', () => {
    const metric = METRICS.find((m) => m.id === 'supply')
    expect(metric?.label).toBe('Supply Readiness')
  })

  it('includes Distribution', () => {
    const metric = METRICS.find((m) => m.id === 'distribution')
    expect(metric?.label).toBe('Distribution')
  })

  it('includes Utility', () => {
    const metric = METRICS.find((m) => m.id === 'utility')
    expect(metric?.label).toBe('Utility')
  })

  it('does not use "Dist." abbreviation', () => {
    for (const m of METRICS) {
      expect(m.label).not.toContain('Dist.')
    }
  })

  it('specific scores match design spec', () => {
    const byId = Object.fromEntries(METRICS.map((m) => [m.id, m.score]))
    expect(byId.legal).toBe(93)
    expect(byId.trust).toBe(88)
    expect(byId.supply).toBe(82)
    expect(byId.distribution).toBe(76)
    expect(byId.utility).toBe(72)
  })

  it('all scores are in valid 0-100 range', () => {
    for (const m of METRICS) {
      expect(m.score).toBeGreaterThanOrEqual(0)
      expect(m.score).toBeLessThanOrEqual(100)
    }
  })

  it('all metrics have valid evidence status', () => {
    const valid = new Set(['verified', 'partial', 'review'])
    for (const m of METRICS) {
      expect(valid.has(m.evidenceStatus)).toBe(true)
    }
  })

  it('has no duplicate metric ids', () => {
    const ids = METRICS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── Pipeline stages ───────────────────────────────────────────────────────────

describe('PIPELINE_STAGES', () => {
  it('contains exactly six stages', () => {
    expect(PIPELINE_STAGES).toHaveLength(6)
  })

  it('includes all required stage labels', () => {
    const labels = PIPELINE_STAGES.map((s) => s.label)
    expect(labels).toContain('Import')
    expect(labels).toContain('Research')
    expect(labels).toContain('Review')
    expect(labels).toContain('Score')
    expect(labels).toContain('Report Hash')
    expect(labels).toContain('Avalanche')
  })

  it('Avalanche stage renders (completed or active)', () => {
    const chain = PIPELINE_STAGES.find((s) => s.id === 'chain')
    expect(chain).toBeDefined()
    expect(chain?.label).toBe('Avalanche')
  })

  it('stages before Avalanche are completed', () => {
    const beforeChain = PIPELINE_STAGES.filter((s) => s.id !== 'chain')
    for (const s of beforeChain) {
      expect(s.completed).toBe(true)
    }
  })

  it('has no duplicate stage ids', () => {
    const ids = PIPELINE_STAGES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── Removed old content ───────────────────────────────────────────────────────

describe('Dashboard labeling', () => {
  it('uses Demo snapshot instead of Live model', () => {
    expect(DASHBOARD_STATUS_LABEL).toBe('Demo snapshot')
    expect(DASHBOARD_STATUS_LABEL).not.toContain('Live')
  })

  it('retains illustrative assessment header label', () => {
    expect(DASHBOARD_HEADER_LABEL).toBe('Illustrative evidence-adjusted assessment')
  })
})

describe('Removed old visualization content', () => {
  it('data does not contain "frontend · v0.1"', () => {
    const allLabels = [
      ...METRICS.map((m) => m.label),
      ...PIPELINE_STAGES.map((s) => s.label),
      SCORE_INTERPRETATION,
    ]
    for (const label of allLabels) {
      expect(label).not.toContain('v0.1')
      expect(label).not.toContain('frontend')
    }
  })

  it('data does not use "Dist." abbreviation', () => {
    for (const m of METRICS) {
      expect(m.label).not.toBe('Dist.')
      expect(m.label).not.toContain('Dist.')
    }
  })

  it('data does not contain lowercase "avalanche-fuji" debug label', () => {
    const allLabels = PIPELINE_STAGES.map((s) => s.label)
    for (const label of allLabels) {
      expect(label).not.toBe('avalanche-fuji')
    }
  })
})

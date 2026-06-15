import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { AppHeader } from '@/components/navigation/AppHeader'
import { AppFooter } from '@/components/navigation/AppFooter'
import {
  DASHBOARD_HEADER_LABEL,
  DASHBOARD_STATUS_LABEL,
} from './command-center-data'
import {
  PRIMARY_CTA,
  SECONDARY_CTA,
  MANUAL_ASSESSMENT_LINK,
  HERO_HEADLINE_LEAD_LINE1,
  HERO_HEADLINE_LEAD_LINE2,
  HERO_HEADLINE_GRADIENT_LINE1,
  HERO_HEADLINE_GRADIENT_LINE2,
  HERO_HEADLINE_GRADIENT_LINE3,
  HERO_HEADLINE_GRADIENT_LINE4,
  HERO_DESCRIPTION,
  HERO_CTA_HELPER,
} from './home-content'
import { GITHUB_URL } from '@/components/navigation/nav-config'

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

vi.mock('@/hooks/useWalletConnection', () => ({
  useWalletConnection: () => ({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isOnFuji: false,
    shortAddress: '',
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

function renderHomeMarkup() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppHeader />
      <Landing />
      <AppFooter />
    </MemoryRouter>,
  )
}

describe('Home page content accuracy', () => {
  let markup = ''

  beforeEach(() => {
    markup = renderHomeMarkup()
  })

  it('does not contain misleading Live model wording', () => {
    expect(markup).not.toContain('Live model')
    expect(markup).not.toContain('Live analytics')
    expect(markup).not.toContain('Real-time score')
  })

  it('shows demo snapshot and illustrative assessment labels', () => {
    expect(markup).toContain(DASHBOARD_STATUS_LABEL)
    expect(markup).toContain(DASHBOARD_HEADER_LABEL)
  })

  it('does not show unsupported traction statistics', () => {
    expect(markup).not.toContain('projects evaluated')
    expect(markup).not.toContain('assessment layers')
    expect(markup).not.match(/\d+\s+published/)
  })

  it('does not show hero capability metrics row', () => {
    expect(markup).not.toContain('readiness dimensions')
    expect(markup).not.toContain('score categories')
  })

  it('uses six-line headline with brand avax/azure gradient', () => {
    expect(markup).toContain(HERO_HEADLINE_LEAD_LINE1)
    expect(markup).toContain(HERO_HEADLINE_LEAD_LINE2)
    expect(markup).toContain(HERO_HEADLINE_GRADIENT_LINE1)
    expect(markup).toContain(HERO_HEADLINE_GRADIENT_LINE2)
    expect(markup).toContain(HERO_HEADLINE_GRADIENT_LINE3)
    expect(markup).toContain(HERO_HEADLINE_GRADIENT_LINE4)
    expect(markup).toContain('hero-headline-gradient')
    expect(markup).toContain('hero-headline-gradient-1')
    expect(markup).toContain('hero-headline-gradient-4')
    expect(markup).not.toContain('Analyst-reviewed readiness scoring')
  })

  it('uses the shortened supporting copy only', () => {
    expect(markup).toContain(HERO_DESCRIPTION)
    expect(markup).not.toContain('Turn fragmented legal, custody, reserve')
    expect(markup).not.toContain('The platform structures evidence and supports human review')
  })

  it('renders primary and secondary buttons plus a manual assessment link', () => {
    expect(markup).toContain(`href="${PRIMARY_CTA.to}"`)
    expect(markup).toContain(PRIMARY_CTA.label)
    expect(markup).toContain(`href="${SECONDARY_CTA.to}"`)
    expect(markup).toContain(SECONDARY_CTA.label)
    expect(markup).toContain(`href="${MANUAL_ASSESSMENT_LINK.to}"`)
    expect(markup).toContain(MANUAL_ASSESSMENT_LINK.label)
  })

  it('uses concise helper copy', () => {
    expect(markup).toContain(HERO_CTA_HELPER)
    expect(markup).not.toContain('organizes your project information and evidence')
    expect(markup).not.toContain('claims are not independently verified')
  })

  it('keeps demo available on the page', () => {
    expect(markup).toContain('Load Demo Project')
    expect(markup).toContain('Fictional demonstration data')
  })

  it('keeps navbar and footer shell present', () => {
    expect(markup).toContain('shell-header-surface')
    expect(markup).toContain('shell-footer-surface')
    expect(markup).toContain('xbpkdi')
    expect(markup).toContain(`href="${GITHUB_URL}"`)
  })
})
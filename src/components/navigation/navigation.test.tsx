import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { NAV_LINKS, GITHUB_URL, GITHUB_LABEL } from './nav-config'
import { AppHeader } from './AppHeader'
import { AppFooter } from './AppFooter'

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

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

function renderShellMarkup(pathname = '/') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <AppHeader />
      <AppFooter />
    </MemoryRouter>,
  )
}

describe('NAV_LINKS', () => {
  it('contains all primary navigation routes', () => {
    const routes = NAV_LINKS.map((l) => l.to)
    expect(routes).toContain('/')
    expect(routes).toContain('/explore')
    expect(routes).toContain('/assess')
    expect(routes).toContain('/publish')
    expect(routes).toContain('/methodology')
    expect(routes).toContain('/architecture')
  })

  it('Home link uses end=true for exact route matching', () => {
    const home = NAV_LINKS.find((l) => l.to === '/')
    expect(home).toBeDefined()
    expect(home?.end).toBe(true)
  })

  it('every link has a non-empty label and a route starting with /', () => {
    for (const link of NAV_LINKS) {
      expect(link.to).toMatch(/^\//)
      expect(link.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('footer navigation menu links are not a separate list (no duplication)', () => {
    const routes = NAV_LINKS.map((l) => l.to)
    expect(routes).not.toContain('/submit')
  })

  it('has no duplicate routes', () => {
    const routes = NAV_LINKS.map((l) => l.to)
    const unique = new Set(routes)
    expect(unique.size).toBe(routes.length)
  })
})

describe('GitHub link config', () => {
  it('points to the correct profile URL', () => {
    expect(GITHUB_URL).toBe('https://github.com/xbpkdi')
  })

  it('uses HTTPS', () => {
    expect(GITHUB_URL).toMatch(/^https:\/\//)
  })

  it('accessible label mentions xbpkdi', () => {
    expect(GITHUB_LABEL).toMatch(/xbpkdi/i)
  })

  it('accessible label is non-empty and descriptive', () => {
    expect(GITHUB_LABEL.trim().length).toBeGreaterThan(6)
  })
})

describe('application shell markup', () => {
  let markup = ''

  beforeEach(() => {
    markup = renderShellMarkup('/assess')
  })

  it('renders brand identity', () => {
    expect(markup).toContain('RWA Readiness Radar')
    expect(markup).toContain('Avalanche Edition')
  })

  it('renders all desktop navigation items', () => {
    for (const link of NAV_LINKS) {
      expect(markup).toContain(link.label)
    }
  })

  it('includes unified navigation rail and active indicator surface', () => {
    expect(markup).toContain('shell-nav-rail')
    expect(markup).toContain('surface-elevated')
  })

  it('renders wallet connect action', () => {
    expect(markup).toContain('Connect wallet')
  })

  it('renders accessible mobile menu control', () => {
    expect(markup).toContain('Open navigation')
    expect(markup).toContain('mobile-navigation-panel')
  })

  it('does not render footer navigation links', () => {
    const footerMarkup = markup.slice(markup.indexOf('<footer'))
    expect(footerMarkup).not.toContain('href="/explore"')
    expect(footerMarkup).not.toContain('href="/methodology"')
    expect(footerMarkup).not.toContain('href="/architecture"')
    expect(footerMarkup).not.toContain('href="/assess"')
    expect(footerMarkup).not.toContain('href="/publish"')
  })

  it('footer contains xbpkdi username visibly', () => {
    expect(markup).toContain('xbpkdi')
    expect(markup).toContain('Built by')
  })

  it('footer GitHub link uses exact profile URL and security attributes', () => {
    expect(markup).toContain(`href="${GITHUB_URL}"`)
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
    expect(markup).toContain(`aria-label="${GITHUB_LABEL}"`)
  })

  it('does not contain deprecated footer filler or version labels', () => {
    expect(markup).not.toContain('frontend · v0.1')
    expect(markup).not.toContain('Evidence-linked RWA readiness reports')
  })

  it('uses shared shell surfaces for header and footer', () => {
    expect(markup).toContain('shell-header-surface')
    expect(markup).toContain('shell-footer-surface')
    expect(markup).toContain('shell-container')
  })
})
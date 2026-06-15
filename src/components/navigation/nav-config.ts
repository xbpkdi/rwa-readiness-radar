export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true as const },
  { to: '/explore', label: 'Explore' },
  { to: '/assess', label: 'Assess' },
  { to: '/publish', label: 'Publish' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/architecture', label: 'Architecture' },
] satisfies ReadonlyArray<{ to: string; label: string; end?: true }>

export const GITHUB_URL = 'https://github.com/xbpkdi'
export const GITHUB_LABEL = 'View xbpkdi on GitHub'

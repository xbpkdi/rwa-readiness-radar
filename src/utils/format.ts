export function truncateHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2 + 2) return hash
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function assetTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'tokenized-treasury': 'Tokenized Treasury',
    'private-credit': 'Private Credit',
    'tokenized-equity': 'Tokenized Equity',
    'real-estate': 'Real Estate',
    'commodity': 'Commodity',
    'invoice-financing': 'Invoice Financing',
  }
  return map[type] ?? type
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

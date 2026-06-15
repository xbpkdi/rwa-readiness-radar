/**
 * Returns true when the value is empty (optional field not filled) or a valid
 * absolute http:// or https:// URL. Returns false for any non-empty string
 * that is not a well-formed absolute URL with an accepted protocol.
 *
 * Browser-native URL validation is the primary check; the protocol guard
 * additionally rejects javascript:, data:, ftp:, and other non-http schemes.
 */
export function isValidUrl(value: string): boolean {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Returns true when the URL is non-empty and valid (required URL fields).
 * Trims whitespace before checking.
 */
export function isRequiredUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return isValidUrl(trimmed)
}

/**
 * Returns true when the URL (if non-empty) contains the example.com domain.
 * Used to warn analysts that example.com URLs are placeholder values.
 */
export function hasExampleDomain(value: string): boolean {
  if (!value.trim()) return false
  try {
    const url = new URL(value.trim())
    return url.hostname === 'example.com' || url.hostname.endsWith('.example.com')
  } catch {
    return false
  }
}

/**
 * Returns true when the value is either empty (field is optional)
 * or a valid 0x-prefixed 40-character hexadecimal Ethereum-style address.
 */
export function isValidEthAddress(value: string): boolean {
  if (!value.trim()) return true
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export const URL_ERROR = 'Must be a valid https:// URL'

export const ETH_ADDRESS_ERROR =
  'Must be a valid Ethereum address starting with 0x followed by 40 hex characters'

export const EXAMPLE_DOMAIN_WARNING =
  'This URL uses example.com, which is a placeholder domain. Replace with a real URL before submitting as production evidence.'

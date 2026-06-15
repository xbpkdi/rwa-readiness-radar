import { decodeErrorResult, type Hex } from 'viem'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'

export interface DecodedContractError {
  name: string
  message: string
  raw?: string
  args?: unknown[]
}

export interface ErrorDevDetails {
  errorName: string | null
  shortMessage: string | null
  messageSummary: string | null
}

/**
 * Maps a known Solidity custom error name to a user-facing DecodedContractError.
 * Accepts pre-decoded args — no hex re-decode required.
 * Returns null for unrecognised error names.
 */
export function messageForErrorName(
  errorName: string,
  args?: unknown[],
): DecodedContractError | null {
  switch (errorName) {
    case 'EmptyProjectId':
      return { name: errorName, message: 'Project ID must not be empty.' }
    case 'EmptyReportHash':
      return { name: errorName, message: 'Report hash must not be empty.' }
    case 'ScoreOutOfRange': {
      const score = args?.[0] as number | undefined
      return {
        name: errorName,
        message: `Score ${score ?? ''} is out of range. Scores must be 0–100.`,
        args,
      }
    }
    case 'InvalidGrade': {
      const grade = args?.[0] as number | undefined
      return {
        name: errorName,
        message: `Grade ${grade ?? ''} is invalid. Must be 1 (A), 2 (B), 3 (C), or 4 (D).`,
        args,
      }
    }
    case 'InvalidVersion': {
      const provided = args?.[0] as number | undefined
      const expected = args?.[1] as number | undefined
      return {
        name: errorName,
        message: `Invalid version: expected ${expected ?? '?'}, got ${provided ?? '?'}. Versions must be sequential.`,
        args,
      }
    }
    case 'DuplicateReportHash':
      return {
        name: errorName,
        message: 'This exact report has already been published for this project.',
        args,
      }
    case 'SnapshotNotFound':
      return {
        name: errorName,
        message: 'No snapshot found for the requested project and version.',
        args,
      }
    default:
      return null
  }
}

/**
 * Decodes a hex-encoded ABI error from the registry contract.
 * Prefer messageForErrorName when the error name is already decoded.
 */
export function decodeContractError(errorData: Hex): DecodedContractError {
  try {
    const decoded = decodeErrorResult({
      abi: RWA_READINESS_REGISTRY_ABI,
      data: errorData,
    })
    const named = messageForErrorName(decoded.errorName, decoded.args as unknown as unknown[])
    if (named) return named
    const d = decoded as unknown as { errorName: string }
    return { name: d.errorName, message: `Contract error: ${d.errorName}` }
  } catch {
    return {
      name: 'UnknownError',
      message: 'An unknown contract error occurred.',
      raw: errorData,
    }
  }
}

/**
 * Walks an error chain (up to 12 levels deep) and returns the Solidity
 * custom error name if one is present, or null otherwise.
 */
export function extractErrorCode(err: unknown, depth = 0): string | null {
  if (depth > 12) return null
  if (err === null || err === undefined) return null
  if (typeof err !== 'object') return null

  const e = err as Record<string, unknown>

  // Direct errorName property (some viem error shapes expose this)
  if (typeof e.errorName === 'string') return e.errorName

  // Viem ContractFunctionRevertedError: .data.errorName
  if (typeof e.data === 'object' && e.data !== null) {
    const data = e.data as Record<string, unknown>
    if (typeof data.errorName === 'string') return data.errorName
  }

  // Walk .cause chain
  if (e.cause !== null && e.cause !== undefined) {
    return extractErrorCode(e.cause, depth + 1)
  }

  return null
}

/**
 * Extracts sanitized developer details from any error value.
 * Never returns secrets, keys, or .env content.
 */
export function extractDevDetails(err: unknown): ErrorDevDetails {
  const result: ErrorDevDetails = {
    errorName: extractErrorCode(err),
    shortMessage: null,
    messageSummary: null,
  }
  if (err === null || err === undefined) return result
  if (typeof err !== 'object') {
    result.messageSummary = String(err).slice(0, 200)
    return result
  }
  const e = err as Record<string, unknown>
  if (typeof e.shortMessage === 'string') {
    result.shortMessage = e.shortMessage.slice(0, 200)
  }
  if (typeof e.message === 'string') {
    result.messageSummary = e.message.slice(0, 200)
  }
  return result
}

/**
 * Walks an unknown error and returns a user-facing message string.
 *
 * Priority:
 * 1. Viem ContractFunctionRevertedError: .data.errorName → messageForErrorName
 * 2. Recursive .cause chain (handles ContractFunctionExecutionError wrapper)
 * 3. error.name === 'UserRejectedRequestError'
 * 4. Known keyword patterns in .message
 * 5. Fallback to .message or generic string
 */
export function extractErrorMessage(err: unknown, depth = 0): string {
  if (depth > 12) return 'An unexpected error occurred.'
  if (err === null || err === undefined) return 'Unknown error'
  if (typeof err !== 'object') return String(err)

  const e = err as Record<string, unknown>

  // ── Viem ContractFunctionRevertedError ────────────────────────────────────
  // .data is DecodedContractError = { errorName, args, abiItem }
  // NOTE: .data.data does NOT exist in this structure — that was the original bug.
  //       We use messageForErrorName directly on the decoded name+args.
  if (typeof e.data === 'object' && e.data !== null) {
    const data = e.data as Record<string, unknown>
    if (typeof data.errorName === 'string') {
      const named = messageForErrorName(data.errorName, data.args as unknown[])
      if (named) return named.message
      // Unknown error name but we have the name — show it
      return `Contract error: ${data.errorName}`
    }
  }

  // ── Walk .cause chain ────────────────────────────────────────────────────
  // ContractFunctionExecutionError wraps ContractFunctionRevertedError in .cause
  if (e.cause !== null && e.cause !== undefined && typeof e.cause === 'object') {
    const causeMsg = extractErrorMessage(e.cause, depth + 1)
    // Prefer the cause message unless it's the generic fallback
    if (
      causeMsg &&
      causeMsg !== 'An unexpected error occurred.' &&
      causeMsg !== 'Unknown error'
    ) {
      return causeMsg
    }
  }

  // ── UserRejectedRequestError ─────────────────────────────────────────────
  if (typeof e.name === 'string' && e.name === 'UserRejectedRequestError') {
    return 'Transaction rejected by user.'
  }

  // ── Keyword matching on .message ─────────────────────────────────────────
  if (typeof e.message === 'string') {
    const msg = e.message.toLowerCase()
    if (msg.includes('user rejected') || msg.includes('user denied') || msg.includes('rejected')) {
      return 'Transaction rejected by user.'
    }
    if (msg.includes('insufficient funds') || msg.includes('insufficient balance')) {
      return 'Insufficient AVAX balance. Get test AVAX from the Fuji faucet.'
    }
    if (msg.includes('nonce too low') || msg.includes('nonce')) {
      return 'Nonce error — please refresh the page and try again.'
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return 'RPC request timed out. Check your network and try again.'
    }
    if (msg.includes('network changed') || msg.includes('chain changed')) {
      return 'Network changed during publication. Please stay on Avalanche Fuji.'
    }
    return e.message
  }

  return 'An unexpected error occurred.'
}

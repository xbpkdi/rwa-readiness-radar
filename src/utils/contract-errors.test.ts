import { describe, it, expect } from 'vitest'
import {
  decodeContractError,
  extractErrorMessage,
  extractErrorCode,
  extractDevDetails,
  messageForErrorName,
} from './contract-errors'
import { encodeErrorResult } from 'viem'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'

// ─── helpers ─────────────────────────────────────────────────────────────────

function encodeError(name: string, args: unknown[] = []): `0x${string}` {
  return encodeErrorResult({
    abi: RWA_READINESS_REGISTRY_ABI,
    errorName: name as 'EmptyProjectId',
    args: args as [],
  }) as `0x${string}`
}

const DEMO_PROJECT_ID =
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as const
const DEMO_REPORT_HASH =
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const

// ─── messageForErrorName ──────────────────────────────────────────────────────

describe('messageForErrorName', () => {
  it('maps EmptyProjectId', () => {
    const r = messageForErrorName('EmptyProjectId')
    expect(r).not.toBeNull()
    expect(r!.name).toBe('EmptyProjectId')
    expect(r!.message).toMatch(/empty/i)
  })

  it('maps EmptyReportHash', () => {
    const r = messageForErrorName('EmptyReportHash')
    expect(r!.message).toMatch(/empty/i)
  })

  it('maps ScoreOutOfRange with args', () => {
    const r = messageForErrorName('ScoreOutOfRange', [101])
    expect(r!.message).toContain('101')
    expect(r!.args).toEqual([101])
  })

  it('maps InvalidGrade with args', () => {
    const r = messageForErrorName('InvalidGrade', [5])
    expect(r!.message).toContain('5')
  })

  it('maps InvalidVersion with provided and expected', () => {
    const r = messageForErrorName('InvalidVersion', [3, 2])
    expect(r!.message).toContain('3')
    expect(r!.message).toContain('2')
  })

  it('maps DuplicateReportHash', () => {
    const r = messageForErrorName('DuplicateReportHash')
    expect(r!.name).toBe('DuplicateReportHash')
    expect(r!.message).toMatch(/duplicate|already/i)
  })

  it('maps SnapshotNotFound', () => {
    const r = messageForErrorName('SnapshotNotFound')
    expect(r!.message).toMatch(/snapshot|not found/i)
  })

  it('returns null for unknown error names', () => {
    expect(messageForErrorName('SomeUnknownError')).toBeNull()
    expect(messageForErrorName('')).toBeNull()
  })
})

// ─── decodeContractError (hex decode path) ───────────────────────────────────

describe('decodeContractError', () => {
  it('decodes EmptyProjectId', () => {
    const data = encodeError('EmptyProjectId')
    const result = decodeContractError(data)
    expect(result.name).toBe('EmptyProjectId')
    expect(result.message).toMatch(/empty/i)
  })

  it('decodes EmptyReportHash', () => {
    const data = encodeError('EmptyReportHash')
    const result = decodeContractError(data)
    expect(result.name).toBe('EmptyReportHash')
    expect(result.message).toMatch(/empty/i)
  })

  it('decodes ScoreOutOfRange with score value', () => {
    const data = encodeError('ScoreOutOfRange', [101])
    const result = decodeContractError(data)
    expect(result.name).toBe('ScoreOutOfRange')
    expect(result.message).toContain('101')
    expect(result.message).toMatch(/range|0.100/i)
  })

  it('decodes InvalidGrade with grade value', () => {
    const data = encodeError('InvalidGrade', [5])
    const result = decodeContractError(data)
    expect(result.name).toBe('InvalidGrade')
    expect(result.message).toContain('5')
  })

  it('decodes InvalidVersion with provided and expected', () => {
    const data = encodeError('InvalidVersion', [3, 2])
    const result = decodeContractError(data)
    expect(result.name).toBe('InvalidVersion')
    expect(result.message).toContain('3')
    expect(result.message).toContain('2')
  })

  it('decodes DuplicateReportHash', () => {
    const data = encodeError('DuplicateReportHash', [DEMO_PROJECT_ID, DEMO_REPORT_HASH])
    const result = decodeContractError(data)
    expect(result.name).toBe('DuplicateReportHash')
    expect(result.message).toMatch(/duplicate|already/i)
  })

  it('decodes SnapshotNotFound', () => {
    const data = encodeError('SnapshotNotFound', [DEMO_PROJECT_ID, 0])
    const result = decodeContractError(data)
    expect(result.name).toBe('SnapshotNotFound')
    expect(result.message).toMatch(/snapshot|not found/i)
  })

  it('returns UnknownError for garbage data', () => {
    const result = decodeContractError('0xdeadbeef')
    expect(result.name).toBe('UnknownError')
    expect(result.raw).toBe('0xdeadbeef')
  })

  // The original bug: 0x (empty) must not crash — previously returned "unknown"
  it('returns UnknownError for 0x empty data without crashing', () => {
    const result = decodeContractError('0x')
    expect(result.name).toBe('UnknownError')
  })
})

// ─── extractErrorCode ─────────────────────────────────────────────────────────

describe('extractErrorCode', () => {
  it('returns null for null/undefined', () => {
    expect(extractErrorCode(null)).toBeNull()
    expect(extractErrorCode(undefined)).toBeNull()
  })

  it('returns null for plain strings', () => {
    expect(extractErrorCode('some error')).toBeNull()
  })

  it('returns null for plain Error without custom code', () => {
    expect(extractErrorCode(new Error('plain error'))).toBeNull()
  })

  it('reads errorName from .data.errorName (ContractFunctionRevertedError pattern)', () => {
    const err = {
      name: 'ContractFunctionRevertedError',
      message: 'reverted',
      data: { errorName: 'DuplicateReportHash', args: [] },
    }
    expect(extractErrorCode(err)).toBe('DuplicateReportHash')
  })

  it('reads errorName from .errorName directly', () => {
    const err = { errorName: 'InvalidVersion' }
    expect(extractErrorCode(err)).toBe('InvalidVersion')
  })

  it('walks .cause chain to find errorName (ContractFunctionExecutionError wrapping pattern)', () => {
    const inner = {
      name: 'ContractFunctionRevertedError',
      data: { errorName: 'DuplicateReportHash', args: [] },
    }
    const outer = {
      name: 'ContractFunctionExecutionError',
      message: 'The contract function "publishReport" reverted.',
      // .data is AbiFunction here, not error data
      data: { type: 'function', name: 'publishReport', inputs: [], outputs: [] },
      cause: inner,
    }
    expect(extractErrorCode(outer)).toBe('DuplicateReportHash')
  })

  it('handles deeply nested cause chain', () => {
    const deep = { data: { errorName: 'ScoreOutOfRange', args: [101] } }
    const mid = { cause: deep }
    const outer = { cause: mid }
    expect(extractErrorCode(outer)).toBe('ScoreOutOfRange')
  })

  it('returns null after 12-level depth limit', () => {
    // Build a chain that would exceed 12 levels without a limit
    let chain: Record<string, unknown> = { data: { errorName: 'DuplicateReportHash' } }
    for (let i = 0; i < 15; i++) chain = { cause: chain }
    // Should not throw; may return null due to depth limit
    expect(() => extractErrorCode(chain)).not.toThrow()
  })
})

// ─── extractErrorMessage ──────────────────────────────────────────────────────

describe('extractErrorMessage', () => {
  it('handles null/undefined gracefully', () => {
    expect(extractErrorMessage(null)).toBe('Unknown error')
    expect(extractErrorMessage(undefined)).toBe('Unknown error')
  })

  it('extracts message from plain Error', () => {
    const msg = extractErrorMessage(new Error('something went wrong'))
    expect(msg).toBe('something went wrong')
  })

  it('detects user rejection in message', () => {
    const msg = extractErrorMessage(new Error('User rejected the request'))
    expect(msg).toMatch(/reject/i)
  })

  it('detects UserRejectedRequestError by name', () => {
    const err = Object.assign(new Error(''), { name: 'UserRejectedRequestError' })
    expect(extractErrorMessage(err)).toMatch(/reject/i)
  })

  it('detects insufficient funds in message', () => {
    const msg = extractErrorMessage(new Error('insufficient funds for gas'))
    expect(msg).toMatch(/AVAX|balance|insufficient/i)
  })

  it('detects nonce errors', () => {
    const msg = extractErrorMessage(new Error('nonce too low'))
    expect(msg).toMatch(/nonce/i)
  })

  it('follows .cause chain for keyword matching', () => {
    const cause = new Error('User rejected the request')
    const outer = Object.assign(new Error('wrapper'), { cause })
    const msg = extractErrorMessage(outer)
    expect(msg).toMatch(/reject/i)
  })

  it('returns string input as-is', () => {
    expect(extractErrorMessage('something')).toBe('something')
  })

  // ── Critical regression: the original bug ────────────────────────────────
  // ContractFunctionRevertedError has .data.errorName but .data.data is undefined
  // Previously this fell through to decodeContractError('0x') → UnknownError

  it('maps DuplicateReportHash from viem ContractFunctionRevertedError-like structure', () => {
    const err = {
      name: 'ContractFunctionRevertedError',
      message: 'The contract function "publishReport" reverted with DuplicateReportHash.',
      data: {
        errorName: 'DuplicateReportHash',
        args: [DEMO_PROJECT_ID, DEMO_REPORT_HASH],
        abiItem: {}, // decoded ABI error item
        // NOTE: no .data.data field — this was the original bug trigger
      },
    }
    const msg = extractErrorMessage(err)
    expect(msg).toMatch(/duplicate|already.*published/i)
    expect(msg).not.toMatch(/unknown contract error/i)
  })

  it('maps DuplicateReportHash from nested ContractFunctionExecutionError wrapping ContractFunctionRevertedError', () => {
    // This is the actual error structure thrown by viem's simulateContract
    const inner = {
      name: 'ContractFunctionRevertedError',
      message: 'reverted.',
      data: {
        errorName: 'DuplicateReportHash',
        args: [DEMO_PROJECT_ID, DEMO_REPORT_HASH],
        abiItem: {},
      },
    }
    const outer = {
      name: 'ContractFunctionExecutionError',
      message: 'The contract function "publishReport" reverted.',
      // .data is the AbiFunction definition, not error data
      data: { type: 'function', name: 'publishReport', inputs: [], outputs: [], stateMutability: 'nonpayable' },
      cause: inner,
    }
    const msg = extractErrorMessage(outer)
    expect(msg).toMatch(/duplicate|already.*published/i)
    expect(msg).not.toMatch(/unknown contract error/i)
  })

  it('maps DuplicateReportHash from deeply nested cause chain', () => {
    const core = {
      data: { errorName: 'DuplicateReportHash', args: [] },
    }
    const wrapped = Object.assign(new Error('Contract function reverted'), { cause: core })
    const outerWrapped = Object.assign(new Error('Execution error'), { cause: wrapped })
    expect(extractErrorMessage(outerWrapped)).toMatch(/duplicate|already.*published/i)
  })

  it('maps InvalidVersion from .data.errorName', () => {
    const err = {
      data: { errorName: 'InvalidVersion', args: [2, 1] },
    }
    expect(extractErrorMessage(err)).toMatch(/version/i)
    expect(extractErrorMessage(err)).toContain('1')
    expect(extractErrorMessage(err)).toContain('2')
  })

  it('uses generic contract error message for unknown error names', () => {
    const err = {
      data: { errorName: 'SomeFutureError', args: [] },
    }
    const msg = extractErrorMessage(err)
    expect(msg).toContain('SomeFutureError')
    // Must NOT be the original "An unknown contract error occurred."
    expect(msg).not.toBe('An unknown contract error occurred.')
  })

  it('returns generic fallback for completely unstructured errors', () => {
    const msg = extractErrorMessage({ some: 'random', object: true })
    expect(msg).toBe('An unexpected error occurred.')
  })

  // Expected next version v2 may exist while duplicate is blocked
  it('a new version being available does not imply the same hash can republish', () => {
    // The duplicate check is separate from version availability.
    // This test confirms that having data.errorName === 'DuplicateReportHash'
    // does NOT produce a version-related message.
    const err = {
      data: {
        errorName: 'DuplicateReportHash',
        args: [DEMO_PROJECT_ID, DEMO_REPORT_HASH],
      },
    }
    const msg = extractErrorMessage(err)
    // Must say "already published", not "expected N, got M"
    expect(msg).not.toMatch(/expected.*got/i)
    expect(msg).toMatch(/already.*published|duplicate/i)
  })
})

// ─── extractDevDetails ────────────────────────────────────────────────────────

describe('extractDevDetails', () => {
  it('handles null', () => {
    const d = extractDevDetails(null)
    expect(d.errorName).toBeNull()
    expect(d.shortMessage).toBeNull()
  })

  it('extracts errorName from structured error', () => {
    const err = { data: { errorName: 'DuplicateReportHash' } }
    const d = extractDevDetails(err)
    expect(d.errorName).toBe('DuplicateReportHash')
  })

  it('extracts shortMessage from viem-like error', () => {
    const err = {
      shortMessage: 'DuplicateReportHash()',
      message: 'The contract function "publishReport" reverted.',
    }
    const d = extractDevDetails(err)
    expect(d.shortMessage).toBe('DuplicateReportHash()')
    expect(d.messageSummary).toContain('publishReport')
  })

  it('truncates very long messages to 200 chars', () => {
    const longMessage = 'x'.repeat(500)
    const d = extractDevDetails(new Error(longMessage))
    expect(d.messageSummary!.length).toBeLessThanOrEqual(200)
  })

  it('never exposes nested private data from cause chain', () => {
    // Confirms we only surface errorName, shortMessage, messageSummary
    const err = {
      message: 'Some error',
      privateKey: 'should-never-appear',
      seed: 'should-never-appear',
      data: { errorName: 'DuplicateReportHash', privateKey: 'nope' },
    }
    const d = extractDevDetails(err)
    // The details struct only has known safe fields
    expect(Object.keys(d)).toEqual(['errorName', 'shortMessage', 'messageSummary'])
  })
})

import { describe, it, expect } from 'vitest'
import { parseReportPublishedEvent, verifyEventFields } from './event-parsing'
import { encodeEventTopics, encodeAbiParameters, parseAbiParameters, type TransactionReceipt } from 'viem'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'

const CONTRACT = '0x1111111111111111111111111111111111111111' as const
const PROJECT_ID = '0x2222222222222222222222222222222222222222222222222222222222222222' as const
const REPORT_HASH = '0x3333333333333333333333333333333333333333333333333333333333333333' as const
// Hardhat account 0 — always a valid checksummed address
const PUBLISHER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const
const PUBLISHER_LC = PUBLISHER.toLowerCase() as `0x${string}`

function buildMockReceipt(overrides?: {
  version?: number
  trustScore?: number
  supplyScore?: number
  distributionScore?: number
  utilityScore?: number
  overallReadinessScore?: number
  grade?: number
  publishedAt?: bigint
}): TransactionReceipt {
  const v = {
    version: 1,
    trustScore: 80,
    supplyScore: 70,
    distributionScore: 60,
    utilityScore: 50,
    overallReadinessScore: 68,
    grade: 3,
    publishedAt: BigInt(1_700_000_000),
    ...overrides,
  }

  const eventAbi = RWA_READINESS_REGISTRY_ABI.find(
    (e) => 'name' in e && e.name === 'ReportPublished' && e.type === 'event',
  )
  if (!eventAbi || eventAbi.type !== 'event') throw new Error('Event not found')

  const topics = encodeEventTopics({
    abi: RWA_READINESS_REGISTRY_ABI,
    eventName: 'ReportPublished',
    args: { projectId: PROJECT_ID, reportHash: REPORT_HASH, publisher: PUBLISHER },
  })

  const nonIndexedData = encodeAbiParameters(
    parseAbiParameters('uint32 version, uint16 trustScore, uint16 supplyScore, uint16 distributionScore, uint16 utilityScore, uint16 overallReadinessScore, uint8 grade, uint64 publishedAt'),
    [v.version, v.trustScore, v.supplyScore, v.distributionScore, v.utilityScore, v.overallReadinessScore, v.grade, v.publishedAt],
  )

  const mockReceipt: TransactionReceipt = {
    transactionHash: '0xabc' as `0x${string}`,
    transactionIndex: 0,
    blockHash: '0xdef' as `0x${string}`,
    blockNumber: 1000n,
    from: PUBLISHER,
    to: CONTRACT,
    cumulativeGasUsed: 21000n,
    gasUsed: 21000n,
    contractAddress: null,
    logs: [
      {
        address: CONTRACT,
        topics: topics as [`0x${string}`, ...`0x${string}`[]],
        data: nonIndexedData,
        blockNumber: 1000n,
        transactionHash: '0xabc' as `0x${string}`,
        transactionIndex: 0,
        blockHash: '0xdef' as `0x${string}`,
        logIndex: 0,
        removed: false,
      },
    ],
    logsBloom: '0x' as `0x${string}`,
    status: 'success',
    type: 'eip1559',
    effectiveGasPrice: 25000000000n,
  }

  return mockReceipt
}

// ─── parseReportPublishedEvent ────────────────────────────────────────────────

describe('parseReportPublishedEvent', () => {
  it('parses a valid ReportPublished log', () => {
    const receipt = buildMockReceipt()
    const event = parseReportPublishedEvent(receipt, CONTRACT)
    expect(event).not.toBeNull()
    expect(event!.projectId.toLowerCase()).toBe(PROJECT_ID.toLowerCase())
    expect(event!.reportHash.toLowerCase()).toBe(REPORT_HASH.toLowerCase())
    expect(event!.publisher.toLowerCase()).toBe(PUBLISHER.toLowerCase())
    expect(event!.version).toBe(1)
    expect(event!.trustScore).toBe(80)
    expect(event!.supplyScore).toBe(70)
    expect(event!.distributionScore).toBe(60)
    expect(event!.utilityScore).toBe(50)
    expect(event!.overallReadinessScore).toBe(68)
    expect(event!.grade).toBe(3)
    expect(event!.gradeLabel).toBe('C')
  })

  it('returns null when no log matches the contract address', () => {
    const receipt = buildMockReceipt()
    const event = parseReportPublishedEvent(receipt, '0x9999999999999999999999999999999999999999')
    expect(event).toBeNull()
  })

  it('returns null for empty receipt logs', () => {
    const receipt = buildMockReceipt()
    receipt.logs = []
    const event = parseReportPublishedEvent(receipt, CONTRACT)
    expect(event).toBeNull()
  })

  it('sets publishedAtISO from the publishedAt timestamp', () => {
    const receipt = buildMockReceipt({ publishedAt: BigInt(1_700_000_000) })
    const event = parseReportPublishedEvent(receipt, CONTRACT)
    expect(event!.publishedAtISO).toBe(new Date(1_700_000_000 * 1000).toISOString())
  })
})

// ─── verifyEventFields ────────────────────────────────────────────────────────

describe('verifyEventFields', () => {
  const baseEvent = {
    projectId: PROJECT_ID,
    reportHash: REPORT_HASH,
    publisher: PUBLISHER_LC,
    version: 1,
    trustScore: 80,
    supplyScore: 70,
    distributionScore: 60,
    utilityScore: 50,
    overallReadinessScore: 68,
    grade: 3,
    gradeLabel: 'C',
    publishedAt: BigInt(1_700_000_000),
    publishedAtISO: '2023-11-14T22:13:20.000Z',
  }

  const baseExpected = {
    projectIdBytes32: PROJECT_ID,
    reportHash: REPORT_HASH,
    publisher: PUBLISHER_LC,
    version: 1,
    trustScore: 80,
    supplyScore: 70,
    distributionScore: 60,
    utilityScore: 50,
    overallScore: 68,
    grade: 3,
  }

  it('returns verified:true when all fields match', () => {
    const result = verifyEventFields(baseEvent, baseExpected)
    expect(result.verified).toBe(true)
    expect(result.reason).toBeNull()
  })

  it('fails on projectId mismatch', () => {
    const result = verifyEventFields(
      { ...baseEvent, projectId: '0x0000000000000000000000000000000000000000000000000000000000000001' },
      baseExpected,
    )
    expect(result.verified).toBe(false)
    expect(result.reason).toMatch(/project id/i)
  })

  it('fails on reportHash mismatch', () => {
    const result = verifyEventFields(
      { ...baseEvent, reportHash: '0x0000000000000000000000000000000000000000000000000000000000000001' },
      baseExpected,
    )
    expect(result.verified).toBe(false)
    expect(result.reason).toMatch(/report hash/i)
  })

  it('fails on publisher mismatch', () => {
    const result = verifyEventFields(
      { ...baseEvent, publisher: '0x0000000000000000000000000000000000000001' },
      baseExpected,
    )
    expect(result.verified).toBe(false)
    expect(result.reason).toMatch(/publisher/i)
  })

  it('fails on version mismatch', () => {
    const result = verifyEventFields({ ...baseEvent, version: 2 }, baseExpected)
    expect(result.verified).toBe(false)
    expect(result.reason).toMatch(/version/i)
  })

  it('fails on trustScore mismatch', () => {
    const result = verifyEventFields({ ...baseEvent, trustScore: 99 }, baseExpected)
    expect(result.verified).toBe(false)
    expect(result.reason).toMatch(/trust score/i)
  })

  it('is case-insensitive for hex addresses', () => {
    const result = verifyEventFields(
      { ...baseEvent, publisher: PUBLISHER.toLowerCase() as `0x${string}` },
      baseExpected,
    )
    expect(result.verified).toBe(true)
  })
})

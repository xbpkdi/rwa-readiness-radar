import { parseEventLogs, type TransactionReceipt } from 'viem'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'
import { uint8ToGrade } from '@/config/contracts'

export interface ParsedReportPublishedEvent {
  projectId: `0x${string}`
  reportHash: `0x${string}`
  publisher: `0x${string}`
  version: number
  trustScore: number
  supplyScore: number
  distributionScore: number
  utilityScore: number
  overallReadinessScore: number
  grade: number
  gradeLabel: string
  publishedAt: bigint
  publishedAtISO: string
}

export function parseReportPublishedEvent(
  receipt: TransactionReceipt,
  contractAddress: `0x${string}`,
): ParsedReportPublishedEvent | null {
  try {
    const logs = parseEventLogs({
      abi: RWA_READINESS_REGISTRY_ABI,
      eventName: 'ReportPublished',
      logs: receipt.logs,
      strict: false,
    })

    const log = logs.find(
      (l) => l.address.toLowerCase() === contractAddress.toLowerCase(),
    )

    if (!log) return null

    const a = log.args

    const publishedAt = a.publishedAt as bigint
    const version = Number(a.version)
    const grade = Number(a.grade)

    let gradeLabel = '?'
    try {
      gradeLabel = uint8ToGrade(grade)
    } catch {
      // Leave as '?'
    }

    return {
      projectId: a.projectId as `0x${string}`,
      reportHash: a.reportHash as `0x${string}`,
      publisher: a.publisher as `0x${string}`,
      version,
      trustScore: Number(a.trustScore),
      supplyScore: Number(a.supplyScore),
      distributionScore: Number(a.distributionScore),
      utilityScore: Number(a.utilityScore),
      overallReadinessScore: Number(a.overallReadinessScore),
      grade,
      gradeLabel,
      publishedAt,
      publishedAtISO: new Date(Number(publishedAt) * 1000).toISOString(),
    }
  } catch {
    return null
  }
}

export interface EventVerificationResult {
  verified: boolean
  reason: string | null
}

export function verifyEventFields(
  event: ParsedReportPublishedEvent,
  expected: {
    projectIdBytes32: `0x${string}`
    reportHash: `0x${string}`
    publisher: `0x${string}`
    version: number
    trustScore: number
    supplyScore: number
    distributionScore: number
    utilityScore: number
    overallScore: number
    grade: number
  },
): EventVerificationResult {
  if (event.projectId.toLowerCase() !== expected.projectIdBytes32.toLowerCase()) {
    return { verified: false, reason: 'Project ID mismatch in event' }
  }
  if (event.reportHash.toLowerCase() !== expected.reportHash.toLowerCase()) {
    return { verified: false, reason: 'Report hash mismatch in event' }
  }
  if (event.publisher.toLowerCase() !== expected.publisher.toLowerCase()) {
    return { verified: false, reason: 'Publisher address mismatch in event' }
  }
  if (event.version !== expected.version) {
    return { verified: false, reason: `Version mismatch: event has ${event.version}, expected ${expected.version}` }
  }
  if (event.trustScore !== expected.trustScore) {
    return { verified: false, reason: `Trust score mismatch: event ${event.trustScore} vs expected ${expected.trustScore}` }
  }
  if (event.supplyScore !== expected.supplyScore) {
    return { verified: false, reason: `Supply score mismatch` }
  }
  if (event.distributionScore !== expected.distributionScore) {
    return { verified: false, reason: `Distribution score mismatch` }
  }
  if (event.utilityScore !== expected.utilityScore) {
    return { verified: false, reason: `Utility score mismatch` }
  }
  if (event.overallReadinessScore !== expected.overallScore) {
    return { verified: false, reason: `Overall score mismatch` }
  }
  if (event.grade !== expected.grade) {
    return { verified: false, reason: `Grade mismatch` }
  }
  return { verified: true, reason: null }
}

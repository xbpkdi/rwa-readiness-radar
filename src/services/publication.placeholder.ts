import type { CanonicalReport, PublicationReceipt, PublicationStatus } from '@/domain/types'
import { computeReportHash } from './report-hash'
import { deriveProjectId } from '@/utils/contract-encoding'
import { gradeToUint8 } from '@/config/contracts'

export interface PublicationPayload {
  report: CanonicalReport
  reportHash: `0x${string}`
}

export interface PublicationProgressEvent {
  status: PublicationStatus
  message: string
  receipt?: PublicationReceipt
  error?: string
}

export type PublicationProgressCallback = (event: PublicationProgressEvent) => void

export interface PublicationService {
  publish(
    payload: PublicationPayload,
    onProgress: PublicationProgressCallback,
  ): Promise<PublicationReceipt>
}

const DEMO_PUBLISHER: `0x${string}` = '0x7A3F5dA2C8b9E4F1A0c6B2e5D8c1F9a4E7b3D2f5'
const DEMO_CHAIN_ID = 43113

function mockTxHash(seed: string): `0x${string}` {
  let h = 0
  for (const c of seed) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  const base = Math.abs(h).toString(16).padStart(8, '0').repeat(8).slice(0, 64)
  return `0x${base}`
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export const publicationPlaceholder: PublicationService = {
  async publish(payload, onProgress) {
    onProgress({ status: 'validating', message: 'Validating report payload…' })
    await delay(800)

    onProgress({ status: 'awaiting-wallet', message: 'Demo mode — skipping wallet…' })
    await delay(600)

    onProgress({ status: 'switching-network', message: 'Demo mode — skipping network check…' })
    await delay(600)

    onProgress({ status: 'hashing', message: 'Computing keccak256 report hash…' })
    await delay(700)

    onProgress({ status: 'submitting', message: 'Demo mode — simulating transaction…' })
    await delay(1000)

    onProgress({ status: 'pending', message: 'Demo mode — simulating confirmation…' })
    await delay(1200)

    const reportHash = computeReportHash(payload.report)
    const txHash = mockTxHash(`${payload.report.projectId}:${payload.report.version}`)
    const projectIdBytes32 = deriveProjectId(payload.report.projectId)

    const scoring = payload.report.scoring
    const grade = gradeToUint8(scoring.grade)

    const receipt: PublicationReceipt = {
      mode: 'demo',
      transactionHash: txHash,
      reportHash,
      projectIdBytes32,
      publisher: DEMO_PUBLISHER,
      chainId: DEMO_CHAIN_ID,
      contractAddress: null,
      blockNumber: 8_432_100 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      version: payload.report.version,
      trustScore: Math.round(scoring.trustScore),
      supplyScore: Math.round(scoring.supplyScore),
      distributionScore: Math.round(scoring.distributionScore),
      utilityScore: Math.round(scoring.utilityScore),
      overallReadinessScore: Math.round(scoring.overallScore),
      grade,
      status: 'confirmed',
      explorerUrl: null,
      eventVerified: false,
    }

    onProgress({ status: 'confirmed', message: 'Demo publication complete.', receipt })
    return receipt
  },
}

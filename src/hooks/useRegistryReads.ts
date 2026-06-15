import { useReadContract, useReadContracts } from 'wagmi'
import { IS_CONTRACT_DEPLOYED, REGISTRY_ADDRESS, FUJI_CHAIN_ID } from '@/config/contracts'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'
import { deriveProjectId } from '@/utils/contract-encoding'
import type { OnChainSnapshot } from '@/services/report-verification'

const MAX_VERSION_HISTORY = 20

function normalizeSnapshot(raw: unknown): OnChainSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.version !== 'number' && typeof r.version !== 'bigint') return null

  return {
    projectId: r.projectId as `0x${string}`,
    reportHash: r.reportHash as `0x${string}`,
    trustScore: Number(r.trustScore),
    supplyScore: Number(r.supplyScore),
    distributionScore: Number(r.distributionScore),
    utilityScore: Number(r.utilityScore),
    overallReadinessScore: Number(r.overallReadinessScore),
    grade: Number(r.grade),
    version: Number(r.version),
    publisher: r.publisher as `0x${string}`,
    publishedAt: BigInt(r.publishedAt as string | number | bigint),
  }
}

export function useLatestVersion(projectSlug: string) {
  const projectId = REGISTRY_ADDRESS && projectSlug.trim() ? deriveProjectId(projectSlug) : null

  const result = useReadContract({
    address: REGISTRY_ADDRESS ?? undefined,
    abi: RWA_READINESS_REGISTRY_ABI,
    functionName: 'latestVersion',
    args: projectId ? [projectId] : undefined,
    chainId: FUJI_CHAIN_ID,
    query: {
      enabled: IS_CONTRACT_DEPLOYED && !!projectId,
      staleTime: 30_000,
    },
  })

  return {
    version: result.data !== undefined ? Number(result.data) : null,
    isLoading: result.isLoading,
    error: result.error,
  }
}

export function useLatestSnapshot(projectSlug: string) {
  const projectId = REGISTRY_ADDRESS && projectSlug.trim() ? deriveProjectId(projectSlug) : null

  const result = useReadContract({
    address: REGISTRY_ADDRESS ?? undefined,
    abi: RWA_READINESS_REGISTRY_ABI,
    functionName: 'getLatestSnapshot',
    args: projectId ? [projectId] : undefined,
    chainId: FUJI_CHAIN_ID,
    query: {
      enabled: IS_CONTRACT_DEPLOYED && !!projectId,
      staleTime: 30_000,
      retry: false,
    },
  })

  return {
    snapshot: result.data ? normalizeSnapshot(result.data) : null,
    isLoading: result.isLoading,
    error: result.error,
  }
}

/**
 * Reads isReportHashUsed(projectId, reportHash) from the registry.
 * Returns true if the hash has already been published for this project.
 * Used for pre-publication duplicate detection — blocks the wallet prompt when possible.
 */
export function useIsReportHashUsed(
  projectSlug: string,
  reportHash: `0x${string}` | null,
) {
  const projectId =
    REGISTRY_ADDRESS && projectSlug.trim() ? deriveProjectId(projectSlug) : null

  const result = useReadContract({
    address: REGISTRY_ADDRESS ?? undefined,
    abi: RWA_READINESS_REGISTRY_ABI,
    functionName: 'isReportHashUsed',
    args: projectId && reportHash ? [projectId, reportHash] : undefined,
    chainId: FUJI_CHAIN_ID,
    query: {
      enabled: IS_CONTRACT_DEPLOYED && !!projectId && !!reportHash,
      staleTime: 15_000,
      retry: false,
    },
  })

  return {
    isUsed: result.data === true,
    isLoading: result.isLoading,
    error: result.error,
  }
}

export function useVersionHistory(projectSlug: string, latestVersion: number | null) {
  const projectId = REGISTRY_ADDRESS && projectSlug.trim() ? deriveProjectId(projectSlug) : null
  const count = Math.min(latestVersion ?? 0, MAX_VERSION_HISTORY)

  const contracts =
    IS_CONTRACT_DEPLOYED && projectId && count > 0
      ? Array.from({ length: count }, (_, i) => ({
          address: REGISTRY_ADDRESS as `0x${string}`,
          abi: RWA_READINESS_REGISTRY_ABI,
          functionName: 'getSnapshot' as const,
          args: [projectId, i + 1] as const,
          chainId: FUJI_CHAIN_ID,
        }))
      : []

  const result = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      staleTime: 60_000,
    },
  })

  const snapshots: OnChainSnapshot[] = []
  if (result.data) {
    for (const item of result.data) {
      if (item.status === 'success' && item.result) {
        const snap = normalizeSnapshot(item.result)
        if (snap) snapshots.push(snap)
      }
    }
  }

  return {
    snapshots: snapshots.sort((a, b) => b.version - a.version),
    isLoading: result.isLoading,
    error: result.error,
  }
}

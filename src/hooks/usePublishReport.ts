import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi'
import { parseEventLogs } from 'viem'
import type { CanonicalReport, PublicationStatus, PublicationReceipt } from '@/domain/types'
import {
  IS_CONTRACT_DEPLOYED,
  REGISTRY_ADDRESS,
  FUJI_CHAIN_ID,
  explorerTxUrl,
  gradeToUint8,
} from '@/config/contracts'
import { RWA_READINESS_REGISTRY_ABI } from '@/contracts/RWAReadinessRegistry.abi'
import { toPublishReportArgs } from '@/utils/contract-encoding'
import { computeReportHash } from '@/services/report-hash'
import { extractErrorMessage, extractErrorCode } from '@/utils/contract-errors'
import { verifyEventFields } from '@/utils/event-parsing'
import { publicationPlaceholder } from '@/services/publication.placeholder'

export interface PublishReportHook {
  status: PublicationStatus
  message: string
  receipt: PublicationReceipt | null
  error: string | null
  /** Solidity custom error name when status === 'failed', e.g. 'DuplicateReportHash' */
  errorCode: string | null
  isDemo: boolean
  publish: (report: CanonicalReport, expectedHash: `0x${string}`) => Promise<void>
  reset: () => void
}

export function usePublishReport(): PublishReportHook {
  const [status, setStatus] = useState<PublicationStatus>('idle')
  const [message, setMessage] = useState('')
  const [receipt, setReceipt] = useState<PublicationReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId: FUJI_CHAIN_ID })
  const { switchChainAsync } = useSwitchChain()

  const isDemo = !IS_CONTRACT_DEPLOYED

  function progress(s: PublicationStatus, msg: string) {
    setStatus(s)
    setMessage(msg)
  }

  function fail(msg: string, code?: string | null) {
    setStatus('failed')
    setMessage('')
    setError(msg)
    setErrorCode(code ?? null)
  }

  const publish = useCallback(
    async (report: CanonicalReport, expectedHash: `0x${string}`) => {
      setError(null)
      setReceipt(null)
      setErrorCode(null)

      if (isDemo) {
        await publicationPlaceholder.publish({ report, reportHash: expectedHash }, (evt) => {
          setStatus(evt.status)
          setMessage(evt.message)
          if (evt.receipt) setReceipt(evt.receipt)
        })
        return
      }

      // ── Real Fuji publication flow ──────────────────────────────────────────

      progress('validating', 'Validating report payload…')
      await tick()

      const liveHash = computeReportHash(report)
      if (liveHash !== expectedHash) {
        fail('Report hash mismatch — the draft was modified after Submit. Return to Submit.')
        return
      }
      if (!REGISTRY_ADDRESS) {
        fail('Registry contract address is not configured. Set VITE_RWA_REGISTRY_ADDRESS.')
        return
      }

      progress('awaiting-wallet', 'Checking wallet connection…')
      await tick()

      if (!account.isConnected || !account.address) {
        fail('No wallet connected. Connect a wallet using the button in the header.')
        return
      }
      if (!walletClient) {
        fail('Wallet client unavailable. Reconnect your wallet and try again.')
        return
      }

      progress('switching-network', 'Checking Avalanche Fuji network…')
      await tick()

      if (account.chainId !== FUJI_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: FUJI_CHAIN_ID })
        } catch (e) {
          fail(extractErrorMessage(e), extractErrorCode(e))
          return
        }
      }

      progress('hashing', 'Preparing report arguments…')
      await tick()

      let args: ReturnType<typeof toPublishReportArgs>
      try {
        args = toPublishReportArgs(report, liveHash)
      } catch (e) {
        fail(extractErrorMessage(e), extractErrorCode(e))
        return
      }

      const [projectIdBytes32, rHash, tScore, sScore, dScore, uScore, oScore, gradeN, ver] = args

      // ── Preflight duplicate-hash check ────────────────────────────────────
      // isReportHashUsed is a view function — no gas, no wallet prompt.
      // If the hash is already registered, we block here before MetaMask opens.
      if (!publicClient) {
        fail('Public client unavailable. Check your RPC configuration.')
        return
      }

      try {
        const isUsed = await publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: RWA_READINESS_REGISTRY_ABI,
          functionName: 'isReportHashUsed',
          args: [projectIdBytes32, rHash],
        })

        if (import.meta.env.DEV) {
          console.debug('[publish] preflight duplicate check', {
            projectId: report.projectId,
            reportHash: liveHash,
            isUsed,
          })
        }

        if (isUsed) {
          fail(
            'This exact report has already been published for this project.',
            'DuplicateReportHash',
          )
          return
        }
      } catch (prefErr) {
        // Read failed — continue to simulateContract which will catch duplicates too
        if (import.meta.env.DEV) {
          console.warn('[publish] preflight isReportHashUsed read failed, proceeding to simulate', prefErr)
        }
      }

      progress('submitting', 'Requesting transaction approval in wallet…')

      let txHash: `0x${string}`
      try {
        await publicClient.simulateContract({
          address: REGISTRY_ADDRESS,
          abi: RWA_READINESS_REGISTRY_ABI,
          functionName: 'publishReport',
          args: [projectIdBytes32, rHash, tScore, sScore, dScore, uScore, oScore, gradeN, ver],
          account: account.address,
        })

        txHash = await walletClient.writeContract({
          address: REGISTRY_ADDRESS,
          abi: RWA_READINESS_REGISTRY_ABI,
          functionName: 'publishReport',
          args: [projectIdBytes32, rHash, tScore, sScore, dScore, uScore, oScore, gradeN, ver],
          chain: null,
        })
      } catch (e) {
        const code = extractErrorCode(e)
        if (import.meta.env.DEV) {
          console.error('[publish] simulate/write error', { code, err: e })
        }
        fail(extractErrorMessage(e), code)
        return
      }

      progress('pending', 'Transaction submitted — waiting for Avalanche confirmation…')

      let txReceipt
      try {
        txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      } catch (e) {
        fail(extractErrorMessage(e), extractErrorCode(e))
        return
      }

      if (txReceipt.status !== 'success') {
        fail('Transaction reverted on-chain. Check the contract state and try again.')
        return
      }

      const logs = parseEventLogs({
        abi: RWA_READINESS_REGISTRY_ABI,
        eventName: 'ReportPublished',
        logs: txReceipt.logs,
        strict: false,
      })

      const eventLog = logs.find(
        (l) => l.address.toLowerCase() === REGISTRY_ADDRESS!.toLowerCase(),
      )

      const scoring = report.scoring
      const gradeNum = gradeToUint8(scoring.grade)

      let eventVerified = false
      if (eventLog) {
        const check = verifyEventFields(
          {
            projectId: eventLog.args.projectId as `0x${string}`,
            reportHash: eventLog.args.reportHash as `0x${string}`,
            publisher: eventLog.args.publisher as `0x${string}`,
            version: Number(eventLog.args.version),
            trustScore: Number(eventLog.args.trustScore),
            supplyScore: Number(eventLog.args.supplyScore),
            distributionScore: Number(eventLog.args.distributionScore),
            utilityScore: Number(eventLog.args.utilityScore),
            overallReadinessScore: Number(eventLog.args.overallReadinessScore),
            grade: Number(eventLog.args.grade),
            gradeLabel: '',
            publishedAt: eventLog.args.publishedAt as bigint,
            publishedAtISO: '',
          },
          {
            projectIdBytes32,
            reportHash: liveHash,
            publisher: account.address!,
            version: report.version,
            trustScore: Math.round(scoring.trustScore),
            supplyScore: Math.round(scoring.supplyScore),
            distributionScore: Math.round(scoring.distributionScore),
            utilityScore: Math.round(scoring.utilityScore),
            overallScore: Math.round(scoring.overallScore),
            grade: gradeNum,
          },
        )
        eventVerified = check.verified
      }

      const publishedAt = eventLog
        ? new Date(Number(eventLog.args.publishedAt as bigint) * 1000).toISOString()
        : new Date().toISOString()

      const finalReceipt: PublicationReceipt = {
        mode: 'fuji',
        transactionHash: txHash,
        reportHash: liveHash,
        projectIdBytes32,
        publisher: account.address!,
        chainId: FUJI_CHAIN_ID,
        contractAddress: REGISTRY_ADDRESS,
        blockNumber: Number(txReceipt.blockNumber),
        timestamp: publishedAt,
        version: report.version,
        trustScore: Math.round(scoring.trustScore),
        supplyScore: Math.round(scoring.supplyScore),
        distributionScore: Math.round(scoring.distributionScore),
        utilityScore: Math.round(scoring.utilityScore),
        overallReadinessScore: Math.round(scoring.overallScore),
        grade: gradeNum,
        status: 'confirmed',
        explorerUrl: explorerTxUrl(txHash),
        eventVerified,
      }

      if (import.meta.env.DEV) {
        console.debug('[publish] confirmed', {
          projectId: report.projectId,
          version: report.version,
          reportHash: liveHash,
          txHash,
          eventVerified,
        })
      }

      setReceipt(finalReceipt)
      progress('confirmed', 'Report anchored on Avalanche Fuji.')
    },
    [account, walletClient, publicClient, switchChainAsync, isDemo],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setMessage('')
    setReceipt(null)
    setError(null)
    setErrorCode(null)
  }, [])

  return { status, message, receipt, error, errorCode, isDemo, publish, reset }
}

function tick() {
  return new Promise<void>((r) => setTimeout(r, 0))
}

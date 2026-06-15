import { useSwitchChain } from 'wagmi'
import { Network } from 'lucide-react'
import { useWalletConnection } from '@/hooks/useWalletConnection'
import { FUJI_CHAIN_ID } from '@/config/contracts'

export function NetworkBadge() {
  const { isConnected, isOnFuji, chainId } = useWalletConnection()
  const { switchChainAsync } = useSwitchChain()

  if (!isConnected) return null

  if (isOnFuji) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/25">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
        Avalanche Fuji
      </div>
    )
  }

  return (
    <button
      onClick={() => switchChainAsync({ chainId: FUJI_CHAIN_ID })}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/25 hover:bg-[var(--warning)]/20 transition-colors cursor-pointer"
      aria-label="Switch to Avalanche Fuji"
      title={`Current chain: ${chainId ?? 'unknown'} — click to switch to Fuji (43113)`}
    >
      <Network className="h-3 w-3" aria-hidden="true" />
      Switch to Fuji
    </button>
  )
}

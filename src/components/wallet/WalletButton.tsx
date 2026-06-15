import { useState } from 'react'
import { Wallet, LogOut, Copy, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useWalletConnection } from '@/hooks/useWalletConnection'

interface WalletButtonProps {
  compact?: boolean
  appearance?: 'default' | 'shell'
}

const shellControlClass =
  'flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium bg-[var(--surface)]/80 border border-white/10 shadow-[inset_0_1px_0_oklch(1_0_0_/_5%)] transition-colors'

export function WalletButton({ compact = false, appearance = 'default' }: WalletButtonProps) {
  const isShell = appearance === 'shell'
  const baseClass = isShell
    ? `${shellControlClass} hover:bg-[var(--surface-elevated)] hover:border-white/14 cursor-pointer`
    : 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium glass hover:bg-white/10 transition-colors border border-white/10 cursor-pointer'
  const disabledClass = isShell
    ? `${shellControlClass} text-[var(--muted-fg)] cursor-not-allowed`
    : 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium glass border border-white/10 text-[var(--muted-fg)] cursor-not-allowed'
  const { address, isConnected, isConnecting, isOnFuji, shortAddress, connect, disconnect } =
    useWalletConnection()
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  async function copyAddress() {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isConnecting) {
    return (
      <button
        disabled
        className={disabledClass}
        aria-label="Connecting wallet"
      >
        <span className="h-2 w-2 rounded-full bg-[var(--azure)] animate-pulse" aria-hidden="true" />
        {!compact && 'Connecting…'}
      </button>
    )
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={connect}
        className={baseClass}
        aria-label="Connect wallet"
      >
        <Wallet className="h-3.5 w-3.5 text-[var(--azure)]" aria-hidden="true" />
        {!compact && 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className={baseClass}
        aria-label={`Connected: ${address}`}
        aria-expanded={showMenu}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ring-2 ring-[var(--success)]/25 ${isOnFuji ? 'bg-[var(--success)]' : 'bg-[var(--warning)] animate-pulse'}`}
          aria-label={isOnFuji ? 'On Avalanche Fuji' : 'Wrong network'}
        />
        <span className="font-mono text-[12px] tracking-tight">{shortAddress}</span>
        {!isOnFuji && (
          <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)]" aria-label="Wrong network" />
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] glass-strong rounded-xl border border-white/10 shadow-xl p-2">
            <div className="px-3 py-2 mb-1">
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-0.5">
                Connected wallet
              </div>
              <div className="font-mono text-xs truncate">{address}</div>
              {!isOnFuji && (
                <div className="mt-1 text-[10px] text-[var(--warning)] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Not on Fuji (expected 43113)
                </div>
              )}
            </div>
            <div className="border-t border-white/8 pt-1 grid gap-0.5">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/8 transition-colors w-full text-left"
              >
                {copied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied!' : 'Copy address'}
              </button>
              <button
                onClick={() => { disconnect(); setShowMenu(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--avax)] hover:bg-[var(--avax)]/10 transition-colors w-full text-left"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import { useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi'
import { FUJI_CHAIN_ID } from '@/config/contracts'

export interface WalletConnectionState {
  address: `0x${string}` | undefined
  chainId: number | undefined
  isConnected: boolean
  isConnecting: boolean
  isOnFuji: boolean
  shortAddress: string | null
  connect: () => void
  disconnect: () => void
}

export function useWalletConnection(): WalletConnectionState {
  const account = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  function connectWallet() {
    const injectedConnector = connectors.find((c) => c.id === 'injected') ?? connectors[0]
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  const shortAddress = account.address
    ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
    : null

  return {
    address: account.address,
    chainId: account.chainId,
    isConnected: account.isConnected,
    isConnecting: isPending || account.isConnecting,
    isOnFuji: account.chainId === FUJI_CHAIN_ID,
    shortAddress,
    connect: connectWallet,
    disconnect,
  }
}

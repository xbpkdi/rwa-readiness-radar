import { createConfig, http, injected } from 'wagmi'
import { avalancheFuji } from 'viem/chains'
import { FUJI_PUBLIC_RPC } from '@/config/contracts'

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors: [injected()],
  transports: {
    [avalancheFuji.id]: http(FUJI_PUBLIC_RPC),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}

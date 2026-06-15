import { WalletButton } from '@/components/wallet/WalletButton'

interface WalletStatusProps {
  compact?: boolean
}

export function WalletStatus({ compact = false }: WalletStatusProps) {
  return (
    <div className="flex items-center justify-end min-w-0">
      <WalletButton compact={compact} appearance="shell" />
    </div>
  )
}
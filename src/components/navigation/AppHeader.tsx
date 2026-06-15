import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { AppBrand } from './AppBrand'
import { DesktopNavigation } from './DesktopNavigation'
import { MobileNavigation } from './MobileNavigation'
import { WalletStatus } from './WalletStatus'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <header className="sticky top-0 z-50 pt-3 pb-2">
      <motion.div
        className="shell-container"
        initial={reducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
      >
        <div className="shell-header-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-[3.25rem] px-3 sm:px-4">
            <div className="min-w-0 justify-self-start">
              <AppBrand />
            </div>

            <DesktopNavigation />

            <div className="flex items-center justify-end gap-2 min-w-0 justify-self-end">
              <div className="hidden md:flex">
                <WalletStatus compact />
              </div>
              <button
                type="button"
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-[var(--foreground)] transition-colors hover:bg-white/8"
                onClick={() => setMobileOpen((value) => !value)}
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation-panel"
              >
                {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <MobileNavigation open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </div>
      </motion.div>
    </header>
  )
}
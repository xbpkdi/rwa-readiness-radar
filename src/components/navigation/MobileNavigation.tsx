import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from './nav-config'
import { AppBrand } from './AppBrand'
import { WalletStatus } from './WalletStatus'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MobileNavigationProps {
  open: boolean
  onClose: () => void
}

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-navigation-panel"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          className="lg:hidden border-t border-white/8"
        >
          <div className="shell-container py-4">
            <div className="rounded-xl border border-white/10 bg-[var(--surface)]/90 p-4 shadow-[0_12px_40px_-16px_oklch(0_0_0_/_70%)]">
              <div className="mb-4 pb-4 border-b border-white/8">
                <AppBrand />
              </div>
              <nav className="grid gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--surface-elevated)] text-[var(--foreground)] border border-white/10'
                          : 'text-[var(--muted-fg)] hover:bg-white/5 hover:text-[var(--foreground)]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-white/8">
                <WalletStatus />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
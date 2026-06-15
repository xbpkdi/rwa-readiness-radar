import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_LINKS } from './nav-config'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function DesktopNavigation() {
  const reducedMotion = useReducedMotion()

  return (
    <nav
      className="hidden lg:flex justify-center col-start-2 row-start-1"
      aria-label="Main navigation"
    >
      <div className="shell-nav-rail">
        {NAV_LINKS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative isolate px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--foreground)]'
                  : 'text-[var(--muted-fg)] hover:text-[var(--foreground)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="shell-nav-active"
                    className="absolute inset-0 rounded-md bg-[var(--surface-elevated)] border border-white/12 shadow-[inset_0_1px_0_oklch(1_0_0_/_8%)]"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }
                    }
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
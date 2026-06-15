import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/navigation/AppHeader'
import { AppFooter } from '@/components/navigation/AppFooter'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" aria-hidden="true" />
      <AppHeader />
      <main id="main-content" className="flex-1 relative">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
      <AppFooter />
    </div>
  )
}

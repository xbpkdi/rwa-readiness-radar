import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { Landing } from '@/pages/Landing'
import { Assess } from '@/pages/Assess'
import { QuickScan } from '@/pages/QuickScan'
import { Explore } from '@/pages/Explore'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Submit } from '@/pages/Submit'
import { Publish } from '@/pages/Publish'
import { Methodology } from '@/pages/Methodology'
import { Architecture } from '@/pages/Architecture'

const router = createBrowserRouter([
  {
    element: <AppShell><Landing /></AppShell>,
    path: '/',
  },
  {
    element: <AppShell><Assess /></AppShell>,
    path: '/assess',
  },
  {
    element: <AppShell><QuickScan /></AppShell>,
    path: '/quick-scan',
  },
  {
    element: <AppShell><Explore /></AppShell>,
    path: '/explore',
  },
  {
    element: <AppShell><ProjectDetail /></AppShell>,
    path: '/projects/:projectId',
  },
  {
    element: <AppShell><Submit /></AppShell>,
    path: '/submit',
  },
  {
    element: <AppShell><Publish /></AppShell>,
    path: '/publish',
  },
  {
    element: <AppShell><Methodology /></AppShell>,
    path: '/methodology',
  },
  {
    element: <AppShell><Architecture /></AppShell>,
    path: '/architecture',
  },
  {
    element: (
      <AppShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl font-bold mb-4">404</h1>
          <p className="text-[var(--muted-fg)] mb-6">Page not found.</p>
          <a href="/" className="text-[var(--azure)] hover:underline">Return home</a>
        </div>
      </AppShell>
    ),
    path: '*',
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

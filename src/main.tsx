import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { Web3Provider } from '@/providers/Web3Provider'
import { ReportDraftProvider } from '@/context/ReportDraftContext'
import { AppRouter } from '@/app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <ReportDraftProvider>
        <AppRouter />
      </ReportDraftProvider>
    </Web3Provider>
  </StrictMode>,
)

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { CanonicalReport } from '@/domain/types'

const DRAFT_KEY = 'rwa-report-draft:v3'

interface StoredDraft {
  draft: Partial<CanonicalReport>
  reportHash: `0x${string}` | null
}

function saveDraft(stored: StoredDraft | null): void {
  try {
    if (stored === null) {
      sessionStorage.removeItem(DRAFT_KEY)
    } else {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(stored))
    }
  } catch {
    // Ignore quota / private-mode errors
  }
}

function loadDraft(): StoredDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const p = parsed as Record<string, unknown>
    if (typeof p.draft !== 'object' || p.draft === null) return null
    if (typeof (p.draft as Record<string, unknown>).projectId !== 'string') return null
    return {
      draft: p.draft as Partial<CanonicalReport>,
      reportHash: (typeof p.reportHash === 'string' ? p.reportHash : null) as `0x${string}` | null,
    }
  } catch {
    return null
  }
}

export interface ReportDraftContextValue {
  draft: Partial<CanonicalReport> | null
  reportHash: `0x${string}` | null
  setDraft: (draft: Partial<CanonicalReport> | null, reportHash?: `0x${string}` | null) => void
  clearDraft: () => void
}

export const ReportDraftContext = createContext<ReportDraftContextValue | null>(null)

export function ReportDraftProvider({ children }: { children: ReactNode }) {
  const initial = loadDraft()
  const [draft, setDraftState] = useState<Partial<CanonicalReport> | null>(initial?.draft ?? null)
  const [reportHash, setReportHashState] = useState<`0x${string}` | null>(initial?.reportHash ?? null)

  const setDraft = useCallback(
    (next: Partial<CanonicalReport> | null, hash: `0x${string}` | null = null) => {
      if (next === null) {
        saveDraft(null)
        setDraftState(null)
        setReportHashState(null)
      } else {
        const stored: StoredDraft = { draft: next, reportHash: hash }
        saveDraft(stored)
        setDraftState(next)
        setReportHashState(hash)
      }
    },
    [],
  )

  const clearDraft = useCallback(() => {
    saveDraft(null)
    setDraftState(null)
    setReportHashState(null)
  }, [])

  return (
    <ReportDraftContext.Provider value={{ draft, reportHash, setDraft, clearDraft }}>
      {children}
    </ReportDraftContext.Provider>
  )
}

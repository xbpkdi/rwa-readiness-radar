import { useContext } from 'react'
import { ReportDraftContext } from './ReportDraftContext'

export function useReportDraft() {
  const ctx = useContext(ReportDraftContext)
  if (!ctx) throw new Error('useReportDraft must be used inside ReportDraftProvider')
  return ctx
}

'use client'

import { useEffect, useState } from 'react'
import type { TaxReportResponse } from '@/types/tax-report'

interface TaxReportState {
  report: TaxReportResponse | null
  loading: boolean
  error: string | null
}

export function useTaxReport(year: number, month: number | null): TaxReportState {
  const [state, setState] = useState<TaxReportState>({ report: null, loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const params = new URLSearchParams({ year: String(year) })
    if (month !== null) params.set('month', String(month))

    fetch(`/api/tax-reports?${params}`, { signal: controller.signal })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || '세금신고 데이터 조회 실패')
        setState({ report: result.data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
      })

    return () => controller.abort()
  }, [year, month])

  return state
}

'use client'

import { useMemo, useState } from 'react'
import { useTaxReport } from '@/hooks/use-tax-report'
import { TaxReportFilters } from './TaxReportFilters'
import { TaxReportTable } from './TaxReportTable'

const CURRENT_YEAR = new Date().getFullYear()

export function TaxReportList() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState<number | null>(null)
  const [searchName, setSearchName] = useState('')
  const { report, loading, error } = useTaxReport(year, month)

  const years = useMemo(() => {
    const available = new Set(report?.years ?? [])
    available.add(year)
    return [...available].sort((a, b) => b - a)
  }, [report?.years, year])

  const rows = useMemo(() => {
    const keyword = searchName.trim()
    const all = report?.rows ?? []
    return keyword ? all.filter((row) => row.name.includes(keyword)) : all
  }, [report?.rows, searchName])

  const handleReset = () => {
    setMonth(null)
    setSearchName('')
  }

  const periodLabel = month === null ? `${year}년 전체` : `${year}년 ${month}월`

  return (
    <div className="space-y-4">
      <TaxReportFilters
        years={years}
        year={year}
        month={month}
        searchName={searchName}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onNameChange={setSearchName}
        onReset={handleReset}
      />

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {periodLabel} · 총 {rows.length}명
      </div>

      {loading && !report ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">조건에 맞는 지급 내역이 없습니다</div>
      ) : (
        <TaxReportTable rows={rows} />
      )}
    </div>
  )
}

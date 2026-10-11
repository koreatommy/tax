'use client'

import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface TaxReportFiltersProps {
  years: number[]
  year: number
  month: number | null
  searchName: string
  onYearChange: (year: number) => void
  onMonthChange: (month: number | null) => void
  onNameChange: (name: string) => void
  onReset: () => void
}

export function TaxReportFilters({
  years,
  year,
  month,
  searchName,
  onYearChange,
  onMonthChange,
  onNameChange,
  onReset,
}: TaxReportFiltersProps) {
  const hasActiveFilters = month !== null || searchName !== ''

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">연도:</span>
        <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">월:</span>
        <Select
          value={month === null ? 'all' : String(month)}
          onValueChange={(value) => onMonthChange(value === 'all' ? null : Number(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">이름:</span>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="이름으로 검색..."
            value={searchName}
            onChange={(e) => onNameChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="whitespace-nowrap">
          <X className="h-4 w-4 mr-1" />
          초기화
        </Button>
      )}
    </div>
  )
}

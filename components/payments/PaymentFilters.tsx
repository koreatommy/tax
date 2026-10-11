'use client'

import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaymentFiltersProps {
  monthOptions: { value: string; label: string }[]
  selectedMonth: string
  searchName: string
  searchReason: string
  onMonthChange: (value: string) => void
  onNameChange: (value: string) => void
  onReasonChange: (value: string) => void
  onReset: () => void
}

export function PaymentFilters({
  monthOptions,
  selectedMonth,
  searchName,
  searchReason,
  onMonthChange,
  onNameChange,
  onReasonChange,
  onReset,
}: PaymentFiltersProps) {
  const hasActiveFilters = selectedMonth !== 'all' || searchName !== '' || searchReason !== ''

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">지급월:</span>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SearchField label="대상자:" placeholder="이름으로 검색..." value={searchName} onChange={onNameChange} />
      <SearchField label="지급사유:" placeholder="지급사유 검색..." value={searchReason} onChange={onReasonChange} />

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="whitespace-nowrap">
          <X className="h-4 w-4 mr-1" />
          초기화
        </Button>
      )}
    </div>
  )
}

interface SearchFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

function SearchField({ label, placeholder, value, onChange }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{label}</span>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}

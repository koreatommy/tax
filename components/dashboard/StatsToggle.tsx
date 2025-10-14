'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, TrendingUp, BarChart3, LineChart } from 'lucide-react'

export type ViewType = 'daily' | 'monthly'
export type ChartType = 'bar' | 'line' | 'area'

interface StatsToggleProps {
  viewType: ViewType
  onViewTypeChange: (type: ViewType) => void
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
  period: number
  onPeriodChange: (period: number) => void
}

/**
 * 통계 차트 설정 토글 컴포넌트
 */
export function StatsToggle({
  viewType,
  onViewTypeChange,
  chartType,
  onChartTypeChange,
  period,
  onPeriodChange,
}: StatsToggleProps) {
  // 일별/월별에 따른 기간 옵션
  const periodOptions =
    viewType === 'daily'
      ? [
          { value: 7, label: '최근 7일' },
          { value: 14, label: '최근 14일' },
          { value: 30, label: '최근 30일' },
        ]
      : [
          { value: 3, label: '최근 3개월' },
          { value: 6, label: '최근 6개월' },
          { value: 12, label: '최근 12개월' },
        ]

  // 차트 타입 옵션 (일별은 area/line, 월별은 bar/line)
  const chartTypeOptions =
    viewType === 'daily'
      ? [
          { value: 'area' as ChartType, label: '영역형', icon: TrendingUp },
          { value: 'line' as ChartType, label: '선형', icon: LineChart },
        ]
      : [
          { value: 'bar' as ChartType, label: '막대형', icon: BarChart3 },
          { value: 'line' as ChartType, label: '선형', icon: LineChart },
        ]

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
      {/* 일별/월별 토글 */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">기간:</span>
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <Button
            variant={viewType === 'daily' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewTypeChange('daily')}
            className={viewType === 'daily' ? 'shadow-sm' : ''}
          >
            일별
          </Button>
          <Button
            variant={viewType === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewTypeChange('monthly')}
            className={viewType === 'monthly' ? 'shadow-sm' : ''}
          >
            월별
          </Button>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">범위:</span>
        <Select value={period.toString()} onValueChange={(value) => onPeriodChange(Number(value))}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 차트 타입 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">차트:</span>
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          {chartTypeOptions.map((option) => {
            const Icon = option.icon
            return (
              <Button
                key={option.value}
                variant={chartType === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onChartTypeChange(option.value)}
                className={chartType === option.value ? 'shadow-sm' : ''}
              >
                <Icon className="h-4 w-4 mr-1" />
                {option.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


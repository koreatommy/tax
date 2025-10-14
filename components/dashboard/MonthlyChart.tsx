'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthlyStats } from '@/lib/utils/stats-calculator'
import { formatCurrency } from '@/lib/utils/tax-calculator'

interface MonthlyChartProps {
  data: MonthlyStats[]
  chartType?: 'bar' | 'line'
}

/**
 * 월별 통계 차트 컴포넌트
 */
export function MonthlyChart({ data, chartType = 'bar' }: MonthlyChartProps) {
  // 차트 데이터 변환
  const chartData = useMemo(() => {
    return data.map((stat) => ({
      month: stat.monthLabel.replace('년 ', '/').replace('월', ''),
      지급건수: stat.paymentCount,
      영수증: stat.receiptCount,
      총지급액: Math.round(stat.totalAmount / 10000), // 만원 단위
      총세액: Math.round(stat.totalTax / 10000),
      실지급액: Math.round(stat.netAmount / 10000),
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('액') ? `${formatCurrency(entry.value * 10000)}` : `${entry.value}건`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* 지급건수 및 영수증 차트 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">월별 지급건수 및 영수증 발급</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="지급건수" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="영수증" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="지급건수" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="영수증" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 지급액 차트 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">
            월별 지급액 추이 <span className="text-sm text-gray-500 dark:text-gray-400">(단위: 만원)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="총지급액" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="총세액" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="실지급액" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="총지급액" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="총세액" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="실지급액" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


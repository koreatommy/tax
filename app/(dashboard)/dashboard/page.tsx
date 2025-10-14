'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { Payment } from '@/types'
import { MemoList } from '@/components/memos/MemoList'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { DailyChart } from '@/components/dashboard/DailyChart'
import { StatsToggle, ViewType, ChartType } from '@/components/dashboard/StatsToggle'
import { calculateDailyStats, calculateMonthlyStats } from '@/lib/utils/stats-calculator'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    payees: 0,
    payments: 0,
    receipts: 0,
    totalAmount: 0,
    totalTax: 0,
  })
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // 차트 설정 상태
  const [viewType, setViewType] = useState<ViewType>('monthly')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [period, setPeriod] = useState<number>(6) // 기본값: 월별 6개월

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [payeesRes, paymentsRes, receiptsRes] = await Promise.all([
        fetch('/api/payees'),
        fetch('/api/payments'),
        fetch('/api/receipts'),
      ])

      const [payeesData, paymentsData, receiptsData] = await Promise.all([
        payeesRes.json(),
        paymentsRes.json(),
        receiptsRes.json(),
      ])

      const paymentsArray = paymentsData.data || []
      const totalAmount = paymentsArray.reduce((sum: number, p: Payment) => sum + (p.payment_amount || 0), 0)
      const totalTax = paymentsArray.reduce((sum: number, p: Payment) => sum + (p.total_tax || 0), 0)

      setPayments(paymentsArray)
      setStats({
        payees: payeesData.data?.length || 0,
        payments: paymentsArray.length,
        receipts: receiptsData.data?.length || 0,
        totalAmount,
        totalTax,
      })
    } catch (error) {
      console.error('Dashboard stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 일별/월별 통계 계산
  const dailyStats = useMemo(() => calculateDailyStats(payments, period), [payments, period])
  const monthlyStats = useMemo(() => calculateMonthlyStats(payments, period), [payments, period])

  // ViewType 변경 시 기본 기간 및 차트 타입 설정
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type)
    if (type === 'daily') {
      setPeriod(30) // 일별 기본값: 30일
      setChartType('area') // 일별 기본 차트: area
    } else {
      setPeriod(6) // 월별 기본값: 6개월
      setChartType('bar') // 월별 기본 차트: bar
    }
  }

  const statCards = [
    {
      title: '지급 대상자',
      value: `${stats.payees}건`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      title: '지급 건수',
      value: `${stats.payments}건`,
      icon: CreditCard,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      title: '발급 영수증',
      value: `${stats.receipts}건`,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      title: '총 지급액',
      value: formatCurrency(stats.totalAmount),
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">대시보드</h1>
        <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
          원천징수 관리 시스템 현황을 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 통계 그래프 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">지급관리 통계</h2>
        </div>

        {/* 차트 설정 토글 */}
        <StatsToggle
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          chartType={chartType}
          onChartTypeChange={setChartType}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* 차트 렌더링 */}
        {viewType === 'daily' ? (
          <DailyChart data={dailyStats} chartType={chartType as 'area' | 'line'} />
        ) : (
          <MonthlyChart data={monthlyStats} chartType={chartType as 'bar' | 'line'} />
        )}
      </div>

      {/* 세액 요약 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">세액 요약</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">총 지급액</span>
              <span className="text-base md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">총 원천징수세액 (3.3%)</span>
              <span className="text-base md:text-xl font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalTax)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-blue-50 dark:bg-blue-900/20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 md:py-4 -mb-4 md:-mb-6 rounded-b-lg">
              <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">실지급액</span>
              <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalAmount - stats.totalTax)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메모 */}
      <MemoList />

      {/* 시작 가이드 */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-200 mb-3">시작하기</h3>
          <ol className="space-y-2 md:space-y-2.5">
            {[
              '설정에서 회사 정보를 등록하세요',
              '지급 대상자를 등록하세요 (프리랜서, 강사 등)',
              '지급 내역을 입력하면 세액이 자동 계산됩니다 (3.3%)',
              '원천징수영수증을 생성하고 PDF로 다운로드하세요'
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-2 md:gap-3">
                <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-xs md:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
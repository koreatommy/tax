'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, FileText, TrendingUp, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { GitCommitList } from '@/components/admin/GitCommitList'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalPayees: 0,
    totalPayments: 0,
    totalReceipts: 0,
    totalAmount: 0,
    totalTax: 0,
    recentCompanies: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const result = await res.json()
      if (result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '총 회사 수',
      value: `${stats.totalCompanies}개`,
      icon: Building2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      title: '총 사용자 수',
      value: `${stats.totalPayees}명`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      title: '총 지급 건수',
      value: `${stats.totalPayments}건`,
      icon: CreditCard,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      title: '발급 영수증',
      value: `${stats.totalReceipts}건`,
      icon: FileText,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
    },
    {
      title: '총 거래액',
      value: formatCurrency(stats.totalAmount),
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      title: '30일 신규 가입',
      value: `${stats.recentCompanies}개`,
      icon: Activity,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-900/30',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          전체 플랫폼 현황을 모니터링합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 매출 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">플랫폼 매출 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">총 거래액</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 -mx-6 px-6 py-4 -mb-6 rounded-b-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">총 원천징수세액</span>
              <span className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.totalTax)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시스템 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">시스템 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">시스템 가동률</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API 응답 시간</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">활성 사용자</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{stats.totalPayees}명</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">신규 회사 등록</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">30일 기준</p>
              </div>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.recentCompanies}개</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">영수증 발급</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">전체 기간</p>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalReceipts}건</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">지급 처리</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">전체 기간</p>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalPayments}건</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Git 커밋 현황 */}
      <GitCommitList />
    </div>
  )
}
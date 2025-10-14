/**
 * 통계 계산 유틸리티 함수
 */

import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Payment } from '@/types'

/**
 * 일별 통계 데이터
 */
export interface DailyStats {
  date: string // YYYY-MM-DD
  dateLabel: string // MM/DD
  paymentCount: number
  receiptCount: number
  totalAmount: number
  totalTax: number
  netAmount: number
}

/**
 * 월별 통계 데이터
 */
export interface MonthlyStats {
  month: string // YYYY-MM
  monthLabel: string // YYYY년 MM월
  paymentCount: number
  receiptCount: number
  totalAmount: number
  totalTax: number
  netAmount: number
}

/**
 * 일별 통계 계산
 * @param payments 전체 지급 데이터
 * @param days 과거 며칠간의 통계 (기본 30일)
 */
export function calculateDailyStats(payments: Payment[], days: number = 30): DailyStats[] {
  const today = new Date()
  const dailyMap = new Map<string, DailyStats>()

  // 날짜 범위 초기화 (과거 N일)
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i)
    const dateKey = format(date, 'yyyy-MM-dd')
    const dateLabel = format(date, 'MM/dd')

    dailyMap.set(dateKey, {
      date: dateKey,
      dateLabel,
      paymentCount: 0,
      receiptCount: 0,
      totalAmount: 0,
      totalTax: 0,
      netAmount: 0,
    })
  }

  // 지급 데이터 집계
  payments.forEach((payment) => {
    const dateKey = format(new Date(payment.payment_date), 'yyyy-MM-dd')
    const stats = dailyMap.get(dateKey)

    if (stats) {
      stats.paymentCount += 1
      stats.receiptCount += payment.receipt_issued ? 1 : 0
      stats.totalAmount += payment.payment_amount
      stats.totalTax += payment.total_tax
      stats.netAmount += payment.net_amount
    }
  })

  // 배열로 변환 (날짜순 정렬)
  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 월별 통계 계산
 * @param payments 전체 지급 데이터
 * @param months 과거 몇 개월간의 통계 (기본 12개월)
 */
export function calculateMonthlyStats(payments: Payment[], months: number = 12): MonthlyStats[] {
  const today = new Date()
  const monthlyMap = new Map<string, MonthlyStats>()

  // 월 범위 초기화 (과거 N개월)
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(today, i)
    const monthKey = format(date, 'yyyy-MM')
    const [year, month] = monthKey.split('-')
    const monthLabel = `${year}년 ${month}월`

    monthlyMap.set(monthKey, {
      month: monthKey,
      monthLabel,
      paymentCount: 0,
      receiptCount: 0,
      totalAmount: 0,
      totalTax: 0,
      netAmount: 0,
    })
  }

  // 지급 데이터 집계
  payments.forEach((payment) => {
    const monthKey = format(new Date(payment.payment_date), 'yyyy-MM')
    const stats = monthlyMap.get(monthKey)

    if (stats) {
      stats.paymentCount += 1
      stats.receiptCount += payment.receipt_issued ? 1 : 0
      stats.totalAmount += payment.payment_amount
      stats.totalTax += payment.total_tax
      stats.netAmount += payment.net_amount
    }
  })

  // 배열로 변환 (월순 정렬)
  return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * 현재 월 통계 계산
 */
export function calculateCurrentMonthStats(payments: Payment[]) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.payment_date)
    return paymentDate >= monthStart && paymentDate <= monthEnd
  })

  return {
    paymentCount: currentMonthPayments.length,
    receiptCount: currentMonthPayments.filter((p) => p.receipt_issued).length,
    totalAmount: currentMonthPayments.reduce((sum, p) => sum + p.payment_amount, 0),
    totalTax: currentMonthPayments.reduce((sum, p) => sum + p.total_tax, 0),
    netAmount: currentMonthPayments.reduce((sum, p) => sum + p.net_amount, 0),
  }
}

/**
 * 이전 월 통계 계산
 */
export function calculatePreviousMonthStats(payments: Payment[]) {
  const now = new Date()
  const prevMonth = subMonths(now, 1)
  const monthStart = startOfMonth(prevMonth)
  const monthEnd = endOfMonth(prevMonth)

  const prevMonthPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.payment_date)
    return paymentDate >= monthStart && paymentDate <= monthEnd
  })

  return {
    paymentCount: prevMonthPayments.length,
    receiptCount: prevMonthPayments.filter((p) => p.receipt_issued).length,
    totalAmount: prevMonthPayments.reduce((sum, p) => sum + p.payment_amount, 0),
    totalTax: prevMonthPayments.reduce((sum, p) => sum + p.total_tax, 0),
    netAmount: prevMonthPayments.reduce((sum, p) => sum + p.net_amount, 0),
  }
}

/**
 * 증감률 계산
 * @param current 현재 값
 * @param previous 이전 값
 * @returns 증감률 (%) - 소수점 1자리
 */
export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/**
 * 평균 지급액 계산
 */
export function calculateAverageAmount(payments: Payment[]): number {
  if (payments.length === 0) return 0
  const total = payments.reduce((sum, p) => sum + p.payment_amount, 0)
  return Math.round(total / payments.length)
}


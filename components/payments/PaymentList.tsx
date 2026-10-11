'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, FileText, Eye, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { Payment } from '@/types'
import { PaymentFilters } from './PaymentFilters'
import { PaymentSummaryCard } from './PaymentSummaryCard'
import { PayeeAccountDialog, type PayeeAccountTarget } from './PayeeAccountDialog'

type PaymentWithPayee = Payment & {
  payee?: { name: string; business_type: string; bank_name: string | null }
}

export function PaymentList() {
  const [payments, setPayments] = useState<PaymentWithPayee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [searchName, setSearchName] = useState('')
  const [searchReason, setSearchReason] = useState('')
  const [accountTarget, setAccountTarget] = useState<PayeeAccountTarget | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      const result = await res.json()
      
      if (result.data) {
        setPayments(result.data)
      }
    } catch (error) {
      toast.error('데이터 조회 실패')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        toast.error('삭제 실패')
        return
      }

      toast.success('삭제되었습니다')
      fetchPayments()
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다')
      console.error(error)
    }
  }

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '영수증 생성 실패')
        return
      }

      toast.success('영수증이 생성되었습니다')
      fetchPayments()
    } catch (error) {
      toast.error('영수증 생성 중 오류가 발생했습니다')
      console.error(error)
    }
  }

  // 월별 옵션 생성 (실제 데이터에서 추출)
  const monthOptions = useMemo(() => {
    // 모든 지급 데이터에서 고유한 연월 추출
    const uniqueMonths = new Set<string>()
    payments.forEach((payment) => {
      const month = format(new Date(payment.payment_date), 'yyyy-MM')
      uniqueMonths.add(month)
    })

    // 정렬 (최신순)
    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a))

    // 옵션 객체로 변환
    return sortedMonths.map((month) => {
      const [year, monthNum] = month.split('-')
      const label = `${year}년 ${monthNum}월`
      return { value: month, label }
    })
  }, [payments])

  // 필터링된 지급 내역
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // 월별 필터
      if (selectedMonth !== 'all') {
        const paymentMonth = format(new Date(payment.payment_date), 'yyyy-MM')
        if (paymentMonth !== selectedMonth) return false
      }

      // 대상자 이름 필터
      if (searchName) {
        const name = payment.payee?.name?.toLowerCase() || ''
        if (!name.includes(searchName.toLowerCase())) return false
      }

      // 지급사유 필터
      if (searchReason) {
        const reason = payment.payment_reason?.toLowerCase() || ''
        if (!reason.includes(searchReason.toLowerCase())) return false
      }

      return true
    })
  }, [payments, selectedMonth, searchName, searchReason])

  // 필터링된 리스트의 합산 계산
  const summary = useMemo(() => {
    return filteredPayments.reduce(
      (acc, payment) => ({
        totalPaymentAmount: acc.totalPaymentAmount + (payment.payment_amount || 0),
        totalTax: acc.totalTax + (payment.total_tax || 0),
        totalNetAmount: acc.totalNetAmount + (payment.net_amount || 0),
      }),
      { totalPaymentAmount: 0, totalTax: 0, totalNetAmount: 0 }
    )
  }, [filteredPayments])

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedMonth('all')
    setSearchName('')
    setSearchReason('')
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          총 {filteredPayments.length}건의 지급 내역 {payments.length !== filteredPayments.length && `(전체 ${payments.length}건)`}
        </div>
        <Link href="/dashboard/payments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            신규 지급
          </Button>
        </Link>
      </div>

      <PaymentFilters
        monthOptions={monthOptions}
        selectedMonth={selectedMonth}
        searchName={searchName}
        searchReason={searchReason}
        onMonthChange={setSelectedMonth}
        onNameChange={setSearchName}
        onReasonChange={setSearchReason}
        onReset={handleResetFilters}
      />

      {filteredPayments.length > 0 && <PaymentSummaryCard {...summary} />}

      {/* 테이블 */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {payments.length === 0 ? '등록된 지급 내역이 없습니다' : '조건에 맞는 지급 내역이 없습니다'}
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>지급일자</TableHead>
                <TableHead>대상자</TableHead>
                <TableHead>지급사유</TableHead>
                <TableHead>지급액</TableHead>
                <TableHead>세액</TableHead>
                <TableHead>실지급액</TableHead>
                <TableHead>계좌번호</TableHead>
                <TableHead>영수증</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.payment_date), 'yyyy-MM-dd', { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.payee?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{payment.payee?.business_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={payment.payment_reason || '-'}>
                      {payment.payment_reason || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payment.payment_amount)}
                  </TableCell>
                  <TableCell className="font-mono text-red-600 dark:text-red-400">
                    {formatCurrency(payment.total_tax)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(payment.net_amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAccountTarget({
                          payeeId: payment.payee_id,
                          payeeName: payment.payee?.name ?? '',
                          paymentDate: payment.payment_date,
                          netAmount: payment.net_amount,
                        })
                      }
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      {payment.payee?.bank_name || '계좌 보기'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {payment.receipt_issued ? (
                      <Badge variant="default">발급완료</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReceipt(payment.id)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        생성
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/payments/${payment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PayeeAccountDialog target={accountTarget} onClose={() => setAccountTarget(null)} />
    </div>
  )
}

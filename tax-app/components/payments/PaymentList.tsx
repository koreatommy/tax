'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Eye, Edit, Trash2, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/tax-calculator'

export function PaymentList() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [searchName, setSearchName] = useState('')
  const [searchReason, setSearchReason] = useState('')

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

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedMonth('all')
    setSearchName('')
    setSearchReason('')
  }

  const hasActiveFilters = selectedMonth !== 'all' || searchName !== '' || searchReason !== ''

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

      {/* 필터 영역 */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* 월별 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">지급월:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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

        {/* 대상자 검색 */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">대상자:</span>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="이름으로 검색..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 지급사유 검색 */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">지급사유:</span>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="지급사유 검색..."
              value={searchReason}
              onChange={(e) => setSearchReason(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 필터 초기화 버튼 */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

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
    </div>
  )
}

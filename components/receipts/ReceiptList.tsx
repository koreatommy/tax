'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Download, Mail, Search, X, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { Receipt } from '@/types'

export function ReceiptList() {
  const [receipts, setReceipts] = useState<(Receipt & { payment?: { payment_date: string, payment_reason?: string, payment_amount: number, net_amount: number }, payee?: { name: string, business_type: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [searchName, setSearchName] = useState('')
  const [searchReason, setSearchReason] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/receipts')
      const result = await res.json()
      
      if (result.data) {
        setReceipts(result.data)
      }
    } catch (error) {
      toast.error('데이터 조회 실패')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 월별 옵션 생성 (실제 데이터에서 추출)
  const monthOptions = useMemo(() => {
    // 모든 영수증 데이터에서 고유한 연월 추출
    const uniqueMonths = new Set<string>()
    receipts.forEach((receipt) => {
      if (receipt.payment?.payment_date) {
        const month = format(new Date(receipt.payment.payment_date), 'yyyy-MM')
        uniqueMonths.add(month)
      }
    })

    // 정렬 (최신순)
    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a))

    // 옵션 객체로 변환
    return sortedMonths.map((month) => {
      const [year, monthNum] = month.split('-')
      const label = `${year}년 ${monthNum}월`
      return { value: month, label }
    })
  }, [receipts])

  // 필터링된 영수증 내역
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      // 월별 필터
      if (selectedMonth !== 'all') {
        if (receipt.payment?.payment_date) {
          const paymentMonth = format(new Date(receipt.payment.payment_date), 'yyyy-MM')
          if (paymentMonth !== selectedMonth) return false
        }
      }

      // 대상자 이름 필터
      if (searchName) {
        const name = receipt.payee?.name?.toLowerCase() || ''
        if (!name.includes(searchName.toLowerCase())) return false
      }

      // 지급사유 필터
      if (searchReason) {
        const reason = receipt.payment?.payment_reason?.toLowerCase() || ''
        if (!reason.includes(searchReason.toLowerCase())) return false
      }

      return true
    })
  }, [receipts, selectedMonth, searchName, searchReason])

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedMonth('all')
    setSearchName('')
    setSearchReason('')
  }

  // 엑셀 다운로드 함수
  const handleExcelDownload = async () => {
    if (filteredReceipts.length === 0) {
      toast.error('다운로드할 데이터가 없습니다')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch('/api/receipts/export')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '다운로드 실패')
      }

      // 파일 다운로드
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('content-disposition')
      let fileName = `원천징수영수증_${new Date().toISOString().split('T')[0]}.xlsx`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1])
        }
      }
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('엑셀 파일이 다운로드되었습니다')
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error)
      toast.error(error instanceof Error ? error.message : '다운로드 실패')
    } finally {
      setIsDownloading(false)
    }
  }

  const hasActiveFilters = selectedMonth !== 'all' || searchName !== '' || searchReason !== ''

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-gray-100">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          총 {filteredReceipts.length}건의 영수증 {receipts.length !== filteredReceipts.length && `(전체 ${receipts.length}건)`}
        </div>
        
        {/* 엑셀 다운로드 버튼 */}
        {filteredReceipts.length > 0 && (
          <Button 
            onClick={handleExcelDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isDownloading ? '다운로드 중...' : '엑셀 다운로드'}
          </Button>
        )}
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
      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {receipts.length === 0 ? '발급된 영수증이 없습니다' : '조건에 맞는 영수증이 없습니다'}
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>영수증 번호</TableHead>
                <TableHead>지급 대상자</TableHead>
                <TableHead>지급일자</TableHead>
                <TableHead>지급사유</TableHead>
                <TableHead>지급액</TableHead>
                <TableHead>실지급액</TableHead>
                <TableHead>이메일 발송</TableHead>
                <TableHead>발급일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono font-medium">
                    {receipt.receipt_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{receipt.payee?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {receipt.payee?.business_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {receipt.payment?.payment_date ? format(new Date(receipt.payment.payment_date), 'yyyy-MM-dd', { locale: ko }) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={receipt.payment?.payment_reason || '-'}>
                      {receipt.payment?.payment_reason || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(receipt.payment?.payment_amount || 0)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(receipt.payment?.net_amount || 0)}
                  </TableCell>
                  <TableCell>
                    {receipt.email_sent ? (
                      <Badge variant="default">발송완료</Badge>
                    ) : (
                      <Badge variant="outline">미발송</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {receipt.created_at ? format(new Date(receipt.created_at), 'yyyy-MM-dd HH:mm', { locale: ko }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/receipts/${receipt.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" title="PDF 다운로드">
                        <Download className="h-4 w-4" />
                      </Button>
                      {!receipt.email_sent && (
                        <Button variant="ghost" size="sm" title="이메일 발송">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
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

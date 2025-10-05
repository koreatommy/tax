'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

// 임시 데이터 - 영수증 미발급 지급 건들
const TEMP_PAYMENTS = [
  {
    id: '2',
    payeeId: '2',
    payeeName: '이영희',
    paymentDate: '2024-10-05',
    paymentAmount: 500000,
    totalTax: 16500,
    netAmount: 483500,
  },
  {
    id: '3',
    payeeId: '1',
    payeeName: '김철수',
    paymentDate: '2024-10-10',
    paymentAmount: 1500000,
    totalTax: 49500,
    netAmount: 1450500,
  },
]

export default function GenerateReceiptsPage() {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(TEMP_PAYMENTS.map(p => p.id))
    } else {
      setSelectedPayments([])
    }
  }

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId])
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId))
    }
  }

  const handleGenerate = async () => {
    if (selectedPayments.length === 0) {
      toast.error('발급할 지급 건을 선택해주세요')
      return
    }

    setIsGenerating(true)

    try {
      // TODO: API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`${selectedPayments.length}건의 영수증이 발급되었습니다`)
      // router.push(ROUTES.RECEIPTS.LIST)
    } catch (error) {
      toast.error('영수증 발급 중 오류가 발생했습니다')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedCount = selectedPayments.length
  const totalAmount = TEMP_PAYMENTS
    .filter(p => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.paymentAmount, 0)
  const totalTax = TEMP_PAYMENTS
    .filter(p => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.totalTax, 0)

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.RECEIPTS.LIST}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">영수증 일괄 생성</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            영수증이 발급되지 않은 지급 건을 선택하여 일괄로 발급할 수 있습니다
          </p>
        </div>
      </div>

      {TEMP_PAYMENTS.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              영수증을 발급할 지급 건이 없습니다
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              모든 지급 건에 대해 영수증이 발급되었습니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 선택 요약 */}
          {selectedCount > 0 && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">선택된 건수</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedCount}건
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">총 지급액</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">총 원천징수세액</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(totalTax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 지급 목록 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-gray-100">미발급 지급 내역</CardTitle>
                <Button
                  onClick={handleGenerate}
                  disabled={selectedCount === 0 || isGenerating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGenerating
                    ? `발급 중... (${selectedCount}건)`
                    : `선택 항목 발급 (${selectedCount}건)`
                  }
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPayments.length === TEMP_PAYMENTS.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>대상자</TableHead>
                      <TableHead>지급일자</TableHead>
                      <TableHead className="text-right">지급액</TableHead>
                      <TableHead className="text-right">원천징수세액</TableHead>
                      <TableHead className="text-right">실지급액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TEMP_PAYMENTS.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPayments.includes(payment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectPayment(payment.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.payeeName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.paymentDate), 'yyyy-MM-dd', { locale: ko })}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(payment.paymentAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(payment.totalTax)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-blue-600">
                          {formatCurrency(payment.netAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 안내사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">발급 안내</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>영수증은 PDF 형식으로 생성됩니다</li>
                <li>발급된 영수증은 다운로드하거나 이메일로 발송할 수 있습니다</li>
                <li>영수증 번호는 자동으로 생성됩니다</li>
                <li>발급 후에는 영수증 목록에서 확인할 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface PaymentFormProps {
  payment?: any
  onSuccess?: () => void
}

export function PaymentForm({ payment, onSuccess }: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [payees, setPayees] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPayee, setSelectedPayee] = useState<any>(null)
  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    payee_id: payment?.payee_id || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    payment_amount: payment?.payment_amount || '',
    payment_reason: payment?.payment_reason || '',
  })

  const [taxCalculation, setTaxCalculation] = useState({
    incomeTax: 0,
    localIncomeTax: 0,
    totalTax: 0,
    netAmount: 0,
  })

  useEffect(() => {
    fetchPayees()
  }, [])

  useEffect(() => {
    if (formData.payment_amount) {
      const amount = parseFloat(formData.payment_amount)
      if (!isNaN(amount)) {
        const incomeTax = Math.round(amount * 0.03)
        const localIncomeTax = Math.round(amount * 0.003)
        const totalTax = incomeTax + localIncomeTax
        const netAmount = amount - totalTax

        setTaxCalculation({ incomeTax, localIncomeTax, totalTax, netAmount })
      }
    }
  }, [formData.payment_amount])

  const fetchPayees = async () => {
    try {
      const res = await fetch('/api/payees')
      const result = await res.json()
      if (result.data) {
        const activePayees = result.data.filter((p: any) => p.is_active)
        setPayees(activePayees)
        
        // 수정 모드일 경우 선택된 대상자 설정
        if (payment?.payee_id) {
          const preSelected = activePayees.find((p: any) => p.id === payment.payee_id)
          setSelectedPayee(preSelected)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 검색 필터링
  const filteredPayees = payees.filter((payee) =>
    payee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payee.business_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 페이지네이션
  const totalPages = Math.ceil(filteredPayees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPayees = filteredPayees.slice(startIndex, endIndex)

  // 검색어 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSelectPayee = (payee: any) => {
    setSelectedPayee(payee)
    setFormData({ ...formData, payee_id: payee.id })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = payment ? `/api/payments/${payment.id}` : '/api/payments'
      const method = payment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '저장 실패')
        return
      }

      toast.success(payment ? '수정되었습니다' : '등록되었습니다')
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/payments')
        router.refresh()
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 지급 대상자 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>지급 대상자 선택</CardTitle>
          <CardDescription>
            지급 대상자를 선택하세요 {!payment && <span className="text-red-500">*</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 선택된 대상자 표시 */}
          {selectedPayee && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="font-semibold text-gray-900">{selectedPayee.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({selectedPayee.business_type})</span>
                </div>
              </div>
              {!payment && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPayee(null)
                    setFormData({ ...formData, payee_id: '' })
                  }}
                >
                  변경
                </Button>
              )}
            </div>
          )}

          {/* 대상자 리스트 (선택 전 또는 변경 시) */}
          {!selectedPayee && (
            <div className="space-y-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="이름 또는 사업자 유형으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 리스트 */}
              {currentPayees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">번호</TableHead>
                        <TableHead>성명</TableHead>
                        <TableHead>사업자 유형</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>이메일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPayees.map((payee, index) => (
                        <TableRow
                          key={payee.id}
                          onClick={() => !payment && handleSelectPayee(payee)}
                          className={`
                            ${!payment ? 'cursor-pointer hover:bg-blue-50' : 'cursor-not-allowed opacity-50'}
                          `}
                        >
                          <TableCell className="text-center font-medium text-gray-600">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell className="font-semibold">{payee.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payee.business_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payee.contact || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payee.email || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    전체 {filteredPayees.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredPayees.length)}명 표시
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          type="button"
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[32px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 지급 정보 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>지급 등록</CardTitle>
          <CardDescription>
            지급 정보를 입력하면 세액이 자동으로 계산됩니다 (3.3%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_date">
                지급일자 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payment_date"
                name="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_amount">
                지급액 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payment_amount"
                name="payment_amount"
                type="number"
                placeholder="1000000"
                value={formData.payment_amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_reason">지급 사유</Label>
            <Input
              id="payment_reason"
              name="payment_reason"
              placeholder="예: 2024년 10월 프로젝트 개발비"
              value={formData.payment_reason}
              onChange={handleChange}
            />
          </div>

          {/* 세액 계산 결과 */}
          {formData.payment_amount && (
            <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
              <h3 className="font-semibold text-sm">세액 계산</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">지급액</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.payment_amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">소득세 (3%)</span>
                  <span className="text-red-600">{formatCurrency(taxCalculation.incomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">지방소득세 (0.3%)</span>
                  <span className="text-red-600">{formatCurrency(taxCalculation.localIncomeTax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">총 세액 (3.3%)</span>
                  <span className="font-semibold text-red-600">{formatCurrency(taxCalculation.totalTax)}</span>
                </div>
                <div className="flex justify-between bg-blue-50 p-2 rounded">
                  <span className="font-bold">실지급액</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(taxCalculation.netAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading || !selectedPayee}>
              {loading ? '저장 중...' : payment ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BANKS, PayeeWithDecrypted } from '@/types'

const BUSINESS_TYPES = ['프리랜서', '강사', '외주직원', '컨설턴트', '기타']

interface PayeeFormProps {
  payee?: PayeeWithDecrypted
  onSuccess?: () => void
}

export function PayeeForm({ payee, onSuccess }: PayeeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCustomBankInput, setShowCustomBankInput] = useState(false)
  const [customBankName, setCustomBankName] = useState('')
  const [formData, setFormData] = useState({
    name: payee?.name || '',
    resident_number: payee?.resident_number || '',
    address: payee?.address || '',
    contact: payee?.contact || '',
    email: payee?.email || '',
    bank_name: payee?.bank_name || '',
    account_number: payee?.account_number || '',
    business_type: payee?.business_type || '',
    contract_start_date: payee?.contract_start_date || '',
    contract_end_date: payee?.contract_end_date || '',
  })

  // 수정 모드에서 기존 은행명이 리스트에 없는 경우 처리
  useEffect(() => {
    if (payee && payee.bank_name && !BANKS.includes(payee.bank_name as any)) {
      setFormData({ ...formData, bank_name: '기타(직접입력)' })
      setCustomBankName(payee.bank_name)
      setShowCustomBankInput(true)
    }
  }, [payee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = payee ? `/api/payees/${payee.id}` : '/api/payees'
      const method = payee ? 'PUT' : 'POST'

      // 기타(직접입력) 선택 시 customBankName 사용
      const submitData = {
        ...formData,
        bank_name: formData.bank_name === '기타(직접입력)' ? customBankName : formData.bank_name,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '저장 실패')
        return
      }

      toast.success(payee ? '수정되었습니다' : '등록되었습니다')
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/payees')
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
    <Card>
      <CardHeader>
        <CardTitle>{payee ? '지급 대상자 수정' : '지급 대상자 등록'}</CardTitle>
        <CardDescription>
          프리랜서, 강사, 외주직원 등의 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                성명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">
                사업자 유형 <span className="text-red-500">*</span>
              </Label>
              <Select
                name="business_type"
                value={formData.business_type}
                onValueChange={(value) => setFormData({ ...formData, business_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resident_number">
              주민등록번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="resident_number"
              name="resident_number"
              placeholder="900101-1234567"
              value={formData.resident_number}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500">암호화되어 안전하게 저장됩니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact">
                연락처 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact"
                name="contact"
                placeholder="010-1234-5678"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank_name">은행명</Label>
              <Select
                name="bank_name"
                value={formData.bank_name}
                onValueChange={(value) => {
                  setFormData({ ...formData, bank_name: value })
                  setShowCustomBankInput(value === '기타(직접입력)')
                  if (value !== '기타(직접입력)') {
                    setCustomBankName('')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="은행을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomBankInput && (
                <Input
                  id="custom_bank_name"
                  placeholder="은행명을 입력하세요"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">계좌번호</Label>
              <Input
                id="account_number"
                name="account_number"
                placeholder="110-123-456789"
                value={formData.account_number}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">암호화되어 안전하게 저장됩니다</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_start_date">계약 시작일</Label>
              <Input
                id="contract_start_date"
                name="contract_start_date"
                type="date"
                value={formData.contract_start_date}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_end_date">계약 종료일</Label>
              <Input
                id="contract_end_date"
                name="contract_end_date"
                type="date"
                value={formData.contract_end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : payee ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
